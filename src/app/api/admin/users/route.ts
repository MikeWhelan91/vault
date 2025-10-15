import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/users
 *
 * Get all users with their stats (admin only)
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        totalSize: true,
        storageLimit: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true,
            releaseBundles: true,
          },
        },
        heartbeat: {
          select: {
            enabled: true,
            cadenceDays: true,
            lastHeartbeat: true,
            nextHeartbeat: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        totalSize: Number(user.totalSize),
        storageLimit: Number(user.storageLimit),
        storageUsedGB: Number(user.totalSize) / (1024 * 1024 * 1024),
        storageLimitGB: Number(user.storageLimit) / (1024 * 1024 * 1024),
        storagePercentage: Number(user.storageLimit) > 0
          ? (Number(user.totalSize) / Number(user.storageLimit)) * 100
          : 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
