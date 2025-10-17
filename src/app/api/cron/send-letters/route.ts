import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET /api/cron/send-letters
 * Cron job to send scheduled letters that are due
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find letters that should be sent
    const dueLetters = await prisma.scheduledLetter.findMany({
      where: {
        sent: false,
        scheduleDate: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    const results = [];

    for (const letter of dueLetters) {
      try {
        // For yearly letters, update to next year
        if (letter.scheduleType === 'yearly' && letter.yearlyMonth && letter.yearlyDay) {
          const nextYear = now.getFullYear() + 1;
          const nextDate = new Date(nextYear, letter.yearlyMonth - 1, letter.yearlyDay);

          // Update to next year instead of marking as sent
          await prisma.scheduledLetter.update({
            where: { id: letter.id },
            data: {
              scheduleDate: nextDate,
            },
          });
        } else {
          // Mark as sent for one-time letters
          await prisma.scheduledLetter.update({
            where: { id: letter.id },
            data: {
              sent: true,
              sentAt: now,
            },
          });
        }

        // Send the letter via email
        const senderEmail = letter.user.email || 'unknown';
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Forebearer <hello@forebearer.app>',
          to: letter.recipient,
          subject: letter.title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f7f7f7; padding: 20px; border-bottom: 1px solid #e2e8f0; }
                .content { background: #ffffff; padding: 30px; }
                .letter-body { white-space: pre-wrap; font-size: 15px; line-height: 1.8; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="header">
                <p style="margin: 0; font-size: 14px; color: #64748b;">${letter.user.name || senderEmail} (${senderEmail}) has sent you a letter</p>
              </div>
              <div class="content">
                <div class="letter-body">${letter.letterContent.replace(/\n/g, '<br>')}</div>
                <div class="footer">
                  <p style="margin: 0;">This letter was scheduled and sent via <a href="https://forebearer.app" style="color: #667eea; text-decoration: none;">Forebearer</a></p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        results.push({
          id: letter.id,
          title: letter.title,
          status: 'sent',
        });
      } catch (error) {
        console.error(`Failed to send letter ${letter.id}:`, error);
        results.push({
          id: letter.id,
          title: letter.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: dueLetters.length,
      results,
    });
  } catch (error) {
    console.error('Send letters cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
