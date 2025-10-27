import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteObject } from '@/lib/r2-client';

/**
 * POST /api/cron/cleanup-orphaned-items
 * Deletes vault items that are NOT in any bundles after 2 years of user inactivity
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
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Find inactive users (no activity in 2 years)
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastActivityAt: {
          lt: twoYearsAgo,
        },
      },
      select: {
        id: true,
        email: true,
        lastActivityAt: true,
      },
    });

    let totalItemsDeleted = 0;
    const deletionLog: Array<{ userId: string; email: string; itemsDeleted: number }> = [];

    for (const user of inactiveUsers) {
      // Find items NOT in any bundles
      const orphanedItems = await prisma.item.findMany({
        where: {
          userId: user.id,
          bundleItems: {
            none: {}, // Not in any bundle
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
      });

      let itemsDeleted = 0;

      for (const item of orphanedItems) {
        try {
          // Delete from R2 (only if it has R2 storage)
          if (item.type === 'file' || item.type === 'note') {
            await deleteObject(user.id, item.id, 1);
          }

          // Delete from database
          await prisma.item.delete({
            where: { id: item.id },
          });

          itemsDeleted++;
          totalItemsDeleted++;
        } catch (error) {
          console.error(`Failed to delete item ${item.id} for user ${user.id}:`, error);
          // Continue with other items even if one fails
        }
      }

      if (itemsDeleted > 0) {
        deletionLog.push({
          userId: user.id,
          email: user.email,
          itemsDeleted,
        });

        console.log(`Cleaned up ${itemsDeleted} orphaned items for user ${user.email} (inactive since ${user.lastActivityAt})`);
      }
    }

    return NextResponse.json({
      success: true,
      inactiveUsers: inactiveUsers.length,
      totalItemsDeleted,
      deletionLog,
    });
  } catch (error) {
    console.error('Error in orphaned items cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
