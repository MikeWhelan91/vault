import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/passwords/[id]
 * Get a single password entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const password = await prisma.password.findUnique({
      where: { id },
    });

    if (!password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    // Update last used timestamp
    await prisma.password.update({
      where: { id },
      data: { lastUsed: new Date() },
    });

    return NextResponse.json({
      password: {
        id: password.id,
        name: password.name,
        category: password.category,
        url: password.url,
        username: password.username,
        favorite: password.favorite,
        lastUsed: password.lastUsed?.toISOString(),
        createdAt: password.createdAt.toISOString(),
        updatedAt: password.updatedAt.toISOString(),
        // Encrypted fields
        passwordEncrypted: password.passwordEncrypted,
        passwordIV: password.passwordIV,
        notesEncrypted: password.notesEncrypted,
        notesIV: password.notesIV,
        cardNumberEncrypted: password.cardNumberEncrypted,
        cardExpiryEncrypted: password.cardExpiryEncrypted,
        cardCVVEncrypted: password.cardCVVEncrypted,
        cardCVVIV: password.cardCVVIV,
        passwordKeySalt: password.passwordKeySalt,
        wrappedPasswordKey: password.wrappedPasswordKey,
        wrappedPasswordKeyIV: password.wrappedPasswordKeyIV,
      },
    });
  } catch (error) {
    console.error('Get password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/passwords/[id]
 * Update a password entry
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
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
      favorite,
    } = body;

    const password = await prisma.password.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(url !== undefined && { url }),
        ...(username !== undefined && { username }),
        ...(passwordEncrypted !== undefined && { passwordEncrypted }),
        ...(passwordIV !== undefined && { passwordIV }),
        ...(notesEncrypted !== undefined && { notesEncrypted }),
        ...(notesIV !== undefined && { notesIV }),
        ...(cardNumberEncrypted !== undefined && { cardNumberEncrypted }),
        ...(cardExpiryEncrypted !== undefined && { cardExpiryEncrypted }),
        ...(cardCVVEncrypted !== undefined && { cardCVVEncrypted }),
        ...(cardCVVIV !== undefined && { cardCVVIV }),
        ...(favorite !== undefined && { favorite }),
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
        updatedAt: password.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/passwords/[id]
 * Delete a password entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.password.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
