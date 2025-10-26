const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Migrating Existing Heartbeat Bundles ===\n');

  // Find all heartbeat bundles that don't have nextHeartbeat set
  const bundles = await prisma.releaseBundle.findMany({
    where: {
      mode: 'heartbeat',
      nextHeartbeat: null,
    },
  });

  console.log(`Found ${bundles.length} bundle(s) to migrate\n`);

  for (const bundle of bundles) {
    console.log(`Migrating: ${bundle.name} (ID: ${bundle.id})`);
    console.log(`  Cadence: ${bundle.heartbeatCadenceDays} days`);

    // Use lastHeartbeat if available, otherwise use createdAt
    const baseDate = bundle.lastHeartbeat || bundle.createdAt;
    const nextHeartbeat = new Date(baseDate);
    nextHeartbeat.setDate(nextHeartbeat.getDate() + (bundle.heartbeatCadenceDays || 30));

    await prisma.releaseBundle.update({
      where: { id: bundle.id },
      data: {
        lastHeartbeat: bundle.lastHeartbeat || bundle.createdAt,
        nextHeartbeat: nextHeartbeat,
      },
    });

    console.log(`  ✓ Set lastHeartbeat: ${bundle.lastHeartbeat || bundle.createdAt}`);
    console.log(`  ✓ Set nextHeartbeat: ${nextHeartbeat}`);

    const now = new Date();
    if (nextHeartbeat < now) {
      const daysOverdue = Math.floor((now - nextHeartbeat) / (1000 * 60 * 60 * 24));
      console.log(`  ⚠ Bundle is ${daysOverdue} days overdue`);
    } else {
      const daysRemaining = Math.ceil((nextHeartbeat - now) / (1000 * 60 * 60 * 24));
      console.log(`  ✓ ${daysRemaining} days until next check-in`);
    }
    console.log('');
  }

  console.log('✓ Migration complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
