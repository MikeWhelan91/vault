import type { Metadata } from 'next';
import ItemsPageClient from './ItemsPageClient';

export const metadata: Metadata = {
  title: 'Vault Items | Forebearer',
  description:
    'Review encrypted notes and files, organise by category, and upload new material directly to your Forebearer vault.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ItemsPage() {
  return <ItemsPageClient />;
}
