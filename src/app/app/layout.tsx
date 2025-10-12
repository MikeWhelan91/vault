'use client';

import { UnlockGate } from '@/components/UnlockGate';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnlockGate>
      <div className="min-h-screen bg-primary-50 text-graphite-900 transition-colors">
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
    { name: 'My Bundles', href: '/app/bundles' },
    { name: 'Settings', href: '/app/settings/heartbeat' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="border-b border-graphite-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/app"
            className="text-xl font-semibold text-graphite-900 tracking-tight"
          >
            Unlatches
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
                      ? 'text-primary-600'
                      : 'text-graphite-600 hover:text-graphite-900'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-graphite-600 truncate max-w-[200px]">
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
