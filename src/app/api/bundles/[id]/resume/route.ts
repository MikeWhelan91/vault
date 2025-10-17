import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/bundles/[id]/resume
 * Resume a paused heartbeat bundle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
        { error: 'Only heartbeat bundles can be resumed' },
        { status: 400 }
      );
    }

    // Update bundle to resumed
    const updatedBundle = await prisma.releaseBundle.update({
      where: { id },
      data: {
        heartbeatPaused: false,
        heartbeatPausedAt: null,
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
    console.error('Resume bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
