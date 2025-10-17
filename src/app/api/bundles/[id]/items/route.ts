import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/bundles/[id]/items
 * Add an item to a bundle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bundleId } = params;
    const body = await request.json();
    const { userId, itemId } = body;

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Don't allow adding items to released bundles
    if (bundle.released) {
      return NextResponse.json(
        { error: 'Cannot add items to a released bundle' },
        { status: 400 }
      );
    }

    // Verify item exists and belongs to user
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.userId !== userId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if item is already in bundle
    const existing = await prisma.bundleItem.findUnique({
      where: {
        bundleId_itemId: {
          bundleId,
          itemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item is already in this bundle' },
        { status: 400 }
      );
    }

    // Add item to bundle
    await prisma.bundleItem.create({
      data: {
        bundleId,
        itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add item to bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
