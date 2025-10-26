import PasswordsPageClient from './PasswordsPageClient';

export const metadata = {
  title: 'Password Vault | Vault',
  description: 'Securely store and manage your passwords with zero-knowledge encryption',
};

export default function PasswordsPage() {
  return <PasswordsPageClient />;
}
