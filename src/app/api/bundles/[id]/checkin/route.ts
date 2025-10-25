import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/bundles/[id]/checkin
 * Record a check-in for a specific heartbeat bundle
 * Resets the nextHeartbeat deadline for this bundle only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bundleId = params.id;

    // Get the bundle
    const bundle = await prisma.releaseBundle.findUnique({
      where: { id: bundleId },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    if (bundle.mode !== 'heartbeat') {
      return NextResponse.json(
        { error: 'Check-in only available for heartbeat bundles' },
        { status: 400 }
      );
    }

    if (bundle.released) {
      return NextResponse.json(
        { error: 'Bundle already released' },
        { status: 400 }
      );
    }

    if (!bundle.heartbeatCadenceDays) {
      return NextResponse.json(
        { error: 'Bundle has no heartbeat cadence configured' },
        { status: 400 }
      );
    }

    // Calculate next heartbeat deadline
    const now = new Date();
    const nextHeartbeat = new Date(now);
    nextHeartbeat.setDate(nextHeartbeat.getDate() + bundle.heartbeatCadenceDays);

    // Update bundle
    const updated = await prisma.releaseBundle.update({
      where: { id: bundleId },
      data: {
        lastHeartbeat: now,
        nextHeartbeat: nextHeartbeat,
        heartbeatPaused: false, // Unpause if checking in
      },
    });

    return NextResponse.json({
      success: true,
      bundle: {
        id: updated.id,
        name: updated.name,
        lastHeartbeat: updated.lastHeartbeat?.toISOString(),
        nextHeartbeat: updated.nextHeartbeat?.toISOString(),
        cadenceDays: updated.heartbeatCadenceDays,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
