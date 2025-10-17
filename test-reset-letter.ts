// Quick script to reset a letter to unsent for testing
import prisma from './src/lib/prisma';

async function main() {
  // Find the most recent sent letter
  const letter = await prisma.scheduledLetter.findFirst({
    where: { sent: true },
    orderBy: { sentAt: 'desc' }
  });

  if (!letter) {
    console.log('No sent letters found');
    return;
  }

  console.log('Found letter:', letter.id, letter.title);

  // Reset it to unsent and set schedule date to now
  const updated = await prisma.scheduledLetter.update({
    where: { id: letter.id },
    data: {
      sent: false,
      sentAt: null,
      scheduleDate: new Date()
    }
  });

  console.log('Letter reset to unsent:', updated.id);
  console.log('Schedule date set to:', updated.scheduleDate);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
