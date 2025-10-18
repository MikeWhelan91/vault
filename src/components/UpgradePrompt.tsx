'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UPGRADE_MESSAGES } from '@/lib/pricing';

export type UpgradeReason = 'bundle_limit' | 'trustee_limit' | 'storage_limit' | 'heartbeat_schedule' | 'analytics';

export interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  reason: UpgradeReason;
}

export function UpgradePrompt({ isOpen, onClose, reason }: UpgradePromptProps) {
  const router = useRouter();
  const message = UPGRADE_MESSAGES[reason];

  const handleUpgrade = () => {
    // Use Next.js router to navigate to billing page
    router.push('/app/settings/billing');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={message.title} size="md">
      <div className="space-y-6">
        <p className="text-graphite-600 leading-relaxed">{message.message}</p>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-graphite-900 mb-2">Plus Tier Benefits</h3>
          <ul className="space-y-2 text-sm text-graphite-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>5 GB of storage (vs 300 MB)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Unlimited release bundles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Unlimited trustees per bundle</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Custom heartbeat schedules (weekly, bi-weekly, custom)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Release analytics and insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        <div className="bg-graphite-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-graphite-900 mb-1">$9/month</div>
          <div className="text-sm text-graphite-600">or $99/year (save $9)</div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button variant="primary" onClick={handleUpgrade} className="flex-1">
            {message.cta}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
