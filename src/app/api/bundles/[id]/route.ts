import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/bundles/[id]?userId=xxx
 * Get a single bundle with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const bundle = await prisma.releaseBundle.findUnique({
      where: { id },
      include: {
        trustees: true,
        bundleItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Verify ownership
    if (bundle.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        mode: bundle.mode,
        releaseDate: bundle.releaseDate?.toISOString(),
        heartbeatCadenceDays: bundle.heartbeatCadenceDays,
        released: bundle.released,
        createdAt: bundle.createdAt.toISOString(),
        items: bundle.bundleItems.map((bi) => ({
          id: bi.item.id,
          name: bi.item.name,
          type: bi.item.type,
        })),
        trustees: bundle.trustees.map((t) => ({
          id: t.id,
          email: t.email,
          name: t.name,
        })),
      },
    });
  } catch (error) {
    console.error('Get bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/bundles/[id]
 * Update bundle name
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the bundle
    const bundle = await prisma.releaseBundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Verify ownership
    if (bundle.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update bundle name
    await prisma.releaseBundle.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update bundle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
