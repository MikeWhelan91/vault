import type { Metadata } from 'next';
import DashboardClient from './dashboard.client';

export const metadata: Metadata = {
  title: 'Vault Dashboard | Unlatches',
  description: 'Review encrypted items, monitor automated release bundles, and manage storage health from the Unlatches dashboard.',
  keywords: [
    'vault dashboard',
    'encrypted notes overview',
    'release bundle monitoring',
    'unlatches heartbeat cadence',
    'secure storage analytics',
  ],
  openGraph: {
    title: 'Unlatches Vault Dashboard',
    description: 'Monitor encrypted assets, automate releases, and keep trustees aligned from your private Unlatches workspace.',
  },
  twitter: {
    title: 'Unlatches Vault Dashboard',
    description: 'Track encrypted activity, storage, and releases in your private Unlatches workspace.',
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
