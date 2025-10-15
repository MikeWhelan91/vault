import type { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Account Plans | Forebearer',
  description:
    'Compare Forebearer membership tiers, understand encrypted storage limits, and upgrade to unlock more releases and trustees.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
