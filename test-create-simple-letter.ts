// Create a simple test letter
import prisma from './src/lib/prisma';

async function main() {
  // Get the first user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('No users found');
    return;
  }

  console.log('Creating simple test letter for user:', user.id);

  // Create a simple test letter
  const letter = await prisma.scheduledLetter.create({
    data: {
      userId: user.id,
      title: 'Happy Birthday!',
      recipient: 'whelano07@hotmail.com',
      recipientName: 'Mike',
      scheduleType: 'date',
      scheduleDate: new Date(),
      letterContent: `Happy Birthday Mike!

I hope you have an amazing day filled with joy and laughter.

Looking forward to celebrating with you soon.

Best wishes,
Sarah`
    }
  });

  console.log('Test letter created:', letter.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
