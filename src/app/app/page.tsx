import type { Metadata } from 'next';
import DashboardPageClient from './DashboardPageClient';

export const metadata: Metadata = {
  title: 'Dashboard | Forebearer',
  description:
    'Track encrypted storage usage, monitor bundle readiness, and stay on top of your Forebearer account activity from the secure dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
