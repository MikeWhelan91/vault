import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/passwords
 * Create a new password entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      category,
      url,
      username,
      passwordEncrypted,
      passwordIV,
      notesEncrypted,
      notesIV,
      cardNumberEncrypted,
      cardExpiryEncrypted,
      cardCVVEncrypted,
      cardCVVIV,
      passwordKeySalt,
      wrappedPasswordKey,
      wrappedPasswordKeyIV,
      favorite,
    } = body;

    if (!userId || !name || !passwordEncrypted || !passwordIV || !passwordKeySalt || !wrappedPasswordKey || !wrappedPasswordKeyIV) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const password = await prisma.password.create({
      data: {
        userId,
        name,
        category: category || 'other',
        url,
        username,
        passwordEncrypted,
        passwordIV,
        notesEncrypted,
        notesIV,
        cardNumberEncrypted,
        cardExpiryEncrypted,
        cardCVVEncrypted,
        cardCVVIV,
        passwordKeySalt,
        wrappedPasswordKey,
        wrappedPasswordKeyIV,
        favorite: favorite || false,
      },
    });

    return NextResponse.json({
      password: {
        id: password.id,
        name: password.name,
        category: password.category,
        url: password.url,
        username: password.username,
        favorite: password.favorite,
        createdAt: password.createdAt.toISOString(),
        updatedAt: password.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/passwords?userId=xxx
 * List all passwords for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const favorites = searchParams.get('favorites');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    if (favorites === 'true') {
      where.favorite = true;
    }

    const passwords = await prisma.password.findMany({
      where,
      orderBy: [
        { favorite: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({
      passwords: passwords.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        url: p.url,
        username: p.username,
        favorite: p.favorite,
        lastUsed: p.lastUsed?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        // Encrypted fields
        passwordEncrypted: p.passwordEncrypted,
        passwordIV: p.passwordIV,
        notesEncrypted: p.notesEncrypted,
        notesIV: p.notesIV,
        cardNumberEncrypted: p.cardNumberEncrypted,
        cardExpiryEncrypted: p.cardExpiryEncrypted,
        cardCVVEncrypted: p.cardCVVEncrypted,
        cardCVVIV: p.cardCVVIV,
        passwordKeySalt: p.passwordKeySalt,
        wrappedPasswordKey: p.wrappedPasswordKey,
        wrappedPasswordKeyIV: p.wrappedPasswordKeyIV,
      })),
    });
  } catch (error) {
    console.error('Get passwords error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
