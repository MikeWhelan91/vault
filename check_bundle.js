const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function checkBundle() {
  const bundles = await prisma.releaseBundle.findMany({
    where: {
      name: {
        contains: 'Mikes Will',
        mode: 'insensitive'
      }
    },
    include: {
      trustees: true,
      user: true
    }
  });

  console.log('\n=== Bundle Details ===');
  bundles.forEach(bundle => {
    console.log(`Name: ${bundle.name}`);
    console.log(`Mode: ${bundle.mode}`);
    console.log(`Released: ${bundle.released}`);
    console.log(`Release Date: ${bundle.releaseDate}`);
    console.log(`Created At: ${bundle.createdAt}`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Trustees:`, bundle.trustees.map(t => `${t.name} (${t.email})`));
    console.log(`Notified:`, bundle.trustees.map(t => t.notified));
    console.log('---');
  });
  
  await prisma.$disconnect();
}

checkBundle().catch(console.error);
