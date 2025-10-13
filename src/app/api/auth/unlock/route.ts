import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/unlock
 * Unlock or create user account
 *
 * Body:
 * - email: string
 * - dataKeySalt: string (hex)
 * - wrappedDataKey: string (hex)
 * - wrappedDataKeyIV: string (hex)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, dataKeySalt, wrappedDataKey, wrappedDataKeyIV } = body;

    // Validate input
    if (!email || !dataKeySalt || !wrappedDataKey || !wrappedDataKeyIV) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        items: {
          orderBy: { updatedAt: 'desc' },
        },
        heartbeat: true,
      },
    });

    if (user) {
      // Existing user - return their data
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          dataKeySalt: user.dataKeySalt,
          wrappedDataKey: user.wrappedDataKey,
          wrappedDataKeyIV: user.wrappedDataKeyIV,
          totalSize: user.totalSize.toString(),
          storageLimit: user.storageLimit.toString(),
          tier: user.tier,
        },
        items: user.items.map(item => ({
          id: item.id,
          type: item.type,
          name: item.name,
          size: item.size.toString(),
          version: item.version,
          r2Key: item.r2Key,
          itemKeySalt: item.itemKeySalt,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        heartbeat: user.heartbeat ? {
          enabled: user.heartbeat.enabled,
          cadenceDays: user.heartbeat.cadenceDays,
          lastHeartbeat: user.heartbeat.lastHeartbeat?.toISOString(),
          nextHeartbeat: user.heartbeat.nextHeartbeat?.toISOString(),
        } : null,
      });
    } else {
      // New user - create account
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          dataKeySalt,
          wrappedDataKey,
          wrappedDataKeyIV,
        },
      });

      return NextResponse.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          dataKeySalt: newUser.dataKeySalt,
          wrappedDataKey: newUser.wrappedDataKey,
          wrappedDataKeyIV: newUser.wrappedDataKeyIV,
          totalSize: newUser.totalSize.toString(),
          storageLimit: newUser.storageLimit.toString(),
          tier: newUser.tier,
        },
        items: [],
        heartbeat: null,
        created: true,
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
