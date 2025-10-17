import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/bundles/[id]/trustees
 * Add a trustee to a bundle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bundleId } = params;
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email) {
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

    // Don't allow adding trustees to released bundles
    if (bundle.released) {
      return NextResponse.json(
        { error: 'Cannot add trustees to a released bundle' },
        { status: 400 }
      );
    }

    // Add trustee
    const trustee = await prisma.trustee.create({
      data: {
        bundleId,
        email,
        name: name || null,
      },
    });

    return NextResponse.json({
      success: true,
      trustee: {
        id: trustee.id,
        email: trustee.email,
        name: trustee.name,
      },
    });
  } catch (error) {
    console.error('Add trustee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
