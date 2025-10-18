import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotificationToMultipleTokens } from '@/lib/firebase-admin';

/**
 * POST /api/test-push
 * Test endpoint to manually trigger a push notification
 *
 * Body: { "email": "user@example.com" } OR { "userId": "cuid" }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email required' },
        { status: 400 }
      );
    }

    // Find user by email if provided
    let targetUserId = userId;
    if (email && !userId) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        );
      }

      targetUserId = user.id;
    }

    // Get all push tokens for this user
    const tokens = await prisma.pushToken.findMany({
      where: { userId: targetUserId },
    });

    if (tokens.length === 0) {
      return NextResponse.json({
        error: 'No push tokens found for this user',
        hint: 'Make sure the user has signed in on the mobile app and granted notification permission',
      });
    }

    // Send test notification
    const result = await sendPushNotificationToMultipleTokens({
      tokens: tokens.map(t => t.token),
      title: '🔔 Test Notification',
      body: 'Push notifications are working! Tap to open the app.',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      tokensFound: tokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      platforms: tokens.map(t => t.platform),
    });
  } catch (error) {
    console.error('Test push error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
