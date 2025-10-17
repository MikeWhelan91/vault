'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Send, Settings } from 'lucide-react';
import { haptics } from '@/lib/mobile';
import { useIsNativeApp } from '@/lib/platform';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isNativeApp = useIsNativeApp();

  if (!isNativeApp) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Items', href: '/app/items', icon: FileText },
    { name: 'Releases', href: '/app/release', icon: Send },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const handleNavigate = async (href: string) => {
    await haptics.light();
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-graphite-200 bg-white pb-safe">
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
      </div>
    </nav>
  );
}
