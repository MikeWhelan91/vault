import type { Metadata } from 'next';
import SupportPageClient from './SupportPageClient';

export const metadata: Metadata = {
  title: 'Get Support | Forebearer',
  description:
    'Submit secure support requests, review response times, and find answers to Forebearer account questions inside the app experience.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SupportPage() {
  return <SupportPageClient />;
}
