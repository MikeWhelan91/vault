import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { TierName } from '@/lib/pricing';

/**
 * POST /api/letters
 * Create a scheduled letter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      recipient,
      recipientName,
      scheduleType,
      scheduleDate,
      yearlyMonth,
      yearlyDay,
      letterContent,
    } = body;

    if (!userId || !title || !recipient || !scheduleType || !scheduleDate || !letterContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = (user.tier || 'free') as TierName;
    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Letter scheduler is a Plus-only feature' },
        { status: 403 }
      );
    }

    const letter = await prisma.scheduledLetter.create({
      data: {
        userId,
        title,
        recipient,
        recipientName,
        scheduleType,
        scheduleDate: new Date(scheduleDate),
        yearlyMonth,
        yearlyDay,
        letterContent,
      },
    });

    return NextResponse.json({
      success: true,
      letter: {
        id: letter.id,
        title: letter.title,
        recipient: letter.recipient,
        recipientName: letter.recipientName,
        scheduleType: letter.scheduleType,
        scheduleDate: letter.scheduleDate.toISOString(),
        sent: letter.sent,
        createdAt: letter.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/letters?userId=xxx
 * Get all scheduled letters for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const letters = await prisma.scheduledLetter.findMany({
      where: { userId },
      orderBy: { scheduleDate: 'asc' },
    });

    return NextResponse.json({
      letters: letters.map(letter => ({
        id: letter.id,
        title: letter.title,
        recipient: letter.recipient,
        recipientName: letter.recipientName,
        scheduleType: letter.scheduleType,
        scheduleDate: letter.scheduleDate.toISOString(),
        sent: letter.sent,
        sentAt: letter.sentAt?.toISOString(),
        createdAt: letter.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get letters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
