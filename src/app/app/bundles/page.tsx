import type { Metadata } from 'next';
import BundlesPageClient from './BundlesPageClient';

export const metadata: Metadata = {
  title: 'Release Bundles | Forebearer',
  description:
    'Review, organise, and expand your Forebearer release bundles, including trustees, delivery cadence, and item coverage.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BundlesPage() {
  return <BundlesPageClient />;
}
