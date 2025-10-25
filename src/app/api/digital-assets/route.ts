import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/digital-assets
 * Create a new digital asset entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      category,
      platform,
      url,
      accountNumberEncrypted,
      accountNumberIV,
      instructionsEncrypted,
      instructionsIV,
      estimatedValue,
      valueCurrency,
      renewalDate,
      expirationDate,
      assetKeySalt,
      wrappedAssetKey,
      wrappedAssetKeyIV,
      important,
    } = body;

    if (!userId || !name || !category || !assetKeySalt || !wrappedAssetKey || !wrappedAssetKeyIV) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const asset = await prisma.digitalAsset.create({
      data: {
        userId,
        name,
        category,
        platform,
        url,
        accountNumberEncrypted,
        accountNumberIV,
        instructionsEncrypted,
        instructionsIV,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        valueCurrency: valueCurrency || 'USD',
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        assetKeySalt,
        wrappedAssetKey,
        wrappedAssetKeyIV,
        important: important || false,
      },
    });

    return NextResponse.json({
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        platform: asset.platform,
        url: asset.url,
        estimatedValue: asset.estimatedValue?.toString(),
        valueCurrency: asset.valueCurrency,
        important: asset.important,
        renewalDate: asset.renewalDate?.toISOString(),
        expirationDate: asset.expirationDate?.toISOString(),
        createdAt: asset.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create digital asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/digital-assets?userId=xxx&category=xxx
 * List all digital assets for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const assets = await prisma.digitalAsset.findMany({
      where,
      orderBy: [
        { important: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Calculate total value
    const totalValue = assets.reduce((sum, asset) => {
      if (asset.estimatedValue && asset.valueCurrency === 'USD') {
        return sum + parseFloat(asset.estimatedValue.toString());
      }
      return sum;
    }, 0);

    return NextResponse.json({
      assets: assets.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        platform: a.platform,
        url: a.url,
        estimatedValue: a.estimatedValue?.toString(),
        valueCurrency: a.valueCurrency,
        renewalDate: a.renewalDate?.toISOString(),
        expirationDate: a.expirationDate?.toISOString(),
        status: a.status,
        important: a.important,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        // Encrypted fields
        accountNumberEncrypted: a.accountNumberEncrypted,
        accountNumberIV: a.accountNumberIV,
        instructionsEncrypted: a.instructionsEncrypted,
        instructionsIV: a.instructionsIV,
        assetKeySalt: a.assetKeySalt,
        wrappedAssetKey: a.wrappedAssetKey,
        wrappedAssetKeyIV: a.wrappedAssetKeyIV,
      })),
      summary: {
        totalAssets: assets.length,
        totalValue: totalValue.toFixed(2),
        byCategory: Object.entries(
          assets.reduce((acc: any, asset) => {
            acc[asset.category] = (acc[asset.category] || 0) + 1;
            return acc;
          }, {})
        ).map(([category, count]) => ({ category, count })),
      },
    });
  } catch (error) {
    console.error('Get digital assets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
