'use client';

import { useIsNativeApp } from '@/lib/platform';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function MobilePageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary-600',
  actions,
  badge,
}: MobilePageHeaderProps) {
  const isNativeApp = useIsNativeApp();

  // Desktop: centered card layout
  if (!isNativeApp) {
    return (
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-2 text-center">
            {Icon && (
              <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ${iconColor}`}>
                <Icon className="h-7 w-7" />
              </div>
            )}
            <h1 className="text-3xl font-semibold text-graphite-900 sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-graphite-600">{subtitle}</p>}
            {badge && <div className="mt-2 flex justify-center">{badge}</div>}
          </div>
          {actions && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {actions}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Mobile native: left-aligned, compact, modern
  return (
    <div className="bg-white border-b border-graphite-100 px-4 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 ${iconColor}`}>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-graphite-900 leading-tight">{title}</h1>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-graphite-600 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
