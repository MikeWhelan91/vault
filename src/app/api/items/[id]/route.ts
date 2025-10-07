import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/items/[id]?userId=xxx
 * Get a single item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const item = await prisma.item.findFirst({
      where: {
        id: params.id,
        userId, // Ensure user owns this item
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item.id,
        type: item.type,
        name: item.name,
        size: item.size.toString(),
        version: item.version,
        r2Key: item.r2Key,
        itemKeySalt: item.itemKeySalt,
        wrappedItemKey: item.wrappedItemKey,
        wrappedItemKeyIV: item.wrappedItemKeyIV,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/items/[id]?userId=xxx
 * Delete an item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get item to check ownership and size
    const item = await prisma.item.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete item and update user's total size
    await prisma.$transaction([
      prisma.item.delete({
        where: { id: params.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalSize: {
            decrement: item.size,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
