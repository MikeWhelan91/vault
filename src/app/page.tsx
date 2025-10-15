import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/marketing/SiteHeader";

const bulletPoints = [
  "AES-256 end-to-end encryption on every upload",
  "Time-lock and heartbeat releases you fully control",
  "Automatic delivery with receipt tracking for trustees",
];

const featureHighlights = [
  {
    title: "Upload once",
    description:
      "Organise photos, videos, letters, and essential files into dedicated bundles that stay encrypted at rest.",
    image: "/upload.jpg",
  },
  {
    title: "Decide the moment",
    description:
      "Schedule a delivery date or use heartbeat mode to release items when check-ins stop, no manual follow-up required.",
    image: "/decide.jpg",
  },
  {
    title: "We handle the delivery",
    description:
      "Trustees receive secure links, access logs, and guidance the instant a release is triggered—no account needed.",
    image: "/handle.jpg",
  },
];

const timeline = [
  {
    title: "Bundle what matters",
    description:
      "Drag in photos, videos, password files, or letters. Everything is encrypted locally before it ever leaves your device.",
  },
  {
    title: "Choose trustees & timing",
    description:
      "Add as many recipients as you need, set a specific future date, or enable heartbeat mode with custom check-in cadence.",
  },
  {
    title: "Confirm and relax",
    description:
      "We keep your bundles secure, remind you about upcoming releases, and deliver automatically with full audit trails.",
  },
];

const securityFeatures = [
  {
    title: "Zero-knowledge architecture",
    description:
      "Forebearer never has access to your passphrase. Files are encrypted client-side and stored as unreadable shards.",
  },
  {
    title: "Proactive monitoring",
    description:
      "Heartbeat pings, delivery verification, and access receipts ensure you always know when a bundle moves.",
  },
  {
    title: "Redundant storage",
    description:
      "Backed by Cloudflare R2 with automatic replication, ensuring your legacy is preserved without single points of failure.",
  },
];

const faqPreview = [
  {
    question: "What happens if I stop responding to heartbeat check-ins?",
    answer:
      "Heartbeat releases automatically notify trustees after the grace period you define. You can reset or pause at any time.",
  },
  {
    question: "Do recipients need a Forebearer account?",
    answer:
      "No. Trustees receive a secure delivery link with built-in guidance, even if they have never used Forebearer before.",
  },
  {
    question: "Can I edit bundles after uploading?",
    answer:
      "Yes. Add, remove, or reorder items whenever you like. Changes are synced instantly with your encryption keys.",
  },
];

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Forebearer",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description: "300 MB storage for photos, videos, and messages",
      },
      {
        "@type": "Offer",
        price: "9",
        priceCurrency: "USD",
        name: "Plus Plan",
        description: "5 GB storage with unlimited bundles and trustees",
      },
    ],
    description:
      "Forebearer is the secure way to store and deliver digital memories. Encrypt, schedule, and release important files and messages with zero-knowledge privacy.",
    featureList: [
      "End-to-end encryption",
      "Time-lock releases",
      "Heartbeat monitoring",
      "Secure file storage",
      "Automatic delivery to trustees",
      "Zero-knowledge privacy",
    ],
    screenshot: "https://forebearer.app/hero.jpg",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "1",
    },
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Forebearer",
    url: "https://forebearer.app",
    logo: "https://forebearer.app/logo.png",
    description: "Secure digital legacy and memory storage platform",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@forebearer.app",
      contactType: "Customer Support",
    },
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPreview.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-graphite-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />

      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                Secure digital legacy
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-graphite-900 sm:text-5xl lg:text-6xl">
                Leave memories that arrive exactly when they should
              </h1>
              <p className="max-w-xl text-lg text-graphite-600 lg:text-xl">
                Forebearer encrypts and safeguards your most meaningful files, then delivers them automatically to the right people exactly when you decide.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {bulletPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-xl border border-graphite-200 bg-white/80 p-4 shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-graphite-700">{point}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start for free
                  </Button>
                </Link>
                <Link href="/pricing" className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700">
                  View pricing &rarr;
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 pt-4 text-sm text-graphite-600">
                <div>
                  <p className="text-3xl font-semibold text-primary-600">0</p>
                  <p className="mt-1 max-w-[14ch] text-xs uppercase tracking-wide text-graphite-500">Unencrypted copies stored</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-primary-600">100%</p>
                  <p className="mt-1 max-w-[18ch] text-xs uppercase tracking-wide text-graphite-500">Control over delivery timing</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-primary-600">24/7</p>
                  <p className="mt-1 max-w-[18ch] text-xs uppercase tracking-wide text-graphite-500">Monitoring and notifications</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-graphite-200/80 bg-white shadow-2xl">
                <Image
                  src="/hero.jpg"
                  alt="Forebearer dashboard showcasing scheduled releases"
                  width={1120}
                  height={900}
                  className="h-full w-full object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 bg-white/90 px-6 py-6 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-wide text-graphite-500">
                    At-a-glance
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Upcoming releases</p>
                      <p className="text-lg font-semibold text-graphite-900">Heartbeat bundle – 3 days</p>
                    </div>
                    <div className="rounded-xl border border-graphite-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Trustee delivery</p>
                      <p className="text-lg font-semibold text-graphite-900">Confirmed 2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-12 py-20">
          <div className="flex flex-col gap-4 text-center">
            <span className="mx-auto inline-flex items-center justify-center rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-700">
              Built for every legacy
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              A guided path from upload to delivery
            </h2>
            <p className="mx-auto max-w-2xl text-base text-graphite-600">
              Whether you are organising a lifetime of photos or critical instructions, Forebearer keeps everything in motion with
              structured workflows and complete transparency.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="flex h-full flex-col overflow-hidden border-graphite-200/80">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-xl font-semibold text-graphite-900">{feature.title}</h3>
                  <p className="text-sm text-graphite-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr,1.1fr] lg:gap-16">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                How it works
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
                Designed for confidence at every step
              </h2>
              <p className="text-base text-graphite-600">
                You stay in control while Forebearer handles the encryption, reminders, and delivery logistics. It is a dedicated
                co-pilot for your digital legacy.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Explore the FAQ &rarr;
              </Link>
            </div>

            <ol className="space-y-6">
              {timeline.map((item, index) => (
                <li key={item.title} className="flex gap-5 rounded-2xl border border-graphite-200 bg-white/90 p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-base font-semibold text-primary-700">
                    {index + 1}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-graphite-900">{item.title}</h3>
                    <p className="text-sm text-graphite-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-20">
          <div className="rounded-3xl border border-graphite-200 bg-white/90 p-10 shadow-lg">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-4">
                <span className="inline-flex rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700">
                  Security &amp; reliability
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
                  Enterprise-grade protection for personal stories
                </h2>
                <p className="text-base text-graphite-600">
                  Forebearer combines zero-knowledge encryption, redundant storage, and continuous monitoring so your files stay
                  safe without compromise.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Learn more about our approach &rarr;
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {securityFeatures.map((feature) => (
                  <Card key={feature.title} className="flex h-full flex-col gap-2 border-graphite-200/70 bg-white p-6">
                    <h3 className="text-lg font-semibold text-graphite-900">{feature.title}</h3>
                    <p className="text-sm text-graphite-600">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="flex flex-col gap-4 text-center">
            <span className="mx-auto inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              Answers at the ready
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              Everything you need to know before you share
            </h2>
              <p className="mx-auto max-w-2xl text-base text-graphite-600">
                Here are the questions people ask most before trusting Forebearer with their vault. Dive deeper on our dedicated FAQ page for more guidance.
              </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {faqPreview.map((faq) => (
              <Card key={faq.question} className="h-full border-graphite-200/70 p-6">
                <h3 className="text-lg font-semibold text-graphite-900">{faq.question}</h3>
                <p className="mt-3 text-sm text-graphite-600">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Visit the full FAQ &rarr;
            </Link>
          </div>
        </section>

        <section className="py-24">
          <div className="rounded-3xl border border-primary-200 bg-primary-50 px-8 py-12 text-center shadow-lg sm:px-12 lg:px-16">
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              Be remembered for the stories you choose to share
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-graphite-600">
              Start with 300 MB of secure storage, invite trustees, and experience how effortless it feels to organise your digital
              legacy.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create your vault
                </Button>
              </Link>
              <Link href="/signin" className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
