import type { Metadata } from 'next';
import AssetsPageClient from './AssetsPageClient';

export const metadata: Metadata = {
  title: 'Digital Assets | Forebearer',
  description:
    'Track and manage your digital assets inventory for beneficiaries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AssetsPage() {
  return <AssetsPageClient />;
}
