import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkQuotas() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        tier: true,
        totalSize: true,
        storageLimit: true,
        maxVideos: true,
        maxImages: true,
        maxDocuments: true,
        items: {
          select: {
            category: true,
          },
        },
      },
    });

    console.log('\n=== Quota Status Report ===\n');

    for (const user of users) {
      const usedMB = Number(user.totalSize) / (1024 * 1024);
      const limitMB = Number(user.storageLimit) / (1024 * 1024);
      const percentUsed = (Number(user.totalSize) / Number(user.storageLimit)) * 100;

      // Count items by category
      const videos = user.items.filter(i => i.category === 'video').length;
      const images = user.items.filter(i => i.category === 'image').length;
      const documents = user.items.filter(i => i.category === 'document').length;
      const audio = user.items.filter(i => i.category === 'audio').length;
      const other = user.items.filter(i => i.category === 'other' || i.category === null).length;

      console.log(`User: ${user.email}`);
      console.log(`Tier: ${user.tier.toUpperCase()}`);
      console.log(`\nStorage:`);
      console.log(`  Used: ${usedMB.toFixed(1)} MB / ${limitMB.toFixed(0)} MB (${percentUsed.toFixed(1)}%)`);

      console.log(`\nItem Quotas:`);
      console.log(`  Videos: ${videos} / ${user.maxVideos ?? '∞'} ${videos >= (user.maxVideos || 999) ? '⚠️  LIMIT REACHED' : '✓'}`);
      console.log(`  Images: ${images} / ${user.maxImages ?? '∞'} ${images >= (user.maxImages || 999) ? '⚠️  LIMIT REACHED' : '✓'}`);
      console.log(`  Documents: ${documents} / ${user.maxDocuments ?? '∞'} ${documents >= (user.maxDocuments || 999) ? '⚠️  LIMIT REACHED' : '✓'}`);
      console.log(`  Audio: ${audio} (no limit)`);
      console.log(`  Other: ${other} (no limit)`);

      const canUploadVideo = user.maxVideos === null || videos < user.maxVideos;
      const canUploadImage = user.maxImages === null || images < user.maxImages;
      const canUploadDoc = user.maxDocuments === null || documents < user.maxDocuments;
      const hasStorageSpace = percentUsed < 100;

      console.log(`\nStatus:`);
      console.log(`  Can upload video: ${canUploadVideo ? '✓ Yes' : '✗ No (quota reached)'}`);
      console.log(`  Can upload image: ${canUploadImage ? '✓ Yes' : '✗ No (quota reached)'}`);
      console.log(`  Can upload document: ${canUploadDoc ? '✓ Yes' : '✗ No (quota reached)'}`);
      console.log(`  Has storage space: ${hasStorageSpace ? '✓ Yes' : '✗ No (storage full)'}`);
      console.log('\n' + '='.repeat(60) + '\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuotas();
