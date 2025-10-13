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
