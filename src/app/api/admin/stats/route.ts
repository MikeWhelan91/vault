import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/stats
 *
 * Get system-wide statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth via header
    const email = request.headers.get('x-user-email');

    if (!email || !isAdmin(email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalItems,
      totalBundles,
      releasedBundles,
      totalHeartbeats,
      activeHeartbeats,
      totalTrustees,
      storageStats,
      recentUsers,
      recentBundles,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total items
      prisma.item.count(),

      // Total bundles
      prisma.releaseBundle.count(),

      // Released bundles
      prisma.releaseBundle.count({
        where: { released: true }
      }),

      // Total heartbeats
      prisma.heartbeat.count(),

      // Active heartbeats
      prisma.heartbeat.count({
        where: { enabled: true }
      }),

      // Total trustees
      prisma.trustee.count(),

      // Storage stats
      prisma.user.aggregate({
        _sum: {
          totalSize: true,
          storageLimit: true,
        },
      }),

      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Recent bundles (last 7 days)
      prisma.releaseBundle.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Bundle type breakdown
    const bundlesByType = await prisma.releaseBundle.groupBy({
      by: ['mode'],
      _count: true,
    });

    // Tier breakdown
    const usersByTier = await prisma.user.groupBy({
      by: ['tier'],
      _count: true,
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        recentWeek: recentUsers,
        byTier: usersByTier.map(t => ({ tier: t.tier, count: t._count })),
      },
      items: {
        total: totalItems,
      },
      bundles: {
        total: totalBundles,
        released: releasedBundles,
        pending: totalBundles - releasedBundles,
        recentWeek: recentBundles,
        byType: bundlesByType.map(b => ({ mode: b.mode, count: b._count })),
      },
      heartbeats: {
        total: totalHeartbeats,
        active: activeHeartbeats,
      },
      trustees: {
        total: totalTrustees,
      },
      storage: {
        totalUsed: Number(storageStats._sum.totalSize || 0),
        totalLimit: Number(storageStats._sum.storageLimit || 0),
        usedGB: Number(storageStats._sum.totalSize || 0) / (1024 * 1024 * 1024),
        limitGB: Number(storageStats._sum.storageLimit || 0) / (1024 * 1024 * 1024),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
