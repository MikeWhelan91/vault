const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  const bundles = await prisma.releaseBundle.findMany({
    where: {
      released: true,
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

  console.log(`Found ${bundles.length} released bundle(s):\n`);

  for (const bundle of bundles) {
    console.log(`Bundle: ${bundle.name}`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Released: ${bundle.released}`);
    console.log(`Release Token: ${bundle.releaseToken}`);
    console.log(`Items: ${bundle.bundleItems.length}`);
    console.log(`Release URL: https://forebearer.app/release/${bundle.releaseToken}`);
    console.log('\nTrustees:');
    for (const trustee of bundle.trustees) {
      console.log(`  - ${trustee.email} (${trustee.name || 'No name'}) - Notified: ${trustee.notified}`);
    }
    console.log('\n---\n');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
