import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forebearer <hello@forebearer.app>';

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Forebearer',
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
                Welcome to Forebearer
              </h1>
              <p style="color: #166534; font-size: 18px; margin: 0;">
                Your memories are safe with us
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Hi${name ? ` ${name}` : ''},
              </p>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Thanks for creating your account. You can now start storing memories and setting up releases to share with loved ones.
              </p>

              <div style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #166534; margin: 0 0 12px 0; font-weight: 600;">
                  What you can do:
                </p>
                <ul style="color: #166534; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Upload photos, videos, and messages</li>
                  <li style="margin-bottom: 8px;">Choose who receives your memories and when</li>
                  <li style="margin-bottom: 8px;">Set up check-ins to keep everything on hold</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://forebearer.app'}/app"
                   style="display: inline-block; background-color: #22c55e; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Get Started
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
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://forebearer.app'}/verify?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - Forebearer',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #33373d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fdfdfb; border-radius: 12px; padding: 40px; margin-bottom: 20px;">
              <h1 style="color: #33373d; font-size: 28px; font-weight: 300; margin: 0 0 16px 0;">
                Verify Your Email
              </h1>
              <p style="color: #67717d; font-size: 16px; margin: 0;">
                Click below to verify your email address
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #525b66; margin-bottom: 24px;">
                Please verify your email address to complete your Vault account setup.
              </p>

              <a href="${verificationUrl}"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Verify Email Address
              </a>

              <p style="color: #67717d; font-size: 14px; margin-top: 24px;">
                Or copy and paste this link in your browser:<br>
                <code style="background-color: #f7f8f8; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">
                  ${verificationUrl}
                </code>
              </p>

              <p style="color: #67717d; font-size: 14px; margin-top: 24px;">
                This link will expire in 24 hours.
              </p>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                If you didn't create a Forebearer account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

/**
 * Send release bundle creation notification
 */
export async function sendReleaseCreatedEmail(email: string, releaseName: string, releaseDate: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Release Bundle Created: ${releaseName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #33373d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fdfdfb; border-radius: 12px; padding: 40px; margin-bottom: 20px;">
              <h1 style="color: #33373d; font-size: 28px; font-weight: 300; margin: 0 0 16px 0;">
                Release Bundle Created
              </h1>
              <p style="color: #67717d; font-size: 16px; margin: 0;">
                ${releaseName}
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #525b66; margin-bottom: 16px;">
                Your release bundle has been created successfully.
              </p>

              <div style="background-color: #f7f8f8; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #525b66; margin: 0 0 8px 0; font-size: 14px;">
                  <strong style="color: #33373d;">Release Name:</strong> ${releaseName}
                </p>
                <p style="color: #525b66; margin: 0; font-size: 14px;">
                  <strong style="color: #33373d;">Scheduled For:</strong> ${releaseDate}
                </p>
              </div>

              <p style="color: #525b66; margin-top: 24px;">
                Your designated trustees will receive access to this release bundle on the scheduled date.
              </p>

              <a href="https://forebearer.app/app/release"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Manage Releases
              </a>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Forebearer. Built with privacy in mind.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send release created email:', error);
    return { success: false, error };
  }
}

/**
 * Send heartbeat reminder email
 */
export async function sendHeartbeatReminderEmail(email: string, nextCheckIn: string, name?: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Heartbeat Check-In Reminder - Forebearer',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #33373d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fdfdfb; border-radius: 12px; padding: 40px; margin-bottom: 20px;">
              <h1 style="color: #33373d; font-size: 28px; font-weight: 300; margin: 0 0 16px 0;">
                Heartbeat Check-In Required
              </h1>
              <p style="color: #67717d; font-size: 16px; margin: 0;">
                Don't forget to check in
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #525b66; margin-bottom: 16px;">
                Hi${name ? ` ${name}` : ''},
              </p>

              <p style="color: #525b66; margin-bottom: 16px;">
                This is a friendly reminder to check in with your Vault heartbeat monitoring.
              </p>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Next Check-In Due:</strong> ${nextCheckIn}
                </p>
              </div>

              <p style="color: #525b66;">
                If you miss your check-in deadline, your designated trustees will receive access to your release bundles.
              </p>

              <a href="https://forebearer.app/app"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Check In Now
              </a>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Forebearer. Built with privacy in mind.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send heartbeat reminder email:', error);
    return { success: false, error };
  }
}

/**
 * Send check-in reminder (updated for new design)
 */
export async function sendCheckInReminder(email: string, daysUntil: number, name?: string, bundleName?: string, bundleId?: string) {
  try {
    // Include bundle ID in URL so dashboard can highlight it
    const checkInUrl = bundleId
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://forebearer.app'}/app?checkin=${bundleId}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://forebearer.app'}/app`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Time to check in - ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #14532d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 40px; margin-bottom: 20px; text-align: center;">
              <h1 style="color: #92400e; font-size: 32px; font-weight: 600; margin: 0 0 16px 0;">
                Time to Check In
              </h1>
              <p style="color: #b45309; font-size: 18px; margin: 0;">
                ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} remaining
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Hi${name ? ` ${name}` : ''},
              </p>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                Just a friendly reminder that your check-in is due soon${bundleName ? ` for your bundle "${bundleName}"` : ''}.
              </p>

              <p style="color: #166534; margin-bottom: 20px; font-size: 16px;">
                If you don't check in before the deadline, ${bundleName ? 'this bundle' : 'your memories'} will automatically be sent to the people you've chosen.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${checkInUrl}"
                   style="display: inline-block; background-color: #22c55e; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Check In Now
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
    console.error('Failed to send check-in reminder:', error);
    return { success: false, error };
  }
}

/**
 * Send release notification to trustee (updated for new design)
 */
export async function sendReleaseNotification(
  trusteeEmail: string,
  trusteeName: string | null,
  senderEmail: string,
  bundleName: string,
  releaseToken: string,
  itemCount: number
) {
  // Release links must always use production URL (they need to work forever, not just in dev)
  // Never use localhost for release links, even when testing locally
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

/**
 * Send bundle release notification to the owner
 */
export async function sendOwnerBundleReleasedNotification(
  ownerEmail: string,
  ownerName: string | null,
  bundleName: string,
  releaseMode: string,
  trusteeCount: number,
  itemCount: number
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
