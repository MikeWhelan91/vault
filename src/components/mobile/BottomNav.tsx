'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Send, MoreHorizontal, Package, Mail, Settings, X, Crown, Lock } from 'lucide-react';
import { haptics } from '@/lib/mobile';
import { useIsNativeApp } from '@/lib/platform';
import { useState } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import type { TierName } from '@/lib/pricing';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isNativeApp = useIsNativeApp();
  const { metadata, lock } = useCrypto();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!isNativeApp) {
    return null;
  }

  const tier = (metadata?.tier as TierName) || 'free';
  const isPaidUser = tier !== 'free';

  const navItems = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Items', href: '/app/items', icon: FileText },
    { name: 'Releases', href: '/app/release', icon: Send },
  ];

  const moreMenuItems = [
    { name: 'My Bundles', href: '/app/bundles', icon: Package, requiresPaid: false, isAction: false },
    { name: 'Letters', href: '/app/letters', icon: Mail, requiresPaid: true, isAction: false },
    { name: 'Settings', href: '/app/settings', icon: Settings, requiresPaid: false, isAction: false },
  ];

  const handleNavigate = async (href: string) => {
    await haptics.light();
    setShowMoreMenu(false);
    router.push(href);
  };

  const handleMoreClick = async () => {
    await haptics.light();
    setShowMoreMenu(true);
  };

  const handleCloseMenu = async () => {
    await haptics.light();
    setShowMoreMenu(false);
  };

  const handleLockVault = async () => {
    await haptics.medium();
    setShowMoreMenu(false);
    lock();
  };

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const isMoreActive = moreMenuItems.some(item => isActive(item.href));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-graphite-200 bg-white pb-safe-bottom">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? 'text-primary-600'
                    : 'text-graphite-500 active:bg-graphite-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-normal'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isMoreActive
                ? 'text-primary-600'
                : 'text-graphite-500 active:bg-graphite-50'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
            <span className={`text-xs ${isMoreActive ? 'font-semibold' : 'font-normal'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={handleCloseMenu}
          />

          {/* Menu Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl animate-slide-up pb-safe-bottom">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-graphite-900">Menu</h3>
                <button
                  onClick={handleCloseMenu}
                  className="p-2 -mr-2 rounded-full text-graphite-500 hover:bg-graphite-100 active:bg-graphite-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {moreMenuItems.map((item) => {
                  // Skip paid-only items for free users
                  if (item.requiresPaid && !isPaidUser) {
                    return null;
                  }

                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-graphite-700 hover:bg-graphite-50 active:bg-graphite-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'stroke-2' : 'stroke-[1.5]'}`} />
                      <span className={`text-base ${active ? 'font-semibold' : 'font-medium'}`}>
                        {item.name}
                      </span>
                      {item.requiresPaid && (
                        <Crown className="w-4 h-4 ml-auto text-amber-600" />
                      )}
                    </button>
                  );
                })}

                {/* Lock Vault - Separator and Lock button */}
                <div className="pt-2 mt-2 border-t border-graphite-200">
                  <button
                    onClick={handleLockVault}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Lock className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-base font-medium">Lock Vault</span>
                  </button>
                </div>
              </div>

              {/* Upgrade prompt for free users */}
              {!isPaidUser && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-amber-200">
                      <Crown className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-900 mb-1">
                        Upgrade to Plus
                      </h4>
                      <p className="text-xs text-amber-800 mb-3">
                        Unlock Letters and premium features
                      </p>
                      <button
                        onClick={() => handleNavigate('/app/pricing')}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Learn more →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
