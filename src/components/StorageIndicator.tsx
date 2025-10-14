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
  const getColor = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-amber-600';
    return 'text-graphite-700';
  };

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-graphite-600" />
              <h3 className="text-sm font-semibold text-graphite-900">Storage Usage</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white text-graphite-600 border border-graphite-200">
                {tierLimits.displayName} Tier
              </span>
            </div>

            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="w-full bg-graphite-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getBarColor()}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-baseline justify-between text-sm">
                <span className={`font-medium ${getColor()}`}>
                  {formatFileSize(usedBytes)} / {formatFileSize(limitBytes)}
                </span>
                <span className={`text-sm ${getColor()}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Upgrade button for free tier users at 80%+ */}
          {tier === 'free' && percentage >= 80 && (
            <button
              onClick={() => setShowUpgradePrompt(true)}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Upgrade
            </button>
          )}
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
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-sm text-amber-700">
              You&apos;re using {percentage.toFixed(0)}% of your storage. Consider upgrading to Plus for 5 GB.
            </p>
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
