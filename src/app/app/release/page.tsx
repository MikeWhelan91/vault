import type { Metadata } from 'next';
import ReleaseClient from './release.client';

export const metadata: Metadata = {
  title: 'Automated Release Planner | Unlatches Vault',
  description: 'Design time-locked or heartbeat-triggered release bundles for encrypted assets. Assign trustees and review every encrypted item before launch.',
  keywords: [
    'release bundle planner',
    'time lock encryption',
    'heartbeat monitoring releases',
    'trustee assignment',
    'secure data orchestration',
  ],
  openGraph: {
    title: 'Plan Encrypted Releases | Unlatches',
    description: 'Configure time-lock and heartbeat release bundles that share encrypted assets with trusted recipients.',
  },
  twitter: {
    title: 'Plan Encrypted Releases | Unlatches',
    description: 'Build encrypted release bundles, assign trustees, and automate delivery windows.',
  },
};

export default function ReleasePage() {
  return <ReleaseClient />;
}
