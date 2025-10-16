'use client';

import { UnlockGate } from '@/components/UnlockGate';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Crown } from 'lucide-react';
import type { TierName } from '@/lib/pricing';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnlockGate>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-graphite-50 text-graphite-900">
        <AppNav />
        <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
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
    { name: 'Settings', href: '/app/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-graphite-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/app"
          className="text-lg font-semibold tracking-tight text-graphite-900"
        >
          Forebearer
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop User actions */}
        <div className="hidden items-center gap-3 md:flex">
          {metadata?.tier === 'plus' && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3.5 w-3.5" />
              Plus
            </div>
          )}
          <span className="max-w-[200px] truncate text-sm text-graphite-500">
            {session.userId || metadata?.userId || 'User'}
          </span>
          <Button variant="ghost" size="sm" onClick={lock}>
            Lock vault
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full border border-graphite-200 p-2 text-graphite-600 hover:text-graphite-900 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-graphite-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="rounded-xl border border-graphite-200 px-3 py-2 text-sm text-graphite-600">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="truncate font-medium">{session.userId || metadata?.userId || 'User'}</p>
                {metadata?.tier === 'plus' && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Crown className="h-3 w-3" />
                    Plus
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  lock();
                }}
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Lock vault
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
