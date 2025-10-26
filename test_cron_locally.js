const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

/**
 * Trigger a release bundle - mark as released and send emails to trustees and owner
 */
async function triggerRelease(bundle) {
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

    console.log(`✓ Bundle marked as released with token: ${releaseToken}`);

    // For local testing, we'll just log what emails would be sent
    console.log(`\nEmails that would be sent:`);
    console.log(`- ${bundle.trustees.length} trustee notification(s)`);
    console.log(`- 1 owner notification`);

    for (const trustee of bundle.trustees) {
      console.log(`  Trustee: ${trustee.email} (${trustee.name || 'No name'})`);

      // Mark trustee as notified
      await prisma.trustee.update({
        where: { id: trustee.id },
        data: { notified: true },
      });
    }

    console.log(`\n✓ Release triggered successfully!`);
    console.log(`Release URL: https://forebearer.app/release/${releaseToken}`);
  } catch (error) {
    console.error(`Failed to trigger release ${bundle.id}:`, error);
    throw error;
  }
}

async function main() {
  console.log('=== Testing Cron Job Locally ===\n');

  const now = new Date();
  console.log(`Current time: ${now.toISOString()}\n`);

  // 1. Check for overdue heartbeats
  console.log('Checking for overdue heartbeats...');
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
          pushTokens: true,
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
              user: true,
            },
          },
        },
      },
    },
  });

  console.log(`Found ${overdueHeartbeats.length} overdue heartbeat(s)\n`);

  let heartbeatReleases = 0;

  for (const heartbeat of overdueHeartbeats) {
    console.log(`\nProcessing overdue heartbeat for: ${heartbeat.user.email}`);
    console.log(`Next heartbeat was: ${heartbeat.nextHeartbeat}`);
    console.log(`Found ${heartbeat.user.releaseBundles.length} bundle(s) to release`);

    // Trigger all heartbeat-mode releases for this user
    for (const bundle of heartbeat.user.releaseBundles) {
      await triggerRelease(bundle);
      heartbeatReleases++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Heartbeat releases: ${heartbeatReleases}`);
  console.log('\n✓ Test complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
