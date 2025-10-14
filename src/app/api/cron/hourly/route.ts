import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendCheckInReminder, sendReleaseNotification } from '@/lib/email';

/**
 * GET /api/cron/hourly
 *
 * Hourly cron job that:
 * 1. Checks for overdue heartbeats and triggers releases
 * 2. Checks for time-lock releases that have passed
 * 3. Sends check-in reminders (3 days before deadline)
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

    // 3. Send check-in reminders (3 days before deadline)
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
      const daysUntil = Math.ceil(
        (new Date(heartbeat.nextHeartbeat!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      await sendCheckInReminder(heartbeat.user.email, daysUntil, heartbeat.user.name);
      remindersSent++;
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
      await sendReleaseNotification(
        trustee.email,
        trustee.name,
        bundle.user.email,
        bundle.name,
        releaseToken,
        bundle.bundleItems.length
      );

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
