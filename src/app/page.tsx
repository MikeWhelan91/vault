'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/marketing/SiteHeader";

const bulletPoints = [
  "Keep birthday messages, family photos, and love letters safe",
  "Choose exactly when your memories reach the right people",
  "Rest easy knowing everything is protected and preserved",
];

const featureHighlights = [
  {
    title: "Collect your memories",
    description:
      "Gather photos, videos, voice recordings, and handwritten letters. Create beautiful collections for different people or occasions.",
    image: "/upload.jpg",
  },
  {
    title: "Choose the perfect moment",
    description:
      "Schedule a surprise for a birthday or anniversary. Or set up heartbeat check-ins so your memories are shared if you're gone.",
    image: "/decide.jpg",
  },
  {
    title: "They receive your gift",
    description:
      "Your loved ones get a secure link with your memories, ready to open and cherish. No complicated setup needed.",
    image: "/handle.jpg",
  },
];

const timeline = [
  {
    title: "Create your memory bundles",
    description:
      "Upload your favorite photos, write heartfelt messages, or record voice notes. Organize them into meaningful collections for the people you love.",
  },
  {
    title: "Pick who and when",
    description:
      "Choose who receives each bundle and when. Set a future date for celebrations, or use heartbeat mode for peace of mind.",
  },
  {
    title: "Let us take care of the rest",
    description:
      "We'll keep your memories safe and deliver them at just the right time. You'll get reminders and can make changes anytime.",
  },
];

const securityFeatures = [
  {
    title: "Private by design",
    description:
      "Your memories are encrypted before they leave your device. Only you and your chosen recipients can ever see them.",
  },
  {
    title: "Always reliable",
    description:
      "Your precious memories are safely stored with automatic backups, so they'll be there when it matters most.",
  },
  {
    title: "Stay in control",
    description:
      "Change your mind anytime. Update bundles, adjust delivery dates, or add new recipients whenever you want.",
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
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

      <main className="w-full pb-24">
        <section className="relative min-h-[85vh] overflow-hidden">
          {/* Background Image with Parallax */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              willChange: 'transform',
            }}
          >
            <Image
              src="/hero.jpg"
              alt="Forebearer dashboard showcasing scheduled releases"
              fill
              className="object-cover"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-graphite-900/85 via-graphite-900/70 to-graphite-900/60" />
          </div>

          {/* Content */}
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="max-w-3xl space-y-8">
              <h1 className="animate-fade-in-down text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                A memory box for the moments that matter most
              </h1>
              <p className="animate-fade-in-up max-w-2xl text-lg text-graphite-100 lg:text-xl" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                Store your cherished photos, heartfelt letters, and precious memories in one beautiful place. Share them with loved ones when the time is right—whether that&apos;s a special date or when you&apos;re no longer around.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {bulletPoints.map((point, index) => (
                  <div
                    key={point}
                    className="animate-fade-in-up flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/15"
                    style={{
                      animationDelay: `${0.4 + index * 0.1}s`,
                      animationFillMode: 'backwards'
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/80 text-white">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-white">{point}</p>
                  </div>
                ))}
              </div>
              <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
                <Link href="/signup">
                  <Button size="lg" className="w-full transition-transform hover:scale-105 sm:w-auto">
                    Start for free
                  </Button>
                </Link>
                <Link href="/pricing" className="text-sm font-medium text-primary-200 transition-colors hover:text-primary-100">
                  View pricing &rarr;
                </Link>
              </div>
              <div className="animate-fade-in-up flex flex-wrap gap-8 pt-4 text-sm" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
                <div className="transition-transform hover:scale-105">
                  <p className="text-3xl font-semibold text-primary-300">Unlimited</p>
                  <p className="mt-1 max-w-[14ch] text-xs uppercase tracking-wide text-graphite-200">Bundles you can create</p>
                </div>
                <div className="transition-transform hover:scale-105">
                  <p className="text-3xl font-semibold text-primary-300">Forever</p>
                  <p className="mt-1 max-w-[18ch] text-xs uppercase tracking-wide text-graphite-200">Your memories are safe</p>
                </div>
                <div className="transition-transform hover:scale-105">
                  <p className="text-3xl font-semibold text-primary-300">Simple</p>
                  <p className="mt-1 max-w-[18ch] text-xs uppercase tracking-wide text-graphite-200">To set up and share</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

        <section id="features" data-animate className="space-y-12 py-20">
          <div className={`flex flex-col gap-4 text-center transition-all duration-700 ${visibleSections.has('features') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              From your heart to theirs, in three simple steps
            </h2>
            <p className="mx-auto max-w-2xl text-base text-graphite-600">
              Whether it&apos;s a birthday surprise, anniversary gift, or a message for when you&apos;re gone—Forebearer makes it easy to share what matters most.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featureHighlights.map((feature, index) => (
              <Card
                key={feature.title}
                className={`flex h-full flex-col overflow-hidden border-graphite-200/80 transition-all duration-700 hover:scale-105 hover:shadow-2xl ${visibleSections.has('features') ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
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

        <section id="how-it-works" data-animate className="py-20">
          <div className={`rounded-3xl overflow-hidden border border-graphite-200 bg-white shadow-lg transition-all duration-700 ${visibleSections.has('how-it-works') ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className="grid lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-64 lg:h-auto">
                <Image
                  src="/nostalgia.jpg"
                  alt="Cherished memories and moments"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
                    How it works
                  </h2>
                  <p className="text-base text-graphite-600">
                    Creating and sharing your memory bundles is simple. Just follow these three steps.
                  </p>
                </div>

                <ol className="space-y-6">
                  {timeline.map((item, index) => (
                    <li
                      key={item.title}
                      className="flex gap-4 transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-50 text-base font-semibold text-primary-700">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-graphite-900">{item.title}</h3>
                        <p className="text-sm text-graphite-600">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <Link
                  href="/faq"
                  className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Learn more &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="security" data-animate className="py-20">
          <div className={`rounded-3xl border border-graphite-200 bg-white/90 p-8 sm:p-10 lg:p-12 shadow-lg transition-all duration-700 ${visibleSections.has('security') ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className="mx-auto max-w-4xl space-y-8 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
                  Your memories, safe and sound
                </h2>
                <p className="mx-auto max-w-2xl text-base text-graphite-600">
                  We protect your precious moments with care. Everything is encrypted, backed up, and ready to share when the time comes.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {securityFeatures.map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`rounded-2xl border border-graphite-200/70 bg-white p-6 text-center transition-all duration-700 hover:scale-105 hover:shadow-lg ${visibleSections.has('security') ? 'animate-fade-in-up' : 'opacity-0'}`}
                    style={{
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: 'backwards'
                    }}
                  >
                    <h3 className="text-lg font-semibold text-graphite-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-graphite-600">{feature.description}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/support"
                className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Learn how we keep things safe &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" data-animate className="py-20">
          <div className={`flex flex-col gap-4 text-center transition-all duration-700 ${visibleSections.has('faq') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              Questions? We&apos;ve got answers
            </h2>
              <p className="mx-auto max-w-2xl text-base text-graphite-600">
                Here&apos;s what people usually want to know about creating and sharing their memory bundles.
              </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {faqPreview.map((faq, index) => (
              <Card
                key={faq.question}
                className={`h-full border-graphite-200/70 p-6 transition-all duration-700 hover:scale-105 hover:shadow-lg ${visibleSections.has('faq') ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{
                  animationDelay: `${0.2 + index * 0.1}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <h3 className="text-lg font-semibold text-graphite-900">{faq.question}</h3>
                <p className="mt-3 text-sm text-graphite-600">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className={`mt-10 text-center transition-all duration-700 ${visibleSections.has('faq') ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            <Link
              href="/faq"
              className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Visit the full FAQ &rarr;
            </Link>
          </div>
        </section>

        <section id="cta" data-animate className="py-24">
          <div className={`rounded-3xl border border-primary-200 bg-primary-50 px-8 py-12 text-center shadow-lg sm:px-12 lg:px-16 transition-all duration-700 ${visibleSections.has('cta') ? 'animate-scale-in' : 'opacity-0'}`}>
            <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
              Start sharing the memories that matter
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-graphite-600">
              Create your first memory bundle with 300 MB of free storage. Upload photos, write messages, and choose when to share them with the people you love.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full transition-transform hover:scale-110 sm:w-auto">
                  Create your memory box
                </Button>
              </Link>
              <Link href="/signin" className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
