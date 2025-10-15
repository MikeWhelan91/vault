import type { Metadata } from 'next';
import FaqPageClient from './FaqPageClient';

export const metadata: Metadata = {
  title: 'Vault FAQ | Forebearer',
  description:
    'Browse answers to common Forebearer account, encryption, and release-bundle questions directly inside the secure app.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}
