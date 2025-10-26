const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function fixBundle() {
  // Set release date to 1 hour ago so it triggers on next cron run
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const result = await prisma.releaseBundle.updateMany({
    where: {
      name: {
        contains: 'Mikes Will',
        mode: 'insensitive'
      }
    },
    data: {
      releaseDate: oneHourAgo
    }
  });

  console.log(`Updated ${result.count} bundle(s)`);
  console.log(`New release date: ${oneHourAgo}`);
  console.log('\nThe bundle will be released on the next hourly cron run.');
  
  await prisma.$disconnect();
}

fixBundle().catch(console.error);
