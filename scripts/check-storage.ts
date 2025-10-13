import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkStorage() {
  try {
    // Get all users with their storage usage
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        totalSize: true,
        storageLimit: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    console.log('\n=== Storage Usage Report ===\n');

    let totalUsed = BigInt(0);

    for (const user of users) {
      const usedGB = Number(user.totalSize) / (1024 * 1024 * 1024);
      const limitGB = Number(user.storageLimit) / (1024 * 1024 * 1024);
      const percentUsed = (Number(user.totalSize) / Number(user.storageLimit)) * 100;

      totalUsed += user.totalSize;

      console.log(`User: ${user.email}`);
      console.log(`  Items: ${user._count.items}`);
      console.log(`  Storage Used: ${usedGB.toFixed(2)} GB / ${limitGB.toFixed(2)} GB (${percentUsed.toFixed(1)}%)`);
      console.log(`  Storage Used (bytes): ${user.totalSize.toString()}`);
      console.log('');
    }

    const totalGB = Number(totalUsed) / (1024 * 1024 * 1024);
    console.log(`Total R2 Storage: ${totalGB.toFixed(2)} GB`);
    console.log(`Total R2 Storage (bytes): ${totalUsed.toString()}`);

    // Get item breakdown
    const items = await prisma.item.findMany({
      select: {
        type: true,
        size: true,
      },
    });

    const fileCount = items.filter(i => i.type === 'file').length;
    const noteCount = items.filter(i => i.type === 'note').length;

    console.log('\n=== Item Breakdown ===\n');
    console.log(`Files: ${fileCount}`);
    console.log(`Notes: ${noteCount}`);
    console.log(`Total Items: ${items.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStorage();
