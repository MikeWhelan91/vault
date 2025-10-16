import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron job to enforce grace period expiration
 * Runs daily to check for users whose grace period has ended
 *
 * For users over limits:
 * - Delete excess storage (keep oldest files up to 300MB)
 * - Disable excess bundles (keep only 1, disable the rest)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find users whose grace period has expired
    const expiredUsers = await prisma.user.findMany({
      where: {
        tier: 'free',
        gracePeriodEndsAt: {
          lte: now, // Grace period ended
        },
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc', // Oldest first (we keep these)
          },
        },
        releaseBundles: {
          where: { released: false },
          orderBy: {
            createdAt: 'asc', // Oldest first (we keep the oldest one)
          },
        },
      },
    });

    console.log(`Found ${expiredUsers.length} users with expired grace periods`);

    const results = [];

    for (const user of expiredUsers) {
      const result = {
        userId: user.id,
        email: user.email,
        deletedItems: 0,
        disabledBundles: 0,
        freedStorage: 0,
      };

      // 1. Handle excess storage (keep oldest files up to 300MB)
      const storageLimitBytes = 314572800; // 300MB
      let currentStorageBytes = Number(user.totalSize);

      if (currentStorageBytes > storageLimitBytes) {
        // Calculate which items to delete (newest items first)
        let storageToFree = currentStorageBytes - storageLimitBytes;
        const itemsToDelete = [];

        // Sort items by creation date DESC (newest first to delete)
        const sortedItems = [...user.items].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        for (const item of sortedItems) {
          if (storageToFree <= 0) break;

          itemsToDelete.push(item.id);
          storageToFree -= Number(item.size);
          result.deletedItems++;
          result.freedStorage += Number(item.size);
        }

        // Delete items and update user's total size
        if (itemsToDelete.length > 0) {
          await prisma.item.deleteMany({
            where: {
              id: { in: itemsToDelete },
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: {
              totalSize: {
                decrement: BigInt(result.freedStorage),
              },
            },
          });

          console.log(`Deleted ${result.deletedItems} items (${(result.freedStorage / (1024 * 1024)).toFixed(2)}MB) for user ${user.email}`);
        }
      }

      // 2. Handle excess bundles (keep only the oldest bundle, disable the rest)
      if (user.releaseBundles.length > 1) {
        // Keep the oldest bundle (first in the sorted list), disable the rest
        const bundlesToDisable = user.releaseBundles.slice(1).map(b => b.id);

        await prisma.releaseBundle.updateMany({
          where: {
            id: { in: bundlesToDisable },
          },
          data: {
            released: true, // Mark as released to exclude from active count
          },
        });

        result.disabledBundles = bundlesToDisable.length;
        console.log(`Disabled ${result.disabledBundles} excess bundles for user ${user.email}`);
      }

      // 3. Clear grace period
      await prisma.user.update({
        where: { id: user.id },
        data: {
          gracePeriodEndsAt: null,
        },
      });

      results.push(result);

      // TODO: Send email notification about enforcement actions taken
    }

    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      results,
    });
  } catch (error) {
    console.error('Grace period enforcement error:', error);
    return NextResponse.json(
      { error: 'Grace period enforcement failed' },
      { status: 500 }
    );
  }
}
