import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            Vault
          </div>
          <div className="flex gap-4">
            <Link href="/app">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Zero-Knowledge
          <br />
          <span className="text-blue-600 dark:text-blue-400">
            Encrypted Storage
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Store your most sensitive files and notes with client-side encryption.
          Only you hold the keys. Set up time-locked releases or heartbeat monitoring
          for automatic data sharing with trustees.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/app">
            <Button size="lg">Get Started</Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="secondary">
              Learn More
            </Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Built for Privacy & Security
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔒"
            title="Zero-Knowledge Encryption"
            description="All encryption happens in your browser. Your passphrase never leaves your device, and we can never access your data."
          />
          <FeatureCard
            icon="⏰"
            title="Time-Lock Releases"
            description="Schedule automatic releases of encrypted data to trusted recipients at a future date."
          />
          <FeatureCard
            icon="💓"
            title="Heartbeat Monitoring"
            description="Set up automated releases if you fail to check in. Perfect for emergency access to critical information."
          />
          <FeatureCard
            icon="☁️"
            title="Cloud Storage"
            description="Encrypted data stored on Cloudflare R2 with 99.9% uptime and global edge distribution."
          />
          <FeatureCard
            icon="🚀"
            title="Lightning Fast"
            description="Built on Next.js 14 and deployed on Cloudflare's edge network for instant access worldwide."
          />
          <FeatureCard
            icon="🎯"
            title="Simple & Calm"
            description="Clean, minimal interface focused on what matters. No distractions, no clutter."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <Step
              number={1}
              title="Create Your Vault"
              description="Choose a strong passphrase. This is used to derive encryption keys that never leave your device."
            />
            <Step
              number={2}
              title="Upload Files & Notes"
              description="Add sensitive documents, passwords, or notes. Everything is encrypted client-side before upload."
            />
            <Step
              number={3}
              title="Set Up Releases"
              description="Create time-locked releases or heartbeat monitoring. Designate trustees who can access data when conditions are met."
            />
            <Step
              number={4}
              title="Stay in Control"
              description="Update your heartbeat regularly, modify releases, or download your encrypted data anytime."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            features={[
              '5GB encrypted storage',
              'Unlimited items',
              '3 release bundles',
              'Time-lock & heartbeat releases',
              'Email notifications',
            ]}
            ctaText="Get Started"
            ctaLink="/app"
          />
          <PricingCard
            name="Pro"
            price="$9"
            period="/month"
            features={[
              '100GB encrypted storage',
              'Unlimited items',
              'Unlimited release bundles',
              'Priority support',
              'Custom trustees',
              'Advanced analytics',
            ]}
            ctaText="Coming Soon"
            ctaLink="#"
            highlighted
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Vault. Built with privacy in mind.</p>
          <p className="mt-2 text-sm">
            Encrypted with AES-256-GCM. Keys derived with PBKDF2 (Argon2id coming soon).
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  ctaText,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`
        p-8 rounded-lg border
        ${
          highlighted
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          {price}
        </span>
        {period && (
          <span className="text-gray-600 dark:text-gray-400">{period}</span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={ctaLink}>
        <Button
          className="w-full"
          variant={highlighted ? 'primary' : 'secondary'}
        >
          {ctaText}
        </Button>
      </Link>
    </div>
  );
}
