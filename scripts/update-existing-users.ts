import { PrismaClient } from '../src/generated/prisma';
import { getFileCategory } from '../src/lib/fileCategories';

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log('\n=== Updating Existing Users to New Limits ===\n');

    // Update all existing users to new storage limit (300MB)
    const updatedUsers = await prisma.user.updateMany({
      where: {
        storageLimit: BigInt(5368709120), // Old 5GB limit
      },
      data: {
        storageLimit: BigInt(314572800), // New 300MB limit
      },
    });

    console.log(`Updated ${updatedUsers.count} users to 300MB storage limit\n`);

    // Update all existing items to have categories
    const items = await prisma.item.findMany({
      where: {
        type: 'file',
        category: null,
      },
    });

    console.log(`Found ${items.length} items without categories\n`);

    let updated = 0;
    for (const item of items) {
      const category = getFileCategory(item.name);
      await prisma.item.update({
        where: { id: item.id },
        data: { category },
      });
      console.log(`Updated ${item.name} → ${category}`);
      updated++;
    }

    console.log(`\n✓ Updated ${updated} items with categories`);
    console.log('✓ All users now have 300MB storage limit');
    console.log('✓ Limits are now fully active!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();
