import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Forebearer <hello@forebearer.app>';
const SUPPORT_EMAIL = 'hello@forebearer.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email to support
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Support Request: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #33373d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #14532d; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                New Support Request
              </h1>
              <p style="color: #166534; font-size: 14px; margin: 0;">
                From: ${name} (${email})
              </p>
            </div>

            <div style="padding: 20px 0;">
              <div style="margin-bottom: 20px;">
                <strong style="color: #33373d;">Subject:</strong>
                <p style="color: #525b66; margin: 4px 0 0 0;">${subject}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <strong style="color: #33373d;">Message:</strong>
                <p style="color: #525b66; margin: 4px 0 0 0; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="background-color: #f7f8f8; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="color: #525b66; margin: 0; font-size: 14px;">
                  <strong>Reply to:</strong> ${email}
                </p>
              </div>
            </div>

            <div style="border-top: 1px solid #d5d9dd; padding-top: 20px; margin-top: 40px;">
              <p style="color: #67717d; font-size: 12px; margin: 0;">
                This message was sent via the Forebearer support form.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'We received your message - Forebearer Support',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #14532d; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 40px; margin-bottom: 20px; text-align: center;">
              <h1 style="color: #14532d; font-size: 28px; font-weight: 600; margin: 0 0 16px 0;">
                Thanks for Reaching Out
              </h1>
              <p style="color: #166534; font-size: 16px; margin: 0;">
                We&apos;ve received your message
              </p>
            </div>

            <div style="padding: 20px 0;">
              <p style="color: #166534; margin-bottom: 20px;">
                Hi ${name},
              </p>

              <p style="color: #166534; margin-bottom: 20px;">
                Thank you for contacting Forebearer support. We&apos;ve received your message about &quot;${subject}&quot; and we&apos;ll get back to you within 24-48 hours.
              </p>

              <p style="color: #166534; margin-bottom: 20px;">
                If you need to add more information, just reply to this email.
              </p>

              <p style="color: #166534; margin-bottom: 20px;">
                Best regards,<br>
                The Forebearer Team
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support email error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
