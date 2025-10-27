import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/signup
 * Create a new user account
 *
 * Body:
 * - email: string
 * - name: string (optional)
 * - dataKeySalt: string (hex)
 * - wrappedDataKey: string (hex)
 * - wrappedDataKeyIV: string (hex)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, dataKeySalt, wrappedDataKey, wrappedDataKeyIV } = body;

    // Validate input
    if (!email || !dataKeySalt || !wrappedDataKey || !wrappedDataKeyIV) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || '',
        dataKeySalt,
        wrappedDataKey,
        wrappedDataKeyIV,
      },
    });

    console.log(`New account created: ${newUser.email} (${newUser.id})`);

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        dataKeySalt: newUser.dataKeySalt,
        wrappedDataKey: newUser.wrappedDataKey,
        wrappedDataKeyIV: newUser.wrappedDataKeyIV,
        totalSize: newUser.totalSize.toString(),
        storageLimit: newUser.storageLimit.toString(),
        tier: newUser.tier,
        lastActivityAt: newUser.lastActivityAt?.toISOString(),
      },
      items: [],
      bundles: [],
      heartbeat: null,
      created: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
