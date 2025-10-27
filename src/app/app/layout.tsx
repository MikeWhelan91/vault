'use client';

import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { Crown, ChevronDown, Settings, Lock } from 'lucide-react';
import type { TierName } from '@/lib/pricing';
import { useIsNativeApp } from '@/lib/platform';
import { BottomNav } from '@/components/mobile/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isNativeApp = useIsNativeApp();
  const { isUnlocked } = useCrypto();
  const router = useRouter();

  // Redirect to signin if not unlocked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/signin');
    }
  }, [isUnlocked, router]);

  // Don't render anything if not unlocked (will redirect)
  if (!isUnlocked) {
    return null;
  }

  return (
    <div className={`flex min-h-screen flex-col overflow-x-hidden bg-warm-50 text-warm-900 ${isNativeApp ? 'pt-safe-top pb-safe-bottom' : ''}`}>
      <AppNav />
      <main className={`w-full flex-1 px-4 sm:px-6 lg:px-8 ${isNativeApp ? 'pt-6 pb-24' : 'py-8'}`}>
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

function AppNav() {
  const pathname = usePathname();
  const { lock, metadata, session } = useCrypto();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isNativeApp = useIsNativeApp();

  const tier = (metadata?.tier as TierName) || 'free';
  const isPaidUser = tier !== 'free';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/app' },
    { name: 'My Vault', href: '/app/items' },
    { name: 'Create', href: '/app/release' },
    { name: 'My Bundles', href: '/app/bundles' },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Hide entire navbar on mobile apps (using bottom nav instead)
  if (isNativeApp) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-warm-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/app"
          className="transition-opacity hover:opacity-80"
        >
          <img
            src="/logotextslim.png"
            alt="Forebearer"
            className="h-8 w-auto"
          />
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
                  : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop User actions */}
        <div className="hidden items-center gap-3 md:flex" ref={dropdownRef}>
          {metadata?.isPaidTier(tier) && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3.5 w-3.5" />
              Plus
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-warm-200 px-3 py-2 text-sm text-warm-700 transition-colors hover:bg-warm-50"
            >
              <span className="max-w-[200px] truncate">
                {session.userId || metadata?.userId || 'User'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-warm-200 bg-white shadow-lg">
                <div className="py-1">
                  <Link
                    href="/app/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-warm-700 transition-colors hover:bg-warm-50"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      lock();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-warm-700 transition-colors hover:bg-warm-50"
                  >
                    <Lock className="h-4 w-4" />
                    Lock vault
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full border border-warm-200 p-2 text-warm-600 hover:text-warm-900 md:hidden"
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
        <div className="border-t border-warm-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="rounded-xl border border-warm-200 px-3 py-2 text-sm text-warm-600">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="truncate font-medium">{session.userId || metadata?.userId || 'User'}</p>
                {metadata?.isPaidTier(tier) && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Crown className="h-3 w-3" />
                    Plus
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Link
                  href="/app/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-warm-700 hover:text-primary-600"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    lock();
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-warm-700 hover:text-primary-600"
                >
                  <Lock className="h-4 w-4" />
                  Lock vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
