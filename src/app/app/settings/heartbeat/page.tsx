import type { Metadata } from 'next';
import HeartbeatClient from './heartbeat.client';

export const metadata: Metadata = {
  title: 'Heartbeat Monitoring | Unlatches Vault',
  description: 'Configure cadence reminders and automate trustee releases when heartbeat check-ins are missed.',
  keywords: [
    'heartbeat monitoring',
    'release automation',
    'trustee notifications',
    'vault heartbeat cadence',
    'secure inactivity detection',
  ],
  openGraph: {
    title: 'Heartbeat Monitoring | Unlatches',
    description: 'Tune inactivity detection cadences to keep encrypted releases aligned with your intent.',
  },
  twitter: {
    title: 'Heartbeat Monitoring | Unlatches',
    description: 'Configure heartbeat reminders and automated release escalations inside Unlatches.',
  },
};

export default function HeartbeatSettingsPage() {
  return <HeartbeatClient />;
}
