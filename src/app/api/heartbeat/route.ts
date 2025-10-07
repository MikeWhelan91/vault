export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/heartbeat?userId=xxx
 * Get heartbeat settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const heartbeat = await prisma.heartbeat.findUnique({
      where: { userId },
    });

    if (!heartbeat) {
      return NextResponse.json({ heartbeat: null });
    }

    return NextResponse.json({
      heartbeat: {
        enabled: heartbeat.enabled,
        cadenceDays: heartbeat.cadenceDays,
        lastHeartbeat: heartbeat.lastHeartbeat?.toISOString(),
        nextHeartbeat: heartbeat.nextHeartbeat?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/heartbeat
 * Update heartbeat settings or record a heartbeat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, enabled, cadenceDays, recordHeartbeat } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (recordHeartbeat) {
      // Record a heartbeat
      const now = new Date();
      const heartbeat = await prisma.heartbeat.findUnique({
        where: { userId },
      });

      if (!heartbeat) {
        return NextResponse.json({ error: 'Heartbeat not configured' }, { status: 400 });
      }

      const nextHeartbeat = new Date(now);
      nextHeartbeat.setDate(nextHeartbeat.getDate() + heartbeat.cadenceDays);

      const updated = await prisma.heartbeat.update({
        where: { userId },
        data: {
          lastHeartbeat: now,
          nextHeartbeat,
        },
      });

      return NextResponse.json({
        heartbeat: {
          enabled: updated.enabled,
          cadenceDays: updated.cadenceDays,
          lastHeartbeat: updated.lastHeartbeat?.toISOString(),
          nextHeartbeat: updated.nextHeartbeat?.toISOString(),
        },
      });
    } else {
      // Update settings
      const heartbeat = await prisma.heartbeat.upsert({
        where: { userId },
        create: {
          userId,
          enabled: enabled ?? false,
          cadenceDays: cadenceDays ?? 30,
        },
        update: {
          enabled,
          cadenceDays,
        },
      });

      return NextResponse.json({
        heartbeat: {
          enabled: heartbeat.enabled,
          cadenceDays: heartbeat.cadenceDays,
          lastHeartbeat: heartbeat.lastHeartbeat?.toISOString(),
          nextHeartbeat: heartbeat.nextHeartbeat?.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Update heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
