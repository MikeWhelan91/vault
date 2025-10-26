const { PrismaClient } = require('./src/generated/prisma');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forebearer <hello@forebearer.app>';

async function sendReleaseNotification(
  trusteeEmail,
  trusteeName,
  senderEmail,
  bundleName,
  releaseToken,
  itemCount
) {
  const releaseUrl = `https://forebearer.app/release/${releaseToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: trusteeEmail,
      subject: `You've received memories from ${senderEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #14532d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 40px; margin-bottom: 20px; text-align: center;">
              <h1 style="color: #14532d; font-size: 32px; font-weight: 600; margin: 0 0 16px 0;">
                You've Received Memories
              </h1>
              <p style="color: #166534; font-size: 18px; margin: 0;">
                From ${senderEmail}
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Hi${trusteeName ? ` ${trusteeName}` : ''},
              </p>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                <strong>${senderEmail}</strong> has shared ${itemCount} ${itemCount === 1 ? 'memory' : 'memories'} with you.
              </p>

              <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #166534; margin: 0 0 8px 0;">
                  <strong>Release:</strong> ${bundleName}
                </p>
                <p style="color: #166534; margin: 0;">
                  <strong>Items:</strong> ${itemCount} ${itemCount === 1 ? 'memory' : 'memories'}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${releaseUrl}"
                   style="display: inline-block; background-color: #22c55e; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Memories
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; text-align: center;">
                This link will remain active. You can access these memories anytime.
              </p>
            </div>

            <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Forebearer - Share what matters
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send release notification:', error);
    return { success: false, error };
  }
}

async function sendOwnerBundleReleasedNotification(
  ownerEmail,
  ownerName,
  bundleName,
  releaseMode,
  trusteeCount,
  itemCount
) {
  try {
    const reason = releaseMode === 'heartbeat'
      ? 'you missed your heartbeat check-in deadline'
      : 'the scheduled release date has arrived';

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `Your bundle "${bundleName}" has been released`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #14532d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #dbeafe; border-radius: 12px; padding: 40px; margin-bottom: 20px; text-align: center;">
              <h1 style="color: #1e3a8a; font-size: 32px; font-weight: 600; margin: 0 0 16px 0;">
                Bundle Released
              </h1>
              <p style="color: #1e40af; font-size: 18px; margin: 0;">
                ${bundleName}
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Hi${ownerName ? ` ${ownerName}` : ''},
              </p>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Your bundle "<strong>${bundleName}</strong>" has been released to your trustees because ${reason}.
              </p>

              <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #166534; margin: 0 0 8px 0;">
                  <strong>Bundle:</strong> ${bundleName}
                </p>
                <p style="color: #166534; margin: 0 0 8px 0;">
                  <strong>Release Type:</strong> ${releaseMode === 'heartbeat' ? 'Heartbeat' : 'Time-Lock'}
                </p>
                <p style="color: #166534; margin: 0 0 8px 0;">
                  <strong>Items Released:</strong> ${itemCount} ${itemCount === 1 ? 'memory' : 'memories'}
                </p>
                <p style="color: #166534; margin: 0;">
                  <strong>Trustees Notified:</strong> ${trusteeCount} ${trusteeCount === 1 ? 'person' : 'people'}
                </p>
              </div>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Your designated trustees have been notified and can now access the memories you've shared with them.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://forebearer.app'}/app/release"
                   style="display: inline-block; background-color: #22c55e; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Your Releases
                </a>
              </div>
            </div>

            <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 40px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Forebearer - Share what matters
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send owner bundle released notification:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('=== Sending Release Emails ===\n');

  // Find released bundles that have notified=false for trustees
  const bundles = await prisma.releaseBundle.findMany({
    where: {
      released: true,
      trustees: {
        some: {
          notified: false,
        },
      },
    },
    include: {
      user: true,
      trustees: {
        where: {
          notified: false,
        },
      },
      bundleItems: true,
    },
  });

  if (bundles.length === 0) {
    console.log('No bundles found with pending notifications');
    return;
  }

  console.log(`Found ${bundles.length} bundle(s) with pending notifications\n`);

  for (const bundle of bundles) {
    console.log(`\nProcessing bundle: ${bundle.name}`);
    console.log(`Owner: ${bundle.user.email}`);
    console.log(`Trustees to notify: ${bundle.trustees.length}`);
    console.log(`Release token: ${bundle.releaseToken}`);

    // Send to each trustee
    for (const trustee of bundle.trustees) {
      console.log(`\nSending to trustee: ${trustee.email} (${trustee.name || 'No name'})`);

      const result = await sendReleaseNotification(
        trustee.email,
        trustee.name,
        bundle.user.email,
        bundle.name,
        bundle.releaseToken,
        bundle.bundleItems.length
      );

      if (result.success) {
        console.log('✓ Email sent successfully');

        // Mark as notified
        await prisma.trustee.update({
          where: { id: trustee.id },
          data: { notified: true },
        });
      } else {
        console.error('✗ Failed to send email:', result.error);
      }
    }

    // Send to owner
    console.log(`\nSending to owner: ${bundle.user.email}`);
    const ownerResult = await sendOwnerBundleReleasedNotification(
      bundle.user.email,
      bundle.user.name,
      bundle.name,
      bundle.mode,
      bundle.trustees.length,
      bundle.bundleItems.length
    );

    if (ownerResult.success) {
      console.log('✓ Owner email sent successfully');
    } else {
      console.error('✗ Failed to send owner email:', ownerResult.error);
    }
  }

  console.log('\n=== Done ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
