'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTierLimits, type TierName } from '@/lib/pricing';
import { CreditCard, Check, ArrowLeft, Crown, Loader2 } from 'lucide-react';
import { STRIPE_PRICES } from '@/lib/stripe';
import { useIsNativeApp } from '@/lib/platform';
import { Browser } from '@capacitor/browser';

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { metadata } = useCrypto();
  const isNativeApp = useIsNativeApp();
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isLoadingAnnual, setIsLoadingAnnual] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Check for success/canceled query params
    if (searchParams?.get('success')) {
      setMessage({ type: 'success', text: 'Subscription activated! Your account has been upgraded.' });
    } else if (searchParams?.get('canceled')) {
      setMessage({ type: 'error', text: 'Checkout canceled. No charges were made.' });
    }
  }, [searchParams]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';
  const tierLimits = getTierLimits(tier);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;

  const handleCheckout = async (billingPeriod: 'monthly' | 'annual') => {
    const setLoading = billingPeriod === 'monthly' ? setIsLoadingMonthly : setIsLoadingAnnual;

    try {
      setLoading(true);
      setMessage(null);

      const priceId = billingPeriod === 'monthly' ? STRIPE_PRICES.monthly : STRIPE_PRICES.annual;

      if (!priceId) {
        throw new Error('Price ID not configured. Please contact support.');
      }

      if (!metadata?.userId) {
        throw new Error('User information not available. Please refresh and try again.');
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: metadata.userId,
          userEmail: metadata.userId, // userId is the email in your system
          priceId,
          billingPeriod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        if (isNativeApp) {
          // On mobile, open in in-app browser tab
          await Browser.open({
            url: data.url,
            presentationStyle: 'popover',
            toolbarColor: '#FFFFFF'
          });

          // Show message to refresh after completing payment
          setMessage({
            type: 'success',
            text: 'Complete your payment in the browser. Return here and refresh to see your updated subscription.',
          });
        } else {
          // On web, redirect normally
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to start checkout',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/app/settings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <Card className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </Card>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900">Billing & Subscription</h1>
        <p className="text-sm sm:text-base text-graphite-600 mt-1">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-graphite-900">
                  {tierLimits.displayName} Tier
                </h2>
                {tier === 'free' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-graphite-200 text-graphite-700 rounded-full">
                    Current Plan
                  </span>
                )}
                {tier === 'plus' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-500 text-white rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-graphite-600 mb-3">
                {tier === 'free'
                  ? 'You are currently on the free plan'
                  : 'Thank you for being a Plus subscriber!'}
              </p>
              {tier === 'free' ? (
                <p className="text-2xl font-bold text-graphite-900">$0/month</p>
              ) : (
                <p className="text-2xl font-bold text-graphite-900">
                  $9.99<span className="text-base font-normal text-graphite-600">/month</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Stats */}
      <div>
        <h2 className="text-lg font-semibold text-graphite-900 mb-4">Current Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Storage */}
          <Card>
            <h3 className="text-sm font-medium text-graphite-600 mb-2">Storage</h3>
            <p className="text-2xl font-bold text-graphite-900 mb-1">
              {formatBytes(metadata.totalSize)}
            </p>
            <div className="flex items-center gap-2 text-sm text-graphite-500">
              <div className="flex-1 bg-graphite-200 rounded-full h-1.5">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
              <span>{storagePercentage.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-graphite-500 mt-1">
              of {tierLimits.storage.display}
            </p>
          </Card>

          {/* Bundles */}
          <Card>
            <h3 className="text-sm font-medium text-graphite-600 mb-2">Release Bundles</h3>
            <p className="text-2xl font-bold text-graphite-900 mb-1">
              {/* We'll need to fetch this - for now showing placeholder */}
              -
            </p>
            <p className="text-xs text-graphite-500 mt-1">
              {tierLimits.bundles.display}
            </p>
          </Card>

          {/* Items */}
          <Card>
            <h3 className="text-sm font-medium text-graphite-600 mb-2">Items</h3>
            <p className="text-2xl font-bold text-graphite-900 mb-1">
              {metadata.items.length}
            </p>
            <p className="text-xs text-graphite-500 mt-1">
              Unlimited items
            </p>
          </Card>
        </div>
      </div>

      {/* Plans Comparison */}
      {tier === 'free' && (
        <div>
          <h2 className="text-lg font-semibold text-graphite-900 mb-4">Upgrade to Plus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <Card className="border-2 border-graphite-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-graphite-900 mb-1">Free</h3>
                <p className="text-3xl font-bold text-graphite-900 mb-1">
                  $0<span className="text-base font-normal text-graphite-600">/month</span>
                </p>
                <p className="text-sm text-graphite-500">Current plan</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">300 MB storage</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">1 active release bundle</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Up to 10 trustees per bundle</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Monthly heartbeat check-ins</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-graphite-400 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Email notifications</span>
                </li>
              </ul>
              <Button variant="secondary" className="w-full" disabled>
                Current Plan
              </Button>
            </Card>

            {/* Plus Tier */}
            <Card className="border-2 border-primary-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <div className="mb-4 mt-2">
                <h3 className="text-xl font-bold text-graphite-900 mb-1">Plus</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-3xl font-bold text-graphite-900">
                    $9.99<span className="text-base font-normal text-graphite-600">/month</span>
                  </p>
                  <p className="text-sm text-graphite-500">or $89.99/year</p>
                </div>
                <p className="text-sm text-primary-600 font-medium">Save $30 with annual billing</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">5 GB storage</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">Unlimited release bundles</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">Unlimited trustees</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">Custom heartbeat schedules</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">Release analytics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">Priority support</span>
                </li>
              </ul>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleCheckout('monthly')}
                  disabled={isLoadingMonthly || isLoadingAnnual}
                >
                  {isLoadingMonthly ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Monthly'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleCheckout('annual')}
                  disabled={isLoadingMonthly || isLoadingAnnual}
                >
                  {isLoadingAnnual ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Annually (Save $30)'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Plus Subscription Management */}
      {tier === 'plus' && (
        <div>
          <h2 className="text-lg font-semibold text-graphite-900 mb-4">Manage Subscription</h2>
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-graphite-600 mb-1">Next billing date</h3>
                <p className="text-lg text-graphite-900">-</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-graphite-600 mb-1">Payment method</h3>
                <p className="text-lg text-graphite-900">-</p>
              </div>
              <div className="pt-4 border-t border-graphite-200">
                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
