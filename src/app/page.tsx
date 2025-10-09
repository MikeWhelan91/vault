import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-graphite-900 tracking-tight">
            Unlatches
          </div>
          <div className="flex gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-graphite-900 mb-6 tracking-tight animate-fade-in">
            Secure Your Digital Legacy
          </h1>
          <p className="text-lg md:text-xl text-graphite-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Zero-knowledge encrypted storage for your most sensitive files and notes.
            Control who accesses your data, and when.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/signup">
              <Button size="lg" className="min-w-[160px]">Start Free</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="min-w-[160px]">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Hero visual placeholder */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="placeholder-box aspect-video border border-graphite-200 shadow-sm"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 text-center mb-16 tracking-tight">
            Built for Privacy & Security
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="Zero-Knowledge Encryption"
              description="All encryption happens in your browser. Your password never leaves your device, and we can never access your data."
            />
            <FeatureCard
              title="Time-Lock Releases"
              description="Schedule automatic releases of encrypted data to trusted recipients at a future date."
            />
            <FeatureCard
              title="Heartbeat Monitoring"
              description="Set up automated releases if you fail to check in. Perfect for emergency access to critical information."
            />
            <FeatureCard
              title="Cloud Storage"
              description="Encrypted data stored on Cloudflare R2 with 99.9% uptime and global edge distribution."
            />
            <FeatureCard
              title="Lightning Fast"
              description="Built on modern infrastructure and deployed on Cloudflare's edge network for instant access worldwide."
            />
            <FeatureCard
              title="Privacy First"
              description="Clean, minimal interface focused on what matters. No tracking, no analytics, no compromises."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-ivory-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 text-center mb-16 tracking-tight">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <Step
              number={1}
              title="Create Your Vault"
              description="Choose a strong password. This is used to derive encryption keys that never leave your device."
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
      <section id="pricing" className="bg-white py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 text-center mb-16 tracking-tight">
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
              ctaLink="/signup"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-graphite-200 py-12 bg-ivory-50">
        <div className="container mx-auto px-6 text-center text-graphite-600">
          <p className="text-sm">&copy; 2025 Unlatches. Built with privacy in mind.</p>
          <p className="mt-2 text-xs">
            Encrypted with AES-256-GCM. Keys derived with PBKDF2.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card p-8 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-lg font-medium text-graphite-900 mb-3">
        {title}
      </h3>
      <p className="text-graphite-600 text-sm leading-relaxed">{description}</p>
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
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-accent-500 text-white rounded-lg flex items-center justify-center font-medium text-lg shadow-sm">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-medium text-graphite-900 mb-2">
          {title}
        </h3>
        <p className="text-graphite-600 text-sm leading-relaxed">{description}</p>
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
        card p-8 transition-all duration-300
        ${
          highlighted
            ? 'border-accent-500 shadow-lg scale-105'
            : 'hover:shadow-md'
        }
      `}
    >
      <h3 className="text-xl font-medium text-graphite-900 mb-2">
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-4xl font-light text-graphite-900">
          {price}
        </span>
        {period && (
          <span className="text-graphite-600 text-sm">{period}</span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-graphite-600">{feature}</span>
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
