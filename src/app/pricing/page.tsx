import Link from "next/link";
import { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export const metadata: Metadata = {
  title: "Pricing - Plans for Every Legacy | Forebearer",
  description:
    "Choose the Forebearer plan that fits your digital legacy. Start free with 300 MB or go Plus for 5 GB, unlimited bundles, and advanced release controls.",
  alternates: {
    canonical: "https://forebearer.app/pricing",
  },
  openGraph: {
    title: "Forebearer Pricing",
    description:
      "Transparent plans for encrypted digital legacy storage. Start free or upgrade for advanced automations and analytics.",
    url: "https://forebearer.app/pricing",
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    badge: "Start here",
    description: "Perfect for capturing your first memories and testing our workflow.",
    highlight: false,
    features: [
      "300 MB encrypted storage",
      "1 active release bundle",
      "Up to 10 trustees per bundle",
      "1 video recording",
      "Unlimited file types",
      "Monthly heartbeat check-ins",
      "Email notifications",
      "End-to-end encryption",
    ],
    cta: {
      label: "Create free account",
      href: "/signup",
    },
  },
  {
    name: "Plus",
    price: "$9.99",
    cadence: "per month",
    badge: "Most popular",
    description: "Unlock more storage, unlimited bundles, and advanced features.",
    highlight: true,
    features: [
      "5 GB encrypted storage",
      "Unlimited release bundles",
      "Unlimited trustees",
      "Unlimited video recordings",
      "Bulk file uploads",
      "Custom heartbeat schedules",
      "Conditional releases",
      "Letter scheduler",
    ],
    cta: {
      label: "Upgrade to Plus",
      href: "/signup",
    },
    footnote: "Or $89.99/year (save $30)",
  },
];

const differentiators = [
  {
    title: "Only encrypted copies stored",
    detail: "Everything is encrypted locally before upload. We never see your files or your passphrase.",
  },
  {
    title: "Trustee experience that guides them",
    detail: "Recipients get step-by-step instructions and confirmation receipts the moment a release arrives.",
  },
  {
    title: "Heartbeat automation without stress",
    detail: "Set flexible grace periods, pause notifications while travelling, and resume with one click.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-champagne-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Simple pricing
            </span>
            <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight text-espresso-900 sm:text-5xl">
              Secure storage and delivery that scales with your legacy
            </h1>
            <p className="max-w-2xl text-base text-espresso-600 sm:text-lg">
              Start with a free vault and upgrade when you need more capacity or advanced automations. No hidden fees, no setup charges, cancel anytime.
            </p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex h-full flex-col border-champagne-200 p-8 ${
                plan.highlight
                  ? "border-primary-300 bg-white shadow-md ring-1 ring-primary-100"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                    {plan.badge}
                  </p>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-espresso-900">{plan.name}</h2>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl font-semibold text-primary-600">{plan.price}</p>
                  <p className="text-xs uppercase tracking-wide text-espresso-500">{plan.cadence}</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-espresso-600">{plan.description}</p>

              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-espresso-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 rounded-lg border border-champagne-200 bg-champagne-50 px-4 py-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                <Link href={plan.cta.href}>
                  <Button className="w-full" variant={plan.highlight ? "primary" : "secondary"}>
                    {plan.cta.label}
                  </Button>
                </Link>
                {plan.footnote ? (
                  <p className="text-xs text-espresso-500">{plan.footnote}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-3xl border border-champagne-200 bg-white p-10 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-espresso-900 sm:text-3xl">Need a custom arrangement?</h2>
            <p className="mt-4 text-base text-espresso-600">
              Planning to archive large media libraries or coordinate releases for an estate? Talk to us about volume discounts, concierge onboarding, and bespoke support.
            </p>
            <Link
              href="mailto:hello@forebearer.app"
              className="hover-underline mt-6 inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Email hello@forebearer.app &rarr;
            </Link>
          </div>

          <div className="space-y-5">
            {differentiators.map((item) => (
              <Card key={item.title} className="border-champagne-200 bg-white p-6">
                <h3 className="font-display text-lg font-semibold text-espresso-900">{item.title}</h3>
                <p className="mt-2 text-sm text-espresso-600">{item.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-primary-200 bg-primary-50 px-8 py-12 text-center shadow-sm sm:px-12 lg:px-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-espresso-900 sm:text-4xl">
            Try Forebearer free and upgrade when you are ready
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-espresso-600">
            Create your vault in minutes. Add trustees, configure releases, and only upgrade once you are confident it fits your needs.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start for free
              </Button>
            </Link>
            <Link href="/faq" className="hover-underline text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
              Explore common questions
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
