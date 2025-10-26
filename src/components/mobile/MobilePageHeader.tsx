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

  // Desktop: left-aligned professional layout
  if (!isNativeApp) {
    return (
      <section className="rounded-3xl border border-champagne-300 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left side: Icon, title, subtitle */}
          <div className="flex items-start gap-4 flex-1">
            {Icon && (
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 ${iconColor}`}>
                <Icon className="h-7 w-7" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-semibold text-espresso-900 sm:text-3xl">{title}</h1>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && <p className="mt-2 text-sm text-espresso-700 leading-relaxed max-w-2xl">{subtitle}</p>}
            </div>
          </div>

          {/* Right side: Actions */}
          {actions && (
            <div className="flex flex-col gap-3 sm:flex-shrink-0 sm:items-end">
              {actions}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Mobile native: left-aligned, compact, modern
  return (
    <div className="bg-white border-b border-champagne-300 px-4 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 ${iconColor}`}>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-display text-xl font-bold text-espresso-900 leading-tight">{title}</h1>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-espresso-700 leading-snug">{subtitle}</p>
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
