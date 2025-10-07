'use client';

import { UnlockGate } from '@/components/UnlockGate';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnlockGate>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </UnlockGate>
  );
}

function AppNav() {
  const pathname = usePathname();
  const { lock, metadata, session } = useCrypto();

  const navigation = [
    { name: 'Dashboard', href: '/app' },
    { name: 'Items', href: '/app/items' },
    { name: 'Releases', href: '/app/release' },
    { name: 'Settings', href: '/app/settings/heartbeat' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/app" className="text-xl font-bold text-gray-900 dark:text-white">
            🔒 Vault
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-sm font-medium transition-colors
                  ${
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
              {session.userId || metadata?.userId || 'User'}
            </span>
            <Button variant="ghost" size="sm" onClick={lock}>
              Lock
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
