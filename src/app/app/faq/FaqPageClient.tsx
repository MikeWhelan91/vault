import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function FaqPageClient() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold text-warm-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-warm-600">
          Everything you need to know about Forebearer
        </p>
      </div>

      <div className="space-y-6">
        {/* General Questions */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4">General</h2>

          <FAQItem
            question="What is Forebearer?"
            answer="Forebearer is a secure digital memory vault that lets you store photos, videos, messages, and important documents. You can schedule when to share them with loved ones—whether that's a future date or through our heartbeat check-in system."
          />

          <FAQItem
            question="How does Forebearer work?"
            answer="Upload your files, choose recipients (trustees), and set when they should receive access. You can use time-lock (specific date) or heartbeat mode (checks in with you regularly, releases if you stop responding). Everything is encrypted on your device before upload."
          />

          <FAQItem
            question="Who should use Forebearer?"
            answer="Anyone who wants to leave something meaningful behind. Parents creating messages for their children's future milestones, people with important documents or passwords to share, or anyone who wants to ensure their digital memories reach the right people at the right time."
          />
        </section>

        {/* Security & Privacy */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Security & Privacy</h2>

          <FAQItem
            question="Is my data secure?"
            answer="Yes. Everything is encrypted on your device before it ever leaves your computer. We use end-to-end encryption, which means only you and your chosen recipients can access your files. Even we can't see what you've uploaded."
          />

          <FAQItem
            question="What is zero-knowledge encryption?"
            answer="Zero-knowledge encryption means your files are encrypted with your passphrase on your device. We never see your passphrase or unencrypted data. Only you and the people you share with can decrypt the files."
          />

          <FAQItem
            question="What happens if I forget my passphrase?"
            answer="Unfortunately, due to zero-knowledge encryption, we cannot recover your passphrase. This is by design for security. If you forget it, you'll lose access to your vault. We recommend storing your passphrase securely (like a password manager)."
          />

          <FAQItem
            question="Can Forebearer access my files?"
            answer="No. All files are encrypted on your device before upload. We only store encrypted data and cannot decrypt or access your files without your passphrase."
          />
        </section>

        {/* Pricing & Storage */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Pricing & Storage</h2>

          <FAQItem
            question="How much does Forebearer cost?"
            answer="We offer a free tier with 300 MB of storage, 1 active release bundle, and up to 10 trustees per bundle. Plus tier is $9/month (or $99/year) with 5 GB of storage, unlimited release bundles, unlimited trustees, custom heartbeat schedules, and priority support. Both tiers support all file types and unlimited items within your storage limit."
          />

          <FAQItem
            question="What file types can I upload?"
            answer="Any file type! Photos, videos, documents, PDFs, text files—whatever matters to you. There are no restrictions on file types."
          />

          <FAQItem
            question="What counts toward my storage limit?"
            answer="Everything you upload counts toward your storage limit. This includes all files and notes. Encrypted files are slightly larger than originals due to encryption overhead."
          />

          <FAQItem
            question="Can I upgrade or downgrade my plan?"
            answer="Yes! You can upgrade to Plus at any time from your account settings. If you downgrade from Plus to Free, you'll need to ensure you're within the free tier limits (1 active bundle, 10 trustees per bundle, 300 MB storage)."
          />
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Features</h2>

          <FAQItem
            question="What is a time-lock release?"
            answer="A time-lock lets you schedule when your memories are released to your trustees. Set a specific date in the future (like a birthday or anniversary) and your recipients will automatically get access on that date."
          />

          <FAQItem
            question="What is heartbeat mode?"
            answer="Heartbeat mode checks in with you regularly (you choose how often—weekly, monthly, etc.). If you don't respond by the deadline, your memories are automatically released to your trustees. It's like a digital 'dead man switch.'"
          />

          <FAQItem
            question="How many trustees can I add?"
            answer="Free tier: up to 10 trustees per release bundle. Plus tier: unlimited trustees."
          />

          <FAQItem
            question="Can I have multiple release bundles?"
            answer="Yes! Free tier users can have 1 active release bundle at a time. Plus tier users can create unlimited active release bundles. Each bundle can have different trustees, different items, and different release conditions."
          />

          <FAQItem
            question="Can I edit or delete items after uploading?"
            answer="Yes, you can delete items at any time from your vault. Deleted items are permanently removed from our storage and cannot be recovered."
          />
        </section>

        {/* Trustees & Sharing */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Trustees & Sharing</h2>

          <FAQItem
            question="Do trustees need an account?"
            answer="No! Trustees don't need a Forebearer account. When a release is triggered, they'll receive an email with a secure link to access their memories."
          />

          <FAQItem
            question="How do trustees access their memories?"
            answer="Trustees receive an email with a secure link. They click the link and can view/download all the items you've shared with them. No account or passphrase needed."
          />

          <FAQItem
            question="Can I see if a trustee has accessed their release?"
            answer="Yes, you can see when trustees have been notified and when they've accessed the release bundle."
          />

          <FAQItem
            question="Can I cancel a release before it's sent?"
            answer="Yes, you can delete a release bundle at any time before it's triggered. For heartbeat releases, you can always check in to reset the timer."
          />
        </section>

        {/* Technical */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Technical</h2>

          <FAQItem
            question="Where is my data stored?"
            answer="All data is stored on Cloudflare R2, a secure cloud storage service with 99.9% uptime and automatic backups. Data centers are distributed globally for reliability."
          />

          <FAQItem
            question="What encryption does Forebearer use?"
            answer="We use AES-256-GCM encryption for all data and RSA/PBKDF2 for key derivation. These are industry-standard, military-grade encryption algorithms."
          />

          <FAQItem
            question="Is Forebearer open source?"
            answer="Not currently, but we're considering open-sourcing parts of our encryption implementation for transparency and community review."
          />
        </section>

        {/* Account Management */}
        <section>
          <h2 className="text-2xl font-semibold text-warm-900 mb-4 mt-12">Account Management</h2>

          <FAQItem
            question="How do I delete my account?"
            answer="You can delete your account from Settings. This will permanently delete all your data, items, and release bundles. This action cannot be undone."
          />

          <FAQItem
            question="What happens to my data if I stop paying?"
            answer="If you downgrade from Plus to Free and exceed the free tier storage limit, you won't be able to upload new items until you delete some or upgrade again. Existing data remains accessible."
          />

          <FAQItem
            question="Can I export my data?"
            answer="Yes, you can download any of your items individually from your vault at any time."
          />
        </section>
      </div>

      {/* Still have questions? */}
      <Card className="mt-12">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-warm-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-warm-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Reach out to our support team.
          </p>
          <Link href="/app/support">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold text-warm-900 mb-2">{question}</h3>
      <p className="text-warm-600 leading-relaxed">{answer}</p>
    </Card>
  );
}
