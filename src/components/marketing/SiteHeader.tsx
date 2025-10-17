"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAppPage = pathname?.startsWith("/app");

  const resolveHref = (href: string) => {
    if (!isAppPage) {
      return href;
    }

    if (href === "/") {
      return "/app";
    }

    return `/app${href}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-200/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link
            href={resolveHref("/")}
            className="transition-opacity hover:opacity-80"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/logotextslim.png"
              alt="Forebearer"
              width={200}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-graphite-600 lg:flex">
            {NAV_LINKS.map((link) => {
              const target = resolveHref(link.href);
              const isActive = pathname === target || pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={target}
                  className={`transition-colors hover:text-primary-600 ${
                    isActive ? "text-primary-600" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href={resolveHref("/signin")} className="text-sm font-medium text-graphite-600 transition-colors hover:text-primary-600">
            Sign In
          </Link>
          <Link href={resolveHref("/signup")}>
            <Button size="sm">Start Free</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-graphite-200 p-2 text-graphite-700 transition-colors hover:bg-graphite-100 hover:text-primary-600 lg:hidden"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-graphite-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
            {NAV_LINKS.map((link) => {
              const target = resolveHref(link.href);
              return (
                <Link
                  key={link.href}
                  href={target}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-graphite-700 transition-colors hover:text-primary-600"
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={resolveHref("/signin")}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-graphite-700 transition-colors hover:text-primary-600"
              >
                Sign In
              </Link>
              <Link href={resolveHref("/signup")} onClick={() => setIsOpen(false)}>
                <Button className="w-full">Start Free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
