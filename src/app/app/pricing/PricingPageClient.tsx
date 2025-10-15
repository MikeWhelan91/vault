'use client';

import React from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, ArrowRight, Package, Users, HardDrive } from 'lucide-react';
import { getTierLimits, type TierName } from '@/lib/pricing';

export default function PricingPageClient() {
  const { metadata } = useCrypto();

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';
  const tierLimits = getTierLimits(tier);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Header */}
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-600">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-graphite-900 sm:text-4xl">Choose your plan</h1>
        <p className="mt-3 text-sm text-graphite-600 sm:text-base">
          {tier === 'free'
            ? 'Unlock expanded storage, unlimited bundles, and richer heartbeat controls with Plus.'
            : 'You have full access to Plus features—review your benefits below or adjust billing anytime.'}
        </p>
      </section>

      {/* Current Usage Banner */}
      <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-graphite-500">Current usage</h3>
            <p className="mt-2 text-lg font-semibold text-graphite-900">
              {formatBytes(metadata.totalSize)} of {tierLimits.storage.display}
            </p>
            <p className="text-xs text-graphite-500">{metadata.items.length} encrypted items stored</p>
          </div>
          <Link href="/app/settings/billing">
            <Button variant="ghost" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              Manage billing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <Card className={`rounded-3xl border ${tier === 'free' ? 'border-primary-400 bg-primary-50/60' : 'border-graphite-200'} shadow-sm`}>
          <div className="p-6">
            {tier === 'free' && (
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-bold bg-primary-500 text-white rounded-full">
                  CURRENT PLAN
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-graphite-900 mb-2">Free</h2>
            <div className="mb-6">
              <span className="text-5xl font-bold text-graphite-900">$0</span>
              <span className="text-graphite-600 ml-2">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">300 MB of storage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">1 active release bundle</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">Up to 10 trustees per bundle</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">Unlimited items</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">Monthly heartbeat only</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-700">Email notifications</span>
              </li>
            </ul>

            {tier === 'free' ? (
              <Button variant="secondary" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="ghost" className="w-full" disabled>
                Downgrade to Free
              </Button>
            )}
          </div>
        </Card>

        {/* Plus Tier */}
        <Card className={`relative overflow-hidden rounded-3xl border ${tier === 'plus' ? 'border-primary-400 bg-primary-50/60' : 'border-primary-500'} shadow-sm`}>
          {tier === 'free' && (
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
              RECOMMENDED
            </div>
          )}
          {tier === 'plus' && (
            <div className="mb-4 mt-2">
              <span className="px-3 py-1 text-xs font-bold bg-primary-500 text-white rounded-full">
                CURRENT PLAN
              </span>
            </div>
          )}
          <div className="p-6 mt-2">
            <h2 className="text-2xl font-bold text-graphite-900 mb-2">Plus</h2>
            <div className="mb-2">
              <span className="text-5xl font-bold text-graphite-900">$9</span>
              <span className="text-graphite-600 ml-2">/month</span>
            </div>
            <p className="text-sm text-primary-600 font-medium mb-6">
              or $99/year (save $9)
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">5 GB of storage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Unlimited release bundles</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Unlimited trustees</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Unlimited items</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Custom heartbeat schedules</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Release analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-graphite-900 font-medium">Priority support</span>
              </li>
            </ul>

            {tier === 'free' ? (
              <>
                <Button variant="primary" className="w-full mb-3">
                  Coming Soon
                </Button>
                <p className="text-xs text-center text-graphite-500">
                  Stripe integration in Phase 2
                </p>
              </>
            ) : (
              <Button variant="primary" className="w-full" disabled>
                Current Plan
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-graphite-900 mb-6 text-center">
          Why Upgrade to Plus?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-graphite-900 mb-2">Unlimited Bundles</h3>
              <p className="text-sm text-graphite-600">
                Create separate release bundles for different groups of loved ones
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-graphite-900 mb-2">Unlimited Trustees</h3>
              <p className="text-sm text-graphite-600">
                Share your memories with as many people as you want
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-graphite-900 mb-2">16x More Storage</h3>
              <p className="text-sm text-graphite-600">
                5 GB lets you store thousands of photos and videos
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-graphite-900 mb-6 text-center">
          Common Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-graphite-900 mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-graphite-600">
              Yes! You can cancel your Plus subscription at any time. You&apos;ll continue to have Plus access until the end of your billing period.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-graphite-900 mb-2">What happens if I downgrade?</h3>
            <p className="text-sm text-graphite-600">
              If you downgrade from Plus to Free, you&apos;ll need to ensure you&apos;re within the free tier limits (1 bundle, 10 trustees per bundle, 300 MB storage). Your existing data remains accessible.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-graphite-900 mb-2">Is my data still encrypted on Plus?</h3>
            <p className="text-sm text-graphite-600">
              Absolutely! Both Free and Plus tiers use the same end-to-end encryption. Your data is always secure, regardless of your plan.
            </p>
          </Card>
        </div>
      </div>

      {/* Back to Billing */}
      <div className="text-center mt-8">
        <Link href="/app/settings/billing">
          <Button variant="ghost">
            View Billing Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
