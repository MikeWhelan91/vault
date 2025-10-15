import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/cron/daily
 *
 * Daily cron job that:
 * 1. Cleans up expired release bundles (24 hours after first access)
 * 2. Deletes associated files from R2 storage
 * 3. Removes bundle and trustee records
 *
 * Triggered by GitHub Actions once daily (0 0 * * *)
 * Secured with CRON_SECRET to prevent unauthorized access
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find expired bundles (accessed more than 24 hours ago)
    const expiredBundles = await prisma.releaseBundle.findMany({
      where: {
        released: true,
        firstAccessedAt: {
          lte: twentyFourHoursAgo,
        },
      },
      include: {
        bundleItems: true,
        trustees: true,
      },
    });

    console.log(`\n=== Daily Cleanup Job ===`);
    console.log(`Found ${expiredBundles.length} expired bundles to clean up`);

    let bundlesDeleted = 0;
    const errors: string[] = [];

    for (const bundle of expiredBundles) {
      try {
        console.log(`\nCleaning up bundle: ${bundle.name} (ID: ${bundle.id})`);
        console.log(`First accessed: ${bundle.firstAccessedAt?.toISOString()}`);
        console.log(`Bundle items: ${bundle.bundleItems.length}`);
        console.log(`Trustees: ${bundle.trustees.length}`);

        // Delete the bundle record
        // This cascades to delete BundleItems and Trustees
        // NOTE: Original Item records and R2 files are NOT deleted - they remain in the owner's vault
        await prisma.releaseBundle.delete({
          where: { id: bundle.id },
        });

        console.log(`✓ Deleted bundle record, ${bundle.bundleItems.length} bundle items, and ${bundle.trustees.length} trustees`);
        console.log(`✓ Original vault items remain intact for the owner`);
        bundlesDeleted++;
      } catch (error) {
        console.error(`✗ Failed to clean up bundle ${bundle.id}:`, error);
        errors.push(`Failed to clean up bundle ${bundle.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      bundlesDeleted,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Daily cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
