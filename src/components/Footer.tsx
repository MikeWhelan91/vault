'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isAppPage = pathname?.startsWith('/app');

  return (
    <footer className="border-t border-graphite-200 py-12 bg-white mt-auto">
      <div className="container mx-auto px-6 text-center text-graphite-600">
        <p className="text-sm">&copy; 2025 Forebearer. Share what matters.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <Link href={isAppPage ? "/app/pricing" : "/pricing"} className="hover:text-graphite-900">Pricing</Link>
          <Link href={isAppPage ? "/app/faq" : "/faq"} className="hover:text-graphite-900">FAQ</Link>
          <Link href={isAppPage ? "/app/support" : "/support"} className="hover:text-graphite-900">Support</Link>
        </div>
      </div>
    </footer>
  );
}
