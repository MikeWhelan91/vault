import type { Metadata } from 'next';
import ItemsPageClient from './ItemsPageClient';

export const metadata: Metadata = {
  title: 'My Vault | Forebearer',
  description:
    'Manage all your encrypted files, video messages, letters, and digital assets in one secure vault.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ItemsPage() {
  return <ItemsPageClient />;
}
