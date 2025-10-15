import type { Metadata } from 'next';
import ReleasePageClient from './ReleasePageClient';

export const metadata: Metadata = {
  title: 'Plan a Release | Forebearer',
  description:
    'Configure a new Forebearer release bundle, choose time-lock or heartbeat delivery, and assign trustees to steward your legacy.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReleasePage() {
  return <ReleasePageClient />;
}
