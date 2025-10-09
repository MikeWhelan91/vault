import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Unlatches <support@unlatches.com>';

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Unlatches - Your Encrypted Storage is Ready',
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
                Welcome to Unlatches
              </h1>
              <p style="color: #67717d; font-size: 16px; margin: 0;">
                Your encrypted storage is ready to use
              </p>
            </div>

            <div style="padding: 20px 0;">
              <h2 style="color: #33373d; font-size: 20px; font-weight: 500; margin: 0 0 16px 0;">
                Getting Started
              </h2>

              <p style="color: #525b66; margin-bottom: 16px;">
                Thank you for choosing Unlatches to protect your digital legacy. Your account has been created successfully.
              </p>

              <div style="background-color: #f7f8f8; border-left: 4px solid #3d9999; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #525b66; margin: 0; font-size: 14px;">
                  <strong style="color: #33373d;">Important:</strong> Your password encrypts all your data using zero-knowledge encryption.
                  We cannot recover your password or decrypt your data if you forget it. Please store it securely.
                </p>
              </div>

              <h3 style="color: #33373d; font-size: 18px; font-weight: 500; margin: 24px 0 12px 0;">
                What You Can Do
              </h3>

              <ul style="color: #525b66; padding-left: 24px; margin: 0 0 24px 0;">
                <li style="margin-bottom: 8px;">Upload encrypted files and notes</li>
                <li style="margin-bottom: 8px;">Create time-locked release bundles</li>
                <li style="margin-bottom: 8px;">Set up heartbeat monitoring</li>
                <li style="margin-bottom: 8px;">Designate trustees for emergency access</li>
              </ul>

              <a href="https://unlatched.com/signin"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Access Your Vault
              </a>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Unlatches. Built with privacy in mind.<br>
                Encrypted with AES-256-GCM. Keys derived with PBKDF2.
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
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://unlatched.com'}/verify?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - Unlatches',
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
                If you didn't create an Unlatches account, you can safely ignore this email.
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

              <a href="https://unlatched.com/app/release"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Manage Releases
              </a>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Unlatches. Built with privacy in mind.
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
export async function sendHeartbeatReminderEmail(email: string, nextCheckIn: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Heartbeat Check-In Reminder - Unlatches',
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

              <a href="https://unlatched.com/app/settings/heartbeat"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Check In Now
              </a>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Unlatches. Built with privacy in mind.
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
 * Send trustee access notification
 */
export async function sendTrusteeAccessEmail(
  trusteeEmail: string,
  ownerEmail: string,
  releaseName: string,
  accessToken: string
) {
  const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://unlatched.com'}/unlock/${accessToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: trusteeEmail,
      subject: `You Have Access to ${ownerEmail}'s Release`,
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
                Access Granted
              </h1>
              <p style="color: #67717d; font-size: 16px; margin: 0;">
                ${releaseName}
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #525b66; margin-bottom: 16px;">
                ${ownerEmail} has designated you as a trustee for their release bundle.
              </p>

              <div style="background-color: #f7f8f8; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #525b66; margin: 0 0 8px 0; font-size: 14px;">
                  <strong style="color: #33373d;">From:</strong> ${ownerEmail}
                </p>
                <p style="color: #525b66; margin: 0; font-size: 14px;">
                  <strong style="color: #33373d;">Release:</strong> ${releaseName}
                </p>
              </div>

              <p style="color: #525b66;">
                Click the button below to access the encrypted files and notes that have been shared with you.
              </p>

              <a href="${accessUrl}"
                 style="display: inline-block; background-color: #3d9999; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0;">
                Access Release Bundle
              </a>

              <div style="background-color: #f7f8f8; border-left: 4px solid #3d9999; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #525b66; margin: 0; font-size: 14px;">
                  <strong style="color: #33373d;">Note:</strong> The files are encrypted. You may need a password or key
                  provided separately to decrypt them.
                </p>
              </div>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                © 2025 Unlatches. Built with privacy in mind.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send trustee access email:', error);
    return { success: false, error };
  }
}
