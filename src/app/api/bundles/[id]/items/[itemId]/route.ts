import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/bundles/[id]/items/[itemId]
 * Remove an item from a bundle
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { id: bundleId, itemId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get the bundle
    const bundle = await prisma.releaseBundle.findUnique({
      where: { id: bundleId },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Verify ownership
    if (bundle.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Don't allow removing items from released bundles
    if (bundle.released) {
      return NextResponse.json(
        { error: 'Cannot remove items from a released bundle' },
        { status: 400 }
      );
    }

    // Get the bundle item
    const bundleItem = await prisma.bundleItem.findUnique({
      where: {
        bundleId_itemId: {
          bundleId,
          itemId,
        },
      },
    });

    if (!bundleItem) {
      return NextResponse.json({ error: 'Item not in bundle' }, { status: 404 });
    }

    // Remove item from bundle
    await prisma.bundleItem.delete({
      where: {
        bundleId_itemId: {
          bundleId,
          itemId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove item from bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
