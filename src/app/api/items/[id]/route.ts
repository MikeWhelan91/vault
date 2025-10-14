import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/items/[id]?userId=xxx
 * Get a single item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { id } = await params;

    const item = await prisma.item.findFirst({
      where: {
        id,
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
 * Delete an item from database and R2 storage
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { id } = await params;

    // Get item to check ownership and get r2Key
    const item = await prisma.item.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete from R2 first
    try {
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://vault-api.yourdomain.workers.dev';
      // URL-encode the r2Key to handle special characters in email addresses
      const encodedKey = encodeURIComponent(item.r2Key);
      const deleteUrl = `${workerUrl}/r2/${encodedKey}`;
      console.log('Attempting to delete from R2:', deleteUrl);

      const r2Response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      console.log('R2 deletion response status:', r2Response.status);

      if (!r2Response.ok) {
        const errorText = await r2Response.text();
        console.error('Failed to delete from R2:', errorText);
        // Continue anyway - we still want to clean up the database
      } else {
        const responseData = await r2Response.json();
        console.log('R2 deletion successful:', responseData);
      }
    } catch (r2Error) {
      console.error('R2 deletion error:', r2Error);
      // Continue anyway - we still want to clean up the database
    }

    // Delete item and update user's total size
    await prisma.$transaction([
      prisma.item.delete({
        where: { id },
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
