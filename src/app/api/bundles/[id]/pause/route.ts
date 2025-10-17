import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/bundles/[id]/pause
 * Pause a heartbeat bundle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get the bundle
    const bundle = await prisma.releaseBundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Verify ownership
    if (bundle.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify it's a heartbeat bundle
    if (bundle.mode !== 'heartbeat') {
      return NextResponse.json(
        { error: 'Only heartbeat bundles can be paused' },
        { status: 400 }
      );
    }

    // Verify it's not already released
    if (bundle.released) {
      return NextResponse.json(
        { error: 'Cannot pause a released bundle' },
        { status: 400 }
      );
    }

    // Update bundle to paused
    const updatedBundle = await prisma.releaseBundle.update({
      where: { id },
      data: {
        heartbeatPaused: true,
        heartbeatPausedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      bundle: {
        id: updatedBundle.id,
        heartbeatPaused: updatedBundle.heartbeatPaused,
        heartbeatPausedAt: updatedBundle.heartbeatPausedAt,
      },
    });
  } catch (error) {
    console.error('Pause bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
