const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function testCheckInEmail() {
  try {
    // Find the "New Test" bundle
    const bundle = await prisma.releaseBundle.findFirst({
      where: {
        name: 'New Test',
        released: false,
      },
      include: {
        user: true,
      },
    });

    if (!bundle) {
      console.log('❌ No bundle found with name "New Test"');
      return;
    }

    console.log('📦 Found bundle:', bundle.name);
    console.log('Current nextHeartbeat:', bundle.nextHeartbeat);
    console.log('Cadence:', bundle.heartbeatCadenceDays, 'days');

    // Calculate 23 hours from now (will trigger 1-day reminder)
    const now = new Date();
    const twentyThreeHoursFromNow = new Date(now);
    twentyThreeHoursFromNow.setHours(twentyThreeHoursFromNow.getHours() + 23);

    console.log('\n🔧 Updating nextHeartbeat to trigger 1-day reminder...');
    console.log('Setting to:', twentyThreeHoursFromNow.toISOString());

    // Update the bundle
    await prisma.releaseBundle.update({
      where: { id: bundle.id },
      data: {
        nextHeartbeat: twentyThreeHoursFromNow,
        lastHeartbeat: now,
      },
    });

    console.log('\n✅ Bundle updated!');
    console.log('Now run the cron job to send the email:');
    console.log('curl -X GET "https://forebearer.app/api/cron/hourly" -H "Authorization: Bearer $CRON_SECRET"');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCheckInEmail();
