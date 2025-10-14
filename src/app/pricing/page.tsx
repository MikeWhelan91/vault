import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Footer } from '@/components/Footer';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing - Simple & Transparent | Forebearer',
  description: 'Choose the plan that works for you. Free tier with 300 MB storage or Plus tier with 5 GB and unlimited bundles. No hidden fees.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-semibold text-graphite-900 tracking-tight">
            Forebearer
          </Link>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-graphite-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-graphite-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more storage and features. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="border-2 border-graphite-200 hover:border-graphite-300 transition-colors">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-graphite-900 mb-2">Free</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-graphite-900">$0</span>
                <span className="text-graphite-600 ml-2">/month</span>
              </div>
              <p className="text-graphite-600 mb-8">
                Perfect for getting started with digital legacy planning
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">300 MB of storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">1 active release bundle</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Up to 10 trustees per bundle</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Unlimited items</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Upload any file type</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Monthly heartbeat check-ins</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">Email notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-700">End-to-end encryption</span>
                </li>
              </ul>

              <Link href="/signup">
                <Button variant="secondary" className="w-full">
                  Start Free
                </Button>
              </Link>
            </div>
          </Card>

          {/* Plus Tier */}
          <Card className="border-2 border-primary-500 hover:border-primary-600 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
              POPULAR
            </div>
            <div className="p-8 mt-2">
              <h2 className="text-2xl font-bold text-graphite-900 mb-2">Plus</h2>
              <div className="mb-2">
                <span className="text-5xl font-bold text-graphite-900">$9</span>
                <span className="text-graphite-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-primary-600 font-medium mb-6">
                or $99/year (save $9)
              </p>
              <p className="text-graphite-600 mb-8">
                For those who want more storage and advanced features
              </p>

              <ul className="space-y-4 mb-8">
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
                  <span className="text-graphite-900 font-medium">All file types</span>
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
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-graphite-900 font-medium">End-to-end encryption</span>
                </li>
              </ul>

              <Link href="/signup">
                <Button variant="primary" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
              <p className="text-xs text-center text-graphite-500 mt-3">
                Start with free tier, upgrade anytime
              </p>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-graphite-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-graphite-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-graphite-600">
                Yes! You can upgrade to Plus at any time from your account settings. If you downgrade from Plus to Free, you&apos;ll need to ensure you&apos;re within the free tier limits (1 active bundle, 10 trustees per bundle, 300 MB storage).
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-graphite-900 mb-2">
                What happens if I cancel my Plus subscription?
              </h3>
              <p className="text-graphite-600">
                If you cancel your Plus subscription, you&apos;ll be moved to the Free tier at the end of your billing period. You&apos;ll need to ensure your account is within free tier limits. Your data will remain accessible.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-graphite-900 mb-2">
                What counts toward my storage limit?
              </h3>
              <p className="text-graphite-600">
                Everything you upload counts toward your storage limit. This includes all files and notes. Encrypted files are slightly larger than originals due to encryption overhead.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-graphite-900 mb-2">
                Is there a long-term commitment?
              </h3>
              <p className="text-graphite-600">
                No! Both monthly and annual plans can be cancelled at any time. The annual plan offers a discount but is not required.
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-graphite-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-graphite-600">
                We offer a 30-day money-back guarantee on annual subscriptions. Monthly subscriptions can be cancelled at any time and you won&apos;t be charged for the next month.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-graphite-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-graphite-600 mb-6">
                Start with the free tier and upgrade when you need more
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-base px-8">
                  Create Your Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
