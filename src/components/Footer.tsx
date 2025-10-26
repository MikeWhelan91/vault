'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsNativeApp } from '@/lib/platform';

export function Footer() {
  const pathname = usePathname();
  const isAppPage = pathname?.startsWith("/app");
  const isNativeApp = useIsNativeApp();

  // Hide footer in native mobile apps
  if (isNativeApp) {
    return null;
  }

  const toMarketingPath = (path: string) => {
    if (!isAppPage) {
      return path;
    }

    if (path === "/") {
      return "/app";
    }

    return `/app${path}`;
  };

  return (
    <footer className="mt-auto border-t border-champagne-300/70 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr,1fr,1fr]">
          <div className="space-y-4">
            <Link
              href={toMarketingPath("/")}
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img
                src="/logotextslim.png"
                alt="Forebearer"
                className="h-9 w-auto"
              />
            </Link>
            <p className="max-w-md text-sm text-plum-700">
              Forebearer helps you organise, protect, and deliver your most meaningful memories. Keep everything encrypted until
              the people you choose need it.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-plum-600">
              <a href="mailto:hello@forebearer.app" className="transition-colors hover:text-primary-600">
                hello@forebearer.app
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-plum-600">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-plum-700">
              <li>
                <Link href={toMarketingPath("/pricing")} className="transition-colors hover:text-primary-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href={toMarketingPath("/signin")} className="transition-colors hover:text-primary-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href={toMarketingPath("/signup")} className="transition-colors hover:text-primary-600">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-plum-600">Resources</h3>
            <ul className="mt-4 space-y-3 text-sm text-plum-700">
              <li>
                <Link href={toMarketingPath("/faq")} className="transition-colors hover:text-primary-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={toMarketingPath("/support")} className="transition-colors hover:text-primary-600">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-champagne-300/70 pt-6 text-sm text-plum-600 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Forebearer. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://forebearer.app/privacy"
              className="transition-colors hover:text-primary-600"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
            <a
              href="https://forebearer.app/terms"
              className="transition-colors hover:text-primary-600"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
