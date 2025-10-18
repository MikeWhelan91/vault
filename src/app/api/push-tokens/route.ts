import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/push-tokens
 * Register or update a push notification token for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token, platform } = body;

    if (!userId || !token || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, token, platform' },
        { status: 400 }
      );
    }

    if (platform !== 'android' && platform !== 'ios') {
      return NextResponse.json(
        { error: 'Platform must be "android" or "ios"' },
        { status: 400 }
      );
    }

    // Upsert the push token (create if doesn't exist, update timestamp if it does)
    const pushToken = await prisma.pushToken.upsert({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
      create: {
        userId,
        token,
        platform,
      },
      update: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      pushToken: {
        id: pushToken.id,
        platform: pushToken.platform,
      },
    });
  } catch (error) {
    console.error('Register push token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push-tokens
 * Remove a push notification token (e.g., when user logs out or denies permissions)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, token' },
        { status: 400 }
      );
    }

    await prisma.pushToken.deleteMany({
      where: {
        userId,
        token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete push token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
