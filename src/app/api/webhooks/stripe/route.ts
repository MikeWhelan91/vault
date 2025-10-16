import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const dbUserId = session.client_reference_id; // Database user ID

        if (dbUserId) {
          // Update user to Plus tier and clear grace period
          await db.user.update({
            where: { id: dbUserId },
            data: {
              tier: 'plus',
              storageLimit: 5368709120, // 5 GB in bytes
              gracePeriodEndsAt: null, // Clear any existing grace period
            },
          });
          console.log(`User ${dbUserId} upgraded to Plus tier via checkout (grace period cleared)`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const dbUserId = subscription.metadata.dbUserId;

        if (dbUserId && subscription.status === 'active') {
          await db.user.update({
            where: { id: dbUserId },
            data: {
              tier: 'plus',
              storageLimit: 5368709120,
              gracePeriodEndsAt: null,
            },
          });
          console.log(`User ${dbUserId} subscription created and upgraded to Plus tier`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const dbUserId = subscription.metadata.dbUserId;

        if (dbUserId && subscription.status === 'active') {
          await db.user.update({
            where: { id: dbUserId },
            data: {
              tier: 'plus',
              storageLimit: 5368709120,
              gracePeriodEndsAt: null,
            },
          });
          console.log(`User ${dbUserId} subscription updated to active`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const dbUserId = subscription.metadata.dbUserId;

        if (dbUserId) {
          // Get user's current usage before downgrade
          const user = await db.user.findUnique({
            where: { id: dbUserId },
            select: { totalSize: true, email: true },
            include: {
              releaseBundles: {
                where: { released: false },
              },
            },
          });

          if (!user) {
            console.error(`User ${dbUserId} not found during subscription cancellation`);
            break;
          }

          const isOverStorageLimit = Number(user.totalSize) > 314572800; // 300MB
          const isOverBundleLimit = user.releaseBundles.length > 1;

          // Set 30-day grace period if user exceeds free tier limits
          const gracePeriodEndsAt = (isOverStorageLimit || isOverBundleLimit)
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            : null;

          // Downgrade user to Free tier with grace period
          await db.user.update({
            where: { id: dbUserId },
            data: {
              tier: 'free',
              storageLimit: 314572800, // 300 MB in bytes
              gracePeriodEndsAt,
            },
          });

          const currentUsageGB = Number(user.totalSize) / (1024 * 1024 * 1024);
          const freeLimitMB = 300;

          if (isOverStorageLimit || isOverBundleLimit) {
            console.warn(
              `User ${dbUserId} (${user.email}) downgraded to Free tier. ` +
              `Storage: ${currentUsageGB.toFixed(2)}GB / ${freeLimitMB}MB. ` +
              `Bundles: ${user.releaseBundles.length} / 1. ` +
              `30-day grace period starts now (expires: ${gracePeriodEndsAt?.toISOString()}).`
            );
            // TODO: Send email notification about grace period and data deletion warning
          } else {
            console.log(`User ${dbUserId} downgraded to Free tier (within limits)`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for customer ${invoice.customer}. Amount: ${invoice.amount_paid / 100} ${invoice.currency}`);
        // You could log this to a payments table or send a receipt email
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`Payment failed for customer ${invoice.customer}`);
        // TODO: Send email notification to customer about failed payment
        // TODO: Consider suspending access after multiple failures
        break;
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment action required for customer ${invoice.customer} (likely 3D Secure)`);
        // TODO: Send email to customer with link to authenticate payment
        // The hosted invoice URL is available at: invoice.hosted_invoice_url
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
