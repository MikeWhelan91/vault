import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/release/[token]
 *
 * Public endpoint for trustees to access released bundles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the release bundle by token
    const bundle = await prisma.releaseBundle.findUnique({
      where: {
        releaseToken: token,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        bundleItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                type: true,
                size: true,
                r2Key: true,
              },
            },
          },
        },
      },
    });

    // Check if bundle exists
    if (!bundle) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      );
    }

    // Check if bundle has been released
    if (!bundle.released) {
      return NextResponse.json(
        { error: 'This release is not yet available' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Check if bundle has expired (24 hours after first access)
    if (bundle.firstAccessedAt) {
      const expirationTime = new Date(bundle.firstAccessedAt);
      expirationTime.setHours(expirationTime.getHours() + 24);

      if (now > expirationTime) {
        return NextResponse.json(
          {
            error: 'This release has expired',
            message: 'This release was accessible for 24 hours after first access and is no longer available.'
          },
          { status: 410 } // 410 Gone
        );
      }
    } else {
      // First access - record the timestamp
      await prisma.releaseBundle.update({
        where: { id: bundle.id },
        data: { firstAccessedAt: now },
      });
    }

    // Calculate expiration time
    const expiresAt = bundle.firstAccessedAt
      ? new Date(new Date(bundle.firstAccessedAt).getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000); // If just accessed now

    // Format response
    const response = {
      bundle: {
        name: bundle.name,
        createdAt: bundle.createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        // Bundle note (encrypted with bundle key for trustee access)
        bundleNoteEncrypted: bundle.bundleNoteEncrypted,
        bundleNoteIV: bundle.bundleNoteIV,
      },
      user: {
        email: bundle.user.email,
      },
      items: bundle.bundleItems.map((bundleItem) => ({
        id: bundleItem.item.id,
        name: bundleItem.item.name,
        type: bundleItem.item.type,
        size: Number(bundleItem.item.size), // Convert BigInt to number for JSON serialization
        r2Key: bundleItem.item.r2Key,
        // Bundle-wrapped keys for decryption (trustees can use these with the release token)
        bundleWrappedKey: bundleItem.bundleWrappedKey,
        bundleWrappedKeyIV: bundleItem.bundleWrappedKeyIV,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching release:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
