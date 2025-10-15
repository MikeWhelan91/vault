import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/bundles
 *
 * Get all release bundles with details (admin only)
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

    const bundles = await prisma.releaseBundle.findMany({
      select: {
        id: true,
        name: true,
        mode: true,
        released: true,
        releaseDate: true,
        releaseToken: true,
        firstAccessedAt: true,
        heartbeatCadenceDays: true,
        lastHeartbeat: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            bundleItems: true,
            trustees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      bundles: bundles.map(bundle => {
        // Calculate expiration status
        let expirationStatus = 'active';
        let expiresAt = null;

        if (bundle.firstAccessedAt) {
          expiresAt = new Date(new Date(bundle.firstAccessedAt).getTime() + 24 * 60 * 60 * 1000);
          if (new Date() > expiresAt) {
            expirationStatus = 'expired';
          }
        }

        return {
          ...bundle,
          expirationStatus,
          expiresAt,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching admin bundles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
