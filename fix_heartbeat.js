const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Fixing Heartbeat Configuration ===\n');

  // Find all heartbeat bundles that don't have a corresponding Heartbeat record
  const heartbeatBundles = await prisma.releaseBundle.findMany({
    where: {
      mode: 'heartbeat',
      released: false,
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${heartbeatBundles.length} active heartbeat bundle(s)\n`);

  for (const bundle of heartbeatBundles) {
    console.log(`\nChecking bundle: ${bundle.name}`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Cadence: ${bundle.heartbeatCadenceDays} days`);

    // Check if Heartbeat record exists
    const existingHeartbeat = await prisma.heartbeat.findUnique({
      where: { userId: bundle.userId },
    });

    if (existingHeartbeat) {
      console.log('✓ Heartbeat record already exists');
      console.log(`  Enabled: ${existingHeartbeat.enabled}`);
      console.log(`  Next Heartbeat: ${existingHeartbeat.nextHeartbeat}`);
    } else {
      console.log('✗ Heartbeat record MISSING - Creating now...');

      // Create the heartbeat record based on bundle creation date
      const bundleCreatedAt = new Date(bundle.createdAt);
      const nextHeartbeat = new Date(bundleCreatedAt);
      nextHeartbeat.setDate(nextHeartbeat.getDate() + bundle.heartbeatCadenceDays);

      const heartbeat = await prisma.heartbeat.create({
        data: {
          userId: bundle.userId,
          enabled: true,
          cadenceDays: bundle.heartbeatCadenceDays,
          lastHeartbeat: bundleCreatedAt,
          nextHeartbeat: nextHeartbeat,
        },
      });

      console.log('✓ Created Heartbeat record');
      console.log(`  Last Heartbeat: ${heartbeat.lastHeartbeat}`);
      console.log(`  Next Heartbeat: ${heartbeat.nextHeartbeat}`);

      const now = new Date();
      if (heartbeat.nextHeartbeat < now) {
        const daysOverdue = Math.floor((now - heartbeat.nextHeartbeat) / (1000 * 60 * 60 * 24));
        console.log(`  ⚠ OVERDUE by ${daysOverdue} days - will be processed by next cron run`);
      }
    }
  }

  console.log('\n=== Summary ===\n');

  const now = new Date();
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
          },
        },
      },
    },
  });

  console.log(`Overdue heartbeats: ${overdueHeartbeats.length}`);
  for (const hb of overdueHeartbeats) {
    console.log(`  - ${hb.user.email}: ${hb.user.releaseBundles.length} bundle(s) will be released`);
  }

  console.log('\n✓ Fix complete!');
  console.log('\nNext steps:');
  console.log('1. The hourly cron job will automatically detect and process overdue heartbeats');
  console.log('2. Or you can manually trigger it: gh workflow run "Hourly Cron Job"');
  console.log('3. Or test locally: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/hourly');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
