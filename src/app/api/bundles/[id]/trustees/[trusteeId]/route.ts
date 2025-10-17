import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/bundles/[id]/trustees/[trusteeId]
 * Remove a trustee from a bundle
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trusteeId: string }> }
) {
  try {
    const { id: bundleId, trusteeId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get the bundle
    const bundle = await prisma.releaseBundle.findUnique({
      where: { id: bundleId },
      include: { trustees: true },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Verify ownership
    if (bundle.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Don't allow removing trustees from released bundles
    if (bundle.released) {
      return NextResponse.json(
        { error: 'Cannot remove trustees from a released bundle' },
        { status: 400 }
      );
    }

    // Don't allow removing the last trustee
    if (bundle.trustees.length === 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last trustee. Bundles must have at least one trustee.' },
        { status: 400 }
      );
    }

    // Get the trustee
    const trustee = await prisma.trustee.findUnique({
      where: { id: trusteeId },
    });

    if (!trustee || trustee.bundleId !== bundleId) {
      return NextResponse.json({ error: 'Trustee not found' }, { status: 404 });
    }

    // Remove trustee
    await prisma.trustee.delete({
      where: { id: trusteeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove trustee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
