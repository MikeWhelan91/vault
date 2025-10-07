export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      itemIds,
      trustees,
    } = body;

    if (!userId || !name || !mode || !itemIds || !trustees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create bundle with items and trustees in a transaction
    const bundle = await prisma.releaseBundle.create({
      data: {
        userId,
        name,
        mode,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        heartbeatCadenceDays,
        bundleItems: {
          create: itemIds.map((itemId: string) => ({
            itemId,
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
