// Create a test letter with actual content
import prisma from './src/lib/prisma';

async function main() {
  // Get the first user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('No users found');
    return;
  }

  console.log('Creating test letter for user:', user.id);

  // Create a test letter scheduled for now
  const letter = await prisma.scheduledLetter.create({
    data: {
      userId: user.id,
      title: 'A Special Message',
      recipient: 'whelano07@hotmail.com',
      recipientName: 'Mike',
      scheduleType: 'date',
      scheduleDate: new Date(),
      letterContent: `Dear Mike,

This is a test letter from Forebearer's scheduled letter feature!

I wanted to let you know how much you mean to me. This letter was scheduled to be sent at a specific time, and here it is!

The letter scheduler allows you to write heartfelt messages that will be delivered on birthdays, anniversaries, or any special date in the future.

With love and appreciation,
Michael`
    }
  });

  console.log('Test letter created:', letter.id);
  console.log('Letter will be sent to:', letter.recipient);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
