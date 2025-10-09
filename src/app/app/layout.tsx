'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UnlockGate } from '@/components/UnlockGate';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnlockGate>
      <div className="relative min-h-screen overflow-x-hidden bg-ivory-50 dark:bg-graphite-900">
        <div className="pointer-events-none absolute inset-0 bg-accent-100/30 blur-3xl dark:bg-primary-900/20"></div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <AppNav />
          <main className="container mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-12">
            <div className="rounded-[32px] border border-graphite-200/60 bg-white/70 p-1 shadow-[0_40px_90px_-60px_rgba(51,55,61,0.6)] backdrop-blur-xl dark:border-graphite-700/60 dark:bg-graphite-900/70">
              <div className="rounded-[28px] border border-white/40 bg-white/70 p-8 dark:border-white/5 dark:bg-graphite-900/70">
                {children}
              </div>
            </div>
          </main>
        </div>
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
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-graphite-800/70 dark:bg-graphite-900/70">
      <div className="container mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <Link href="/app" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-graphite-900 dark:text-ivory-50">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-graphite-900 text-ivory-50 text-base font-semibold shadow-[0_10px_30px_-18px_rgba(51,55,61,0.6)] dark:bg-ivory-50 dark:text-graphite-900">
              U
            </span>
            Unlatches Vault
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-graphite-200/70 bg-white/80 px-2 py-1 shadow-[0_10px_30px_-24px_rgba(51,55,61,0.45)] backdrop-blur-lg dark:border-graphite-700/60 dark:bg-graphite-900/80 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full
                  ${
                    isActive(item.href)
                      ? 'bg-graphite-900 text-white shadow-sm dark:bg-ivory-50 dark:text-graphite-900'
                      : 'text-graphite-600 hover:text-graphite-900 dark:text-ivory-300 dark:hover:text-ivory-50'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs uppercase tracking-[0.2em] text-graphite-400 dark:text-graphite-300">Signed in</span>
              <span className="text-sm font-medium text-graphite-700 dark:text-ivory-50">
                {session.userId || metadata?.userId || 'Vault member'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={lock} className="rounded-full border border-graphite-200/80 bg-white/70 px-5 py-2 shadow-sm hover:bg-graphite-100 dark:border-graphite-700/80 dark:bg-graphite-800/80">
              Lock
            </Button>
          </div>
        </div>

        <nav className="mt-4 flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-graphite-200/70 bg-white/80 p-2 shadow-[0_10px_30px_-28px_rgba(51,55,61,0.45)] backdrop-blur-lg dark:border-graphite-700/60 dark:bg-graphite-900/80 md:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-center text-sm font-medium transition-colors
                ${
                  isActive(item.href)
                    ? 'bg-graphite-900 text-white shadow-sm dark:bg-ivory-50 dark:text-graphite-900'
                    : 'text-graphite-600 hover:text-graphite-900 dark:text-ivory-300 dark:hover:text-ivory-50'
                }
              `}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
