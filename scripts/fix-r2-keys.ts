/**
 * Migration script to fix r2Key values in the database
 *
 * This script fixes items that were created before the r2Key fix,
 * where the database stored email/random-uuid/1.bin but R2 has email/item-id/1.bin
 *
 * Run with: npx tsx scripts/fix-r2-keys.ts
 */

import prisma from '../src/lib/prisma';

async function fixR2Keys() {
  console.log('Starting r2Key migration...\n');

  try {
    // Get all items
    const items = await prisma.item.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`Found ${items.length} items to check\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    const errors: Array<{ itemId: string; error: string }> = [];

    for (const item of items) {
      const expectedR2Key = `${item.user.email}/${item.id}/${item.version}.bin`;

      if (item.r2Key !== expectedR2Key) {
        console.log(`❌ Item ${item.id}:`);
        console.log(`   Current:  ${item.r2Key}`);
        console.log(`   Expected: ${expectedR2Key}`);

        try {
          // Update the item with the correct r2Key
          await prisma.item.update({
            where: { id: item.id },
            data: { r2Key: expectedR2Key },
          });

          console.log(`   ✅ Fixed!\n`);
          fixedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`   ⚠️  Failed to update: ${errorMessage}\n`);
          errors.push({ itemId: item.id, error: errorMessage });
        }
      } else {
        alreadyCorrectCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total items checked:     ${items.length}`);
    console.log(`Already correct:         ${alreadyCorrectCount}`);
    console.log(`Fixed:                   ${fixedCount}`);
    console.log(`Errors:                  ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(({ itemId, error }) => {
        console.log(`  - Item ${itemId}: ${error}`);
      });
    }

    console.log('\n✅ Migration complete!\n');

    if (fixedCount > 0) {
      console.log('⚠️  IMPORTANT:');
      console.log('   Items with old r2Keys have been updated in the database.');
      console.log('   However, the actual files in R2 storage are already at the');
      console.log('   correct path (email/item-id/version.bin), so no R2 changes');
      console.log('   are needed. The database now matches R2 storage.\n');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
fixR2Keys()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
