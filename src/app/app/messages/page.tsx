import type { Metadata } from 'next';
import MessagesPageClient from './MessagesPageClient';

export const metadata: Metadata = {
  title: 'Video Messages | Forebearer',
  description:
    'Record encrypted video and audio messages for future delivery to loved ones.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MessagesPage() {
  return <MessagesPageClient />;
}
