'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { HardDrive } from 'lucide-react';
import { getTierLimits } from '@/lib/pricing';
import type { TierName } from '@/lib/pricing';
import { UpgradePrompt } from '@/components/UpgradePrompt';

export interface StorageIndicatorProps {
  tier: TierName;
  usedBytes: number;
  limitBytes: number;
}

export function StorageIndicator({ tier, usedBytes, limitBytes }: StorageIndicatorProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const percentage = Math.min((usedBytes / limitBytes) * 100, 100);
  const tierLimits = getTierLimits(tier);

  // Color coding based on usage
  const getBarColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <>
      <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-3 text-primary-600">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-graphite-500">Storage usage</h3>
              <p className="text-lg font-semibold text-graphite-900">
                {formatFileSize(usedBytes)} of {formatFileSize(limitBytes)}
              </p>
              <p className="text-xs text-graphite-500">{tierLimits.displayName} plan</p>
            </div>
          </div>

          {tier === 'free' && percentage >= 80 && (
            <button
              onClick={() => setShowUpgradePrompt(true)}
              className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              Upgrade for more space
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-graphite-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-graphite-500">
            <span>{percentage.toFixed(1)}% utilised</span>
            <span>Free space: {formatFileSize(limitBytes - usedBytes)}</span>
          </div>
        </div>

        {/* Warning messages */}
        {percentage >= 100 && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-sm text-red-700 font-medium">
              Storage limit reached. Delete items or upgrade to Plus for 5 GB.
            </p>
          </div>
        )}
        {percentage >= 80 && percentage < 100 && tier === 'free' && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            You&apos;re using {percentage.toFixed(0)}% of your storage. Consider upgrading to Plus for 5 GB.
          </div>
        )}
      </Card>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        reason="storage_limit"
      />
    </>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
