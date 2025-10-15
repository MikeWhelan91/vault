import type { Metadata } from 'next';
import SettingsPageClient from './SettingsPageClient';

export const metadata: Metadata = {
  title: 'Vault Settings | Forebearer',
  description:
    'Manage encryption keys, account preferences, notification cadence, and vault controls for your logged-in Forebearer experience.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
