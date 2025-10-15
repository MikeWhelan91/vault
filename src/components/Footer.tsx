'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isAppPage = pathname?.startsWith('/app');

  return (
    <footer className="border-t border-graphite-200 py-8 bg-white mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-3 items-center text-sm text-graphite-600">
          {/* Left - Empty or logo */}
          <div></div>

          {/* Center - Links */}
          <div className="flex justify-center gap-6">
            <Link href={isAppPage ? "/app/pricing" : "/pricing"} className="hover:text-graphite-900">Pricing</Link>
            <Link href={isAppPage ? "/app/faq" : "/faq"} className="hover:text-graphite-900">FAQ</Link>
            <Link href={isAppPage ? "/app/support" : "/support"} className="hover:text-graphite-900">Support</Link>
          </div>

          {/* Right - Copyright */}
          <div className="text-right">
            &copy; 2025 Forebearer. Share what matters.
          </div>
        </div>
      </div>
    </footer>
  );
}
