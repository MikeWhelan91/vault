import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReleaseNotification } from '@/lib/email';

/**
 * POST /api/bundles/[id]/trigger
 * Manually trigger a release (for testing)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get the bundle with all related data
    const bundle = await prisma.releaseBundle.findFirst({
      where: {
        id,
        userId, // Ensure user owns this bundle
      },
      include: {
        bundleItems: {
          include: {
            item: true,
          },
        },
        trustees: true,
        user: true,
      },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (bundle.released) {
      return NextResponse.json({ error: 'Bundle already released' }, { status: 400 });
    }

    // Generate release token if it doesn't exist
    const releaseToken = bundle.releaseToken || crypto.randomUUID();

    // Mark bundle as released and set release token
    await prisma.releaseBundle.update({
      where: { id: bundle.id },
      data: {
        released: true,
        releaseToken: releaseToken
      },
    });

    // Send email to each trustee
    for (const trustee of bundle.trustees) {
      await sendReleaseNotification(
        trustee.email,
        trustee.name,
        bundle.user.email,
        bundle.name,
        releaseToken,
        bundle.bundleItems.length
      );

      // Mark trustee as notified
      await prisma.trustee.update({
        where: { id: trustee.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Release triggered successfully',
      notifiedCount: bundle.trustees.length,
    });
  } catch (error) {
    console.error('Trigger release error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
