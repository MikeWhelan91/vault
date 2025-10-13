import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/items?userId=xxx
 * List all items for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      items: items.map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        size: item.size.toString(),
        version: item.version,
        r2Key: item.r2Key,
        itemKeySalt: item.itemKeySalt,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/items
 * Create a new item
 *
 * Body:
 * - userId: string
 * - type: 'file' | 'note'
 * - name: string
 * - size: number
 * - r2Key: string
 * - itemKeySalt: string
 * - wrappedItemKey: string
 * - wrappedItemKeyIV: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      name,
      size,
      r2Key,
      itemKeySalt,
      wrappedItemKey,
      wrappedItemKeyIV,
    } = body;

    // Validate
    if (!userId || !type || !name || size === undefined || !r2Key || !itemKeySalt || !wrappedItemKey || !wrappedItemKeyIV) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user to check storage limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check storage limit
    const newTotalSize = user.totalSize + BigInt(size);
    if (newTotalSize > user.storageLimit) {
      return NextResponse.json(
        {
          error: 'Storage limit exceeded. Delete some items or upgrade to Plus for more storage.',
          code: 'STORAGE_LIMIT_EXCEEDED',
          limit: user.storageLimit.toString(),
          used: user.totalSize.toString(),
          tier: user.tier,
        },
        { status: 403 }
      );
    }

    // Create item and update user's total size
    const [item, updatedUser] = await prisma.$transaction([
      prisma.item.create({
        data: {
          userId,
          type,
          name,
          size: BigInt(size),
          r2Key,
          itemKeySalt,
          wrappedItemKey,
          wrappedItemKeyIV,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalSize: {
            increment: BigInt(size),
          },
        },
      }),
    ]);

    return NextResponse.json({
      item: {
        id: item.id,
        type: item.type,
        name: item.name,
        size: item.size.toString(),
        version: item.version,
        r2Key: item.r2Key,
        itemKeySalt: item.itemKeySalt,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
      totalSize: updatedUser.totalSize.toString(),
    });
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
