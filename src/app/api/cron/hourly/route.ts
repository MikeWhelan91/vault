import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendCheckInReminder, sendReleaseNotification } from '@/lib/email';

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

    // 1. Check for overdue heartbeats
    const overdueHeartbeats = await prisma.heartbeat.findMany({
      where: {
        enabled: true,
        nextHeartbeat: {
          lt: now,
        },
      },
      include: {
        user: {
          include: {
            releaseBundles: {
              where: {
                mode: 'heartbeat',
                released: false,
              },
              include: {
                bundleItems: {
                  include: {
                    item: true,
                  },
                },
                trustees: true,
              },
            },
          },
        },
      },
    });

    for (const heartbeat of overdueHeartbeats) {
      // Trigger all heartbeat-mode releases for this user
      for (const bundle of heartbeat.user.releaseBundles) {
        await triggerRelease(bundle);
        heartbeatReleases++;
      }
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
        user: true,
      },
    });

    for (const bundle of expiredTimeLocks) {
      await triggerRelease(bundle);
      timeLockReleases++;
    }

    // 3. Send check-in reminders (3 days and 1 day before deadline)
    const upcomingDeadlines = await prisma.heartbeat.findMany({
      where: {
        enabled: true,
        nextHeartbeat: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: true,
      },
    });

    for (const heartbeat of upcomingDeadlines) {
      const hoursUntil = (new Date(heartbeat.nextHeartbeat!).getTime() - now.getTime()) / (60 * 60 * 1000);
      const daysUntil = Math.ceil(hoursUntil / 24);

      // Send reminder at approximately 72 hours (3 days) or 24 hours (1 day)
      // We send if hours are within a 2-hour window of the target (to account for cron running hourly)
      const shouldSend3DayReminder = hoursUntil >= 70 && hoursUntil <= 74; // 72 ± 2 hours
      const shouldSend1DayReminder = hoursUntil >= 22 && hoursUntil <= 26; // 24 ± 2 hours

      if (shouldSend3DayReminder || shouldSend1DayReminder) {
        await sendCheckInReminder(heartbeat.user.email, daysUntil, heartbeat.user.name);
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
 * Trigger a release bundle - mark as released and send emails to trustees
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

    // Mark bundle as released and set release token
    await prisma.releaseBundle.update({
      where: { id: bundle.id },
      data: {
        released: true,
        releaseToken: releaseToken
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
  } catch (error) {
    console.error(`Failed to trigger release ${bundle.id}:`, error);
    throw error;
  }
}
