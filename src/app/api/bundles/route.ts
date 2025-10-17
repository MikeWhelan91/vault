import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canCreateBundle, canAddTrustee, type TierName } from '@/lib/pricing';

/**
 * POST /api/bundles
 * Create a release bundle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      mode,
      releaseDate,
      heartbeatCadenceDays,
      releaseToken, // Client-generated token used for bundle key derivation
      bundleNoteEncrypted, // Encrypted note for trustees
      bundleNoteIV, // IV for note decryption
      includeEmailMessage,
      emailMessageEncrypted,
      emailMessageIV,
      conditionalRelease,
      conditionType,
      conditionCount,
      items, // Now accepts array of {itemId, bundleWrappedKey, bundleWrappedKeyIV}
      trustees,
    } = body;

    if (!userId || !name || !mode || !releaseToken || !bundleNoteEncrypted || !bundleNoteIV || !items || !trustees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user to check tier and bundle limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        releaseBundles: {
          where: { released: false }, // Only count active bundles
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = (user.tier || 'free') as TierName;
    const currentBundleCount = user.releaseBundles.length;

    // Check bundle limit
    if (!canCreateBundle(tier, currentBundleCount)) {
      return NextResponse.json(
        {
          error: 'Bundle limit exceeded. Upgrade to Plus for unlimited bundles.',
          code: 'BUNDLE_LIMIT_EXCEEDED',
          tier,
          currentCount: currentBundleCount,
        },
        { status: 403 }
      );
    }

    // Check trustee limit
    if (!canAddTrustee(tier, trustees.length)) {
      return NextResponse.json(
        {
          error: `Trustee limit exceeded. Free tier allows up to 10 trustees per bundle. You have ${trustees.length} trustees.`,
          code: 'TRUSTEE_LIMIT_EXCEEDED',
          tier,
          currentCount: trustees.length,
        },
        { status: 403 }
      );
    }

    // releaseToken is now provided by client (generated client-side for zero-knowledge crypto)

    // Create bundle with items and trustees in a transaction
    const bundle = await prisma.releaseBundle.create({
      data: {
        userId,
        name,
        mode,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        heartbeatCadenceDays,
        releaseToken,
        bundleNoteEncrypted,
        bundleNoteIV,
        includeEmailMessage: includeEmailMessage || false,
        emailMessageEncrypted: emailMessageEncrypted || null,
        emailMessageIV: emailMessageIV || null,
        conditionalRelease: conditionalRelease || false,
        conditionType: conditionalRelease ? conditionType : null,
        conditionCount: conditionalRelease && conditionType === 'count' ? conditionCount : null,
        bundleItems: {
          create: items.map((item: { itemId: string; bundleWrappedKey: string; bundleWrappedKeyIV: string }) => ({
            itemId: item.itemId,
            bundleWrappedKey: item.bundleWrappedKey,
            bundleWrappedKeyIV: item.bundleWrappedKeyIV,
          })),
        },
        trustees: {
          create: trustees.map((trustee: { email: string; name?: string }) => ({
            email: trustee.email,
            name: trustee.name,
          })),
        },
      },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        trustees: true,
      },
    });

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        mode: bundle.mode,
        releaseDate: bundle.releaseDate?.toISOString(),
        heartbeatCadenceDays: bundle.heartbeatCadenceDays,
        releaseToken: bundle.releaseToken, // Return the token so frontend knows it
        items: bundle.bundleItems.map(bi => ({
          id: bi.item.id,
          name: bi.item.name,
          type: bi.item.type,
        })),
        trustees: bundle.trustees.map(t => ({
          id: t.id,
          email: t.email,
          name: t.name,
        })),
        createdAt: bundle.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/bundles?userId=xxx
 * List all bundles for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const bundles = await prisma.releaseBundle.findMany({
      where: { userId },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        trustees: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      bundles: bundles.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        mode: bundle.mode,
        releaseDate: bundle.releaseDate?.toISOString(),
        heartbeatCadenceDays: bundle.heartbeatCadenceDays,
        heartbeatPaused: bundle.heartbeatPaused,
        heartbeatPausedAt: bundle.heartbeatPausedAt?.toISOString(),
        released: bundle.released,
        items: bundle.bundleItems.map(bi => ({
          id: bi.item.id,
          name: bi.item.name,
          type: bi.item.type,
        })),
        trustees: bundle.trustees.map(t => ({
          id: t.id,
          email: t.email,
          name: t.name,
        })),
        createdAt: bundle.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get bundles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
