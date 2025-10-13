'use client';

import { UnlockGate } from '@/components/UnlockGate';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Desktop User actions */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-graphite-600 truncate max-w-[200px]">
              {session.userId || metadata?.userId || 'User'}
            </span>
            <Button variant="ghost" size="sm" onClick={lock}>
              Lock
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-graphite-600 hover:text-graphite-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-graphite-200">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-graphite-600 hover:bg-graphite-50 hover:text-graphite-900'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-graphite-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-graphite-600 truncate">
                  {session.userId || metadata?.userId || 'User'}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    lock();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-graphite-600 hover:bg-graphite-50 hover:text-graphite-900"
                >
                  Lock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
