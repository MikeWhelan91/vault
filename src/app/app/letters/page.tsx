import { Metadata } from 'next';
import LettersPageClient from './LettersPageClient';

export const metadata: Metadata = {
  title: 'Scheduled Letters | Forebearer',
  description: 'Schedule letters to be sent on special dates',
};

export default function LettersPage() {
  return <LettersPageClient />;
}
