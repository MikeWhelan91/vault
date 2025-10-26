const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking Heartbeat Configuration ===\n');

  // Get all heartbeats
  const heartbeats = await prisma.heartbeat.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`Found ${heartbeats.length} heartbeat configuration(s):\n`);

  for (const hb of heartbeats) {
    console.log(`User: ${hb.user.email}`);
    console.log(`Enabled: ${hb.enabled}`);
    console.log(`Cadence: ${hb.cadenceDays} days`);
    console.log(`Last Heartbeat: ${hb.lastHeartbeat}`);
    console.log(`Next Heartbeat: ${hb.nextHeartbeat}`);
    console.log('---');
  }

  console.log('\n=== Checking Heartbeat Bundles ===\n');

  // Get all heartbeat bundles
  const bundles = await prisma.releaseBundle.findMany({
    where: {
      mode: 'heartbeat',
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      trustees: true,
      bundleItems: true,
    },
  });

  console.log(`Found ${bundles.length} heartbeat bundle(s):\n`);

  for (const bundle of bundles) {
    console.log(`Bundle: ${bundle.name} (ID: ${bundle.id})`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Cadence: ${bundle.heartbeatCadenceDays} days`);
    console.log(`Released: ${bundle.released}`);
    console.log(`Paused: ${bundle.heartbeatPaused}`);
    console.log(`Last Heartbeat: ${bundle.lastHeartbeat}`);
    console.log(`Trustees: ${bundle.trustees.length}`);
    console.log(`Items: ${bundle.bundleItems.length}`);
    console.log(`Created: ${bundle.createdAt}`);
    console.log('---');
  }

  console.log('\n=== Checking Current Time ===\n');
  console.log(`Server time: ${new Date().toISOString()}`);

  // Check if cron would find any overdue heartbeats
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
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`\n=== Overdue Heartbeats (should trigger release) ===\n`);
  console.log(`Found ${overdueHeartbeats.length} overdue heartbeat(s)`);

  for (const hb of overdueHeartbeats) {
    console.log(`User: ${hb.user.email}`);
    console.log(`Next Heartbeat was: ${hb.nextHeartbeat}`);
    console.log(`Hours overdue: ${(now - new Date(hb.nextHeartbeat)) / (1000 * 60 * 60)}`);
    console.log('---');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
