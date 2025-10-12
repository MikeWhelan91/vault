import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/release/[token]
 *
 * Public endpoint for trustees to access released bundles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the release bundle by token
    const bundle = await prisma.releaseBundle.findUnique({
      where: {
        releaseToken: token,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        bundleItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                type: true,
                size: true,
                r2Key: true,
              },
            },
          },
        },
      },
    });

    // Check if bundle exists
    if (!bundle) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      );
    }

    // Check if bundle has been released
    if (!bundle.released) {
      return NextResponse.json(
        { error: 'This release is not yet available' },
        { status: 403 }
      );
    }

    // Format response
    const response = {
      bundle: {
        name: bundle.name,
        createdAt: bundle.createdAt.toISOString(),
      },
      user: {
        email: bundle.user.email,
      },
      items: bundle.bundleItems.map((bundleItem) => ({
        id: bundleItem.item.id,
        name: bundleItem.item.name,
        type: bundleItem.item.type,
        size: bundleItem.item.size,
        r2Key: bundleItem.item.r2Key,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching release:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
