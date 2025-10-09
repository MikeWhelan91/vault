import type { Metadata } from 'next';
import ItemsClient from './items.client';

export const metadata: Metadata = {
  title: 'Encrypted Items | Unlatches Vault',
  description: 'Browse and manage encrypted files and notes stored in your Unlatches vault. Organise assets before bundling them into secure releases.',
  keywords: [
    'encrypted items',
    'secure document storage',
    'zero knowledge notes',
    'vault catalogue',
    'private file manager',
  ],
  openGraph: {
    title: 'Unlatches Encrypted Items',
    description: 'Organise encrypted files and notes across your Unlatches vault before scheduling releases.',
  },
  twitter: {
    title: 'Unlatches Encrypted Items',
    description: 'Manage the encrypted catalogue of files and notes in your Unlatches vault.',
  },
};

export default function ItemsPage() {
  return <ItemsClient />;
}
