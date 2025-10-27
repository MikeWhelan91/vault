import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendCheckInReminder, sendReleaseNotification, sendOwnerBundleReleasedNotification } from '@/lib/email';
import { sendPushNotificationToMultipleTokens } from '@/lib/firebase-admin';
import { getRetentionPolicies, type TierName } from '@/lib/pricing';

/**
 * GET /api/cron/hourly
 *
 * Hourly cron job that:
 * 1. Checks for overdue heartbeats and triggers releases
 * 2. Checks for time-lock releases that have passed
 * 3. Sends check-in reminders (3 days and 1 day before deadline)
 *
 * Triggered by GitHub Actions every hour (0 * * * *)
 * Note: GitHub Actions timing may be delayed 5-15 minutes during peak times
 * Secured with CRON_SECRET to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    let remindersSent = 0;
    let heartbeatReleases = 0;
    let timeLockReleases = 0;

    // 1. Check for overdue heartbeat bundles (per-bundle check-ins)
    const overdueHeartbeatBundles = await prisma.releaseBundle.findMany({
      where: {
        mode: 'heartbeat',
        released: false,
        heartbeatPaused: false, // Don't trigger paused bundles
        nextHeartbeat: {
          lt: now,
        },
      },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        trustees: true,
        user: {
          include: {
            pushTokens: true,
          },
        },
      },
    });

    for (const bundle of overdueHeartbeatBundles) {
      await triggerRelease(bundle);
      heartbeatReleases++;
    }

    // 2. Check for expired time-lock releases
    const expiredTimeLocks = await prisma.releaseBundle.findMany({
      where: {
        mode: 'time-lock',
        released: false,
        releaseDate: {
          lte: now,
        },
      },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        trustees: true,
        user: {
          include: {
            pushTokens: true,
          },
        },
      },
    });

    for (const bundle of expiredTimeLocks) {
      await triggerRelease(bundle);
      timeLockReleases++;
    }

    // 3. Send time-lock release reminders (1 day before release)
    const upcomingTimeLocks = await prisma.releaseBundle.findMany({
      where: {
        mode: 'time-lock',
        released: false,
        releaseDate: {
          gte: now,
          lte: oneDayFromNow,
        },
      },
      include: {
        user: {
          include: {
            pushTokens: true,
          },
        },
      },
    });

    for (const bundle of upcomingTimeLocks) {
      const hoursUntil = (new Date(bundle.releaseDate!).getTime() - now.getTime()) / (60 * 60 * 1000);

      // Send reminder at approximately 24 hours before release
      const shouldSendReminder = hoursUntil >= 22 && hoursUntil <= 26; // 24 ± 2 hours

      if (shouldSendReminder) {
        // Send push notification to bundle owner
        if (bundle.user.pushTokens.length > 0) {
          const tokens = bundle.user.pushTokens.map(pt => pt.token);
          await sendPushNotificationToMultipleTokens({
            tokens,
            title: 'Bundle releasing soon',
            body: `"${bundle.name}" will be released to trustees tomorrow`,
            data: {
              type: 'timelock_reminder',
              bundleId: bundle.id,
            },
          });
        }
      }
    }

    // 4. Send per-bundle check-in reminders (3 days and 1 day before deadline)
    const upcomingBundleDeadlines = await prisma.releaseBundle.findMany({
      where: {
        mode: 'heartbeat',
        released: false,
        heartbeatPaused: false,
        nextHeartbeat: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: {
          include: {
            pushTokens: true,
          },
        },
      },
    });

    for (const bundle of upcomingBundleDeadlines) {
      const hoursUntil = (new Date(bundle.nextHeartbeat!).getTime() - now.getTime()) / (60 * 60 * 1000);
      const daysUntil = Math.ceil(hoursUntil / 24);

      // Send reminder at approximately 72 hours (3 days) or 24 hours (1 day)
      // We send if hours are within a 2-hour window of the target (to account for cron running hourly)
      const shouldSend3DayReminder = hoursUntil >= 70 && hoursUntil <= 74; // 72 ± 2 hours
      const shouldSend1DayReminder = hoursUntil >= 22 && hoursUntil <= 26; // 24 ± 2 hours

      if (shouldSend3DayReminder || shouldSend1DayReminder) {
        // Send email reminder with bundle name and ID
        await sendCheckInReminder(bundle.user.email, daysUntil, bundle.user.name, bundle.name, bundle.id);

        // Send push notification to all user's devices (if any)
        if (bundle.user.pushTokens.length > 0) {
          const tokens = bundle.user.pushTokens.map(pt => pt.token);
          await sendPushNotificationToMultipleTokens({
            tokens,
            title: 'Time to check in',
            body: `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left for "${bundle.name}"`,
            data: {
              type: 'bundle_checkin_reminder',
              bundleId: bundle.id,
              bundleName: bundle.name,
              daysUntil: String(daysUntil),
            },
          });
        }

        remindersSent++;
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      heartbeatReleases,
      timeLockReleases,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Trigger a release bundle - mark as released and send emails to trustees and owner
 */
async function triggerRelease(bundle: any) {
  try {
    console.log(`\n=== Triggering Release ===`);
    console.log(`Bundle: ${bundle.name} (ID: ${bundle.id})`);
    console.log(`Mode: ${bundle.mode}`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Trustees: ${bundle.trustees.length}`);
    console.log(`Items: ${bundle.bundleItems.length}`);

    // Generate release token if it doesn't exist
    const releaseToken = bundle.releaseToken || crypto.randomUUID();

    // Get retention policy based on user tier
    const userTier = (bundle.user.tier as TierName) || 'free';
    const retention = getRetentionPolicies(userTier);

    // Calculate deletion date
    const now = new Date();
    const deleteScheduledFor = new Date(now.getTime() + (retention.postReleaseDays * 24 * 60 * 60 * 1000));

    // Mark bundle as released, set release token and deletion date
    await prisma.releaseBundle.update({
      where: { id: bundle.id },
      data: {
        released: true,
        releasedAt: now,
        releaseToken: releaseToken,
        deleteScheduledFor: deleteScheduledFor,
      },
    });

    // Send email to each trustee
    for (const trustee of bundle.trustees) {
      console.log(`Sending release notification to ${trustee.email} for bundle ${bundle.name}`);

      const emailResult = await sendReleaseNotification(
        trustee.email,
        trustee.name,
        bundle.user.email,
        bundle.name,
        releaseToken,
        bundle.bundleItems.length
      );

      if (emailResult.success) {
        console.log(`✓ Email sent successfully to ${trustee.email}`);
      } else {
        console.error(`✗ Failed to send email to ${trustee.email}:`, emailResult.error);
      }

      // Mark trustee as notified
      await prisma.trustee.update({
        where: { id: trustee.id },
        data: { notified: true },
      });
    }

    // Send notification to bundle owner
    console.log(`Sending release notification to owner ${bundle.user.email}`);

    // Send email notification to owner
    const ownerEmailResult = await sendOwnerBundleReleasedNotification(
      bundle.user.email,
      bundle.user.name,
      bundle.name,
      bundle.mode,
      bundle.trustees.length,
      bundle.bundleItems.length
    );

    if (ownerEmailResult.success) {
      console.log(`✓ Owner email sent successfully to ${bundle.user.email}`);
    } else {
      console.error(`✗ Failed to send owner email to ${bundle.user.email}:`, ownerEmailResult.error);
    }

    // Send push notification to owner (if they have the app installed)
    if (bundle.user.pushTokens && bundle.user.pushTokens.length > 0) {
      const tokens = bundle.user.pushTokens.map((pt: any) => pt.token);
      const pushResult = await sendPushNotificationToMultipleTokens({
        tokens,
        title: 'Bundle Released',
        body: `Your bundle "${bundle.name}" has been released to your trustees`,
        data: {
          type: 'bundle_released',
          bundleId: bundle.id,
          bundleName: bundle.name,
          releaseMode: bundle.mode,
        },
      });

      console.log(`✓ Push notification sent to owner (${tokens.length} device${tokens.length > 1 ? 's' : ''})`);
    } else {
      console.log(`ℹ No push tokens registered for owner - skipping push notification`);
    }
  } catch (error) {
    console.error(`Failed to trigger release ${bundle.id}:`, error);
    throw error;
  }
}
