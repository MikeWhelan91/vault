import Link from "next/link";
import { Metadata } from "next";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export const metadata: Metadata = {
  title: "FAQ - Digital Legacy Questions Answered | Forebearer",
  description:
    "Find answers about Forebearer encryption, pricing, storage limits, heartbeat releases, trustee access, and account management.",
  alternates: {
    canonical: "https://forebearer.app/faq",
  },
};

const faqSections = [
  {
    title: "General",
    items: [
      {
        question: "What is Forebearer?",
        answer:
          "Forebearer is a secure digital memory vault that lets you store photos, videos, messages, and important documents. You can schedule when to share them with loved ones—either on a future date or through automated heartbeat check-ins.",
      },
      {
        question: "How does Forebearer work?",
        answer:
          "Upload files into release bundles, choose your trustees, and decide when those bundles should unlock. We encrypt everything on your device before upload, monitor your release criteria, and deliver the content automatically when conditions are met.",
      },
      {
        question: "Who should use Forebearer?",
        answer:
          "Anyone who wants to leave meaningful memories, instructions, or documents behind. Parents preparing messages for future milestones, people managing estates, or anyone planning their digital legacy benefit from Forebearer.",
      },
    ],
  },
  {
    title: "Security & Privacy",
    items: [
      {
        question: "Is my data secure?",
        answer:
          "Yes. Files are encrypted client-side using AES-256 before upload and stored in a zero-knowledge architecture. Only you and the trustees you authorise can decrypt them.",
      },
      {
        question: "What is zero-knowledge encryption?",
        answer:
          "Zero-knowledge encryption means we never see or store your passphrase. All encryption happens on your device, so only you (and your recipients when you permit it) can decrypt the files.",
      },
      {
        question: "What happens if I forget my passphrase?",
        answer:
          "Because of zero-knowledge encryption, we cannot reset or recover your passphrase. We recommend using a password manager or another secure storage method to keep it safe.",
      },
      {
        question: "Can Forebearer access my files?",
        answer:
          "No. Everything is encrypted before it reaches our servers. Without your passphrase, the data we store is unreadable.",
      },
    ],
  },
  {
    title: "Pricing & Storage",
    items: [
      {
        question: "How much does Forebearer cost?",
        answer:
          "The Free plan includes 300 MB of storage, one active release bundle, and up to 10 trustees per bundle. The Plus plan is $9/month (or $99/year) with 5 GB of storage, unlimited bundles, unlimited trustees, custom heartbeat cadences, and priority support.",
      },
      {
        question: "What file types can I upload?",
        answer: "Any file type. Photos, videos, PDFs, documents, and more are all supported.",
      },
      {
        question: "What counts toward my storage limit?",
        answer:
          "All encrypted items within your vault count toward the storage limit, including the small encryption overhead for each file.",
      },
      {
        question: "Can I upgrade or downgrade my plan?",
        answer:
          "Yes. Upgrade to Plus at any time from your account settings. If you downgrade, ensure you are within the Free plan limits before the next billing cycle.",
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        question: "What is a time-lock release?",
        answer:
          "Time-lock releases unlock on a specific date you choose—perfect for birthdays, anniversaries, or milestone messages.",
      },
      {
        question: "What is heartbeat mode?",
        answer:
          "Heartbeat mode checks in with you on a schedule you set. If you miss the check-in and the grace period, your release automatically unlocks for trustees.",
      },
      {
        question: "How many trustees can I add?",
        answer: "Free plan: up to 10 trustees per bundle. Plus plan: unlimited trustees.",
      },
      {
        question: "Can I have multiple release bundles?",
        answer:
          "Yes. Free plan users can keep one active bundle at a time. Plus plan users can create unlimited active bundles with different trustees and rules.",
      },
      {
        question: "Can I edit or delete items after uploading?",
        answer:
          "Absolutely. Delete or update items whenever you like. Changes sync instantly with your encryption keys and release rules.",
      },
    ],
  },
  {
    title: "Trustees & Sharing",
    items: [
      {
        question: "Do trustees need an account?",
        answer:
          "No. They receive a secure link via email when a release unlocks. The link guides them through secure access and download.",
      },
      {
        question: "How do trustees access their memories?",
        answer:
          "Trustees click the delivery email, verify their identity, and immediately access everything you shared with them.",
      },
      {
        question: "Can I see if a trustee has accessed their release?",
        answer: "Yes. Delivery analytics show when trustees were notified and when they accessed the release.",
      },
      {
        question: "Can I cancel a release before it's sent?",
        answer:
          "Yes. Delete a bundle or reset a heartbeat at any time before a release triggers, and nothing will be delivered.",
      },
    ],
  },
  {
    title: "Technical",
    items: [
      {
        question: "Where is my data stored?",
        answer: "We use Cloudflare R2 with automatic replication for durable, reliable storage around the world.",
      },
      {
        question: "What encryption does Forebearer use?",
        answer:
          "Files are encrypted with AES-256-GCM. Keys are derived using PBKDF2 and secured with RSA for trustee access envelopes.",
      },
      {
        question: "Is Forebearer open source?",
        answer:
          "Not currently, though we plan to open-source parts of our encryption tooling for community review in the future.",
      },
    ],
  },
  {
    title: "Account Management",
    items: [
      {
        question: "How do I delete my account?",
        answer:
          "Delete your account from the settings panel. This permanently removes all encrypted data, releases, and trustee information.",
      },
      {
        question: "What happens to my data if I stop paying?",
        answer:
          "When you downgrade from Plus to Free, you retain access to existing items. You will not be able to upload more until you are within the Free plan limits.",
      },
      {
        question: "Can I export my data?",
        answer: "Yes. Download items individually at any time directly from your vault.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-graphite-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <Search className="h-4 w-4" aria-hidden="true" />
              Help centre
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-graphite-900 sm:text-5xl">
              Answers to the questions we hear most
            </h1>
            <p className="text-base text-graphite-600 sm:text-lg">
              Learn how Forebearer protects your memories, automates delivery, and keeps your trustees informed at every step.
            </p>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-10">
            {faqSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-graphite-900">{section.title}</h2>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <Card key={item.question} className="border-graphite-200/70 bg-white p-6">
                      <h3 className="text-lg font-semibold text-graphite-900">{item.question}</h3>
                      <p className="mt-2 text-sm text-graphite-600 leading-relaxed">{item.answer}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="flex flex-col gap-6">
            <Card className="border-primary-200/80 bg-primary-50/80 p-8">
              <h2 className="text-xl font-semibold text-graphite-900">Need more help?</h2>
              <p className="mt-3 text-sm text-graphite-600">
                Our support team usually replies within 24 hours. Share as much detail as possible so we can help quickly.
              </p>
              <Link href="/support" className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                Contact support &rarr;
              </Link>
            </Card>

            <Card className="border-graphite-200/70 bg-white p-8">
              <h2 className="text-xl font-semibold text-graphite-900">Popular resources</h2>
              <ul className="mt-4 space-y-3 text-sm text-primary-600">
                <li>
                  <Link href="/pricing" className="transition-colors hover:text-primary-700">
                    Compare plans
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="transition-colors hover:text-primary-700">
                    Submit a support ticket
                  </Link>
                </li>
                <li>
                  <Link href="/release" className="transition-colors hover:text-primary-700">
                    Read release notes
                  </Link>
                </li>
              </ul>
            </Card>
          </aside>
        </section>

        <section className="mt-20 rounded-3xl border border-primary-200 bg-primary-50 px-8 py-12 text-center shadow-lg sm:px-12 lg:px-16">
          <h2 className="text-3xl font-semibold tracking-tight text-graphite-900 sm:text-4xl">
            Ready to put your legacy on autopilot?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-graphite-600">
            Create a free vault, add your first bundle, and schedule a release in minutes. Upgrade whenever you need more storage or trustees.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create free account
              </Button>
            </Link>
            <Link href="/pricing" className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
              Review plan details
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
