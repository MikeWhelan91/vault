import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};

export const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_1SIwcIADpUZ7irH3G7Gy1tGd',
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || 'price_1SIwdTADpUZ7irH3mwQDVILf',
};
