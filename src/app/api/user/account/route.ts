import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/user/account
 * Delete entire user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User ${userId} not found - may have been already deleted`);
      return NextResponse.json(
        { error: 'User not found or already deleted' },
        { status: 404 }
      );
    }

    console.log(`Starting account deletion for user ${userId} (${user.email})`);

    // Get all items to delete from R2
    const items = await prisma.item.findMany({
      where: { userId },
      select: { r2Key: true },
    });

    // Delete all items from R2 storage
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://vault-api.yourdomain.workers.dev';
    console.log(`Deleting ${items.length} items from R2 for user ${userId}`);

    for (const item of items) {
      try {
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
          console.error('Failed to delete from R2:', item.r2Key, errorText);
        } else {
          console.log('R2 deletion successful for:', item.r2Key);
        }
      } catch (r2Error) {
        console.error('Failed to delete R2 object:', item.r2Key, r2Error);
        // Continue with other deletions
      }
    }

    // Delete everything in order due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete trustees (referenced by bundles)
      await tx.trustee.deleteMany({
        where: {
          bundle: {
            userId,
          },
        },
      });

      // Delete bundle items (referenced by bundles and items)
      await tx.bundleItem.deleteMany({
        where: {
          bundle: {
            userId,
          },
        },
      });

      // Delete bundles
      await tx.releaseBundle.deleteMany({
        where: { userId },
      });

      // Delete items
      await tx.item.deleteMany({
        where: { userId },
      });

      // Delete heartbeat
      await tx.heartbeat.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
