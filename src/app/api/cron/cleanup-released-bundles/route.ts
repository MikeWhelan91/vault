import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/r2-client';

/**
 * POST /api/cron/cleanup-released-bundles
 * Deletes released bundle data after retention period expires
 * - Free: 30 days
 * - Plus Monthly/Annual: 90 days
 * - Lifetime: 180 days
 *
 * Smart deletion: Only deletes items that aren't in other active bundles
 * Scheduled to run daily via GitHub Actions
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find bundles ready for deletion
    const bundlesToDelete = await prisma.releaseBundle.findMany({
      where: {
        released: true,
        archived: false,
        deleteScheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    let totalBundlesArchived = 0;
    let totalItemsDeleted = 0;
    const deletionLog: Array<{
      bundleId: string;
      bundleName: string;
      userEmail: string;
      itemsDeleted: number;
    }> = [];

    for (const bundle of bundlesToDelete) {
      let itemsDeleted = 0;

      // Process each item in the bundle
      for (const bundleItem of bundle.bundleItems) {
        const item = bundleItem.item;

        // Check if this item is in ANY other active (non-archived) bundles
        const otherBundles = await prisma.bundleItem.count({
          where: {
            itemId: item.id,
            bundle: {
              id: { not: bundle.id },
              archived: false, // Only count active bundles
            },
          },
        });

        // Only delete if item is not in any other active bundles
        if (otherBundles === 0) {
          try {
            // Delete from R2 (only if it has R2 storage)
            if (item.type === 'file' || item.type === 'note') {
              await deleteObject(bundle.userId, item.id, 1);
            }

            // Delete from database
            await prisma.item.delete({
              where: { id: item.id },
            });

            itemsDeleted++;
            totalItemsDeleted++;
          } catch (error) {
            console.error(`Failed to delete item ${item.id} from bundle ${bundle.id}:`, error);
            // Continue with other items even if one fails
          }
        } else {
          console.log(`Keeping item ${item.id} (in ${otherBundles} other bundles)`);
        }
      }

      // Mark bundle as archived (keep metadata for records)
      await prisma.releaseBundle.update({
        where: { id: bundle.id },
        data: {
          archived: true,
        },
      });

      totalBundlesArchived++;

      deletionLog.push({
        bundleId: bundle.id,
        bundleName: bundle.name,
        userEmail: bundle.user.email,
        itemsDeleted,
      });

      console.log(`Archived bundle "${bundle.name}" (${bundle.id}) - deleted ${itemsDeleted} items`);
    }

    return NextResponse.json({
      success: true,
      bundlesArchived: totalBundlesArchived,
      itemsDeleted: totalItemsDeleted,
      deletionLog,
    });
  } catch (error) {
    console.error('Error in released bundles cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
