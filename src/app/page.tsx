import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-graphite-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-graphite-200/70 dark:border-graphite-700/60 bg-white/80 dark:bg-graphite-900/80 backdrop-blur-md">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-graphite-900 dark:text-ivory-50 tracking-tight">
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-accent-100/70 dark:bg-primary-900/40 blur-[120px]"></div>
        <div className="container mx-auto px-6 py-24 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-200/70 bg-white/60 dark:bg-graphite-800/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-graphite-500 dark:text-graphite-200">
              Trusted estate vaulting for modern founders
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-graphite-900 dark:text-ivory-50 tracking-tight animate-fade-in text-balance">
              Secure Your Digital Legacy with Zero-Knowledge Confidence
            </h1>
            <p className="text-lg md:text-xl text-graphite-600 dark:text-graphite-300 mx-auto max-w-3xl leading-relaxed animate-slide-up">
              Preserve, automate, and delegate your most sensitive information. Unlatches encrypts everything before it leaves your device, and releases it only when you decide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/signup">
                <Button size="lg" className="min-w-[160px]">Start Free</Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="secondary" className="min-w-[160px]">
                  Explore Features
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="gradient-panel p-10 text-left relative">
              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-graphite-600 dark:text-graphite-200">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent-500"></span>
                    Private Key Derivation
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-500"></span>
                    AES-256-GCM
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-graphite-400"></span>
                    Time-Locked Releases
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 max-w-xl">
                  A single, encrypted source of truth for the people you trust.
                </h2>
                <p className="text-base leading-relaxed text-graphite-600 dark:text-graphite-300 max-w-2xl">
                  Map out contingencies, add trustees, and define how access unfolds. Unlatches monitors your heartbeat signal and enforces every rule automatically.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <Stat label="Average setup time" value="9 minutes" />
                  <Stat label="Recovery success rate" value="99.98%" />
                  <Stat label="Heartbeat reminders sent" value="2.4M+" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="placeholder-box h-56 w-full border border-graphite-200/60 dark:border-graphite-700/60"></div>
              <div className="placeholder-box h-40 w-full border border-graphite-200/60 dark:border-graphite-700/60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 text-center mb-6 tracking-tight">
            Built for Privacy & Security
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-graphite-600 dark:text-graphite-300">
            Unlatches combines modern cryptography with thoughtful workflows so your organisation can share the right data at the right time—never sooner.
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <FeatureCard
              eyebrow="Client-Side First"
              title="Zero-Knowledge Encryption"
              description="Every file is encrypted in your browser using your private key material. Credentials never touch our servers."
            />
            <FeatureCard
              eyebrow="Automated Releases"
              title="Time-Lock Orchestration"
              description="Schedule future unlocks and conditions. Define windows, recipients, and fallback options without exposing secrets."
            />
            <FeatureCard
              eyebrow="Health Signals"
              title="Heartbeat Monitoring"
              description="Receive gentle nudges to check in. If you miss your heartbeat, Unlatches triggers your defined release plans."
            />
            <FeatureCard
              eyebrow="Resilient Storage"
              title="Cloudflare R2 Backing"
              description="Global edge distribution and 99.9% uptime, wrapped in encryption and integrity checks for tamper-resistant storage."
            />
            <FeatureCard
              eyebrow="Performance"
              title="Edge-Accelerated Access"
              description="Ultra-low latency uploads and downloads thanks to Cloudflare Workers and streaming encryption pipelines."
            />
            <FeatureCard
              eyebrow="No Distractions"
              title="Privacy-First Analytics"
              description="We collect zero personal analytics. Focus on your workflows with nothing tracking you or your trustees."
            />
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-white/80 dark:bg-graphite-800/70">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 mb-6 tracking-tight">
                Plan for every outcome with living documentation.
              </h2>
              <p className="text-base text-graphite-600 dark:text-graphite-300 leading-relaxed mb-6">
                Build a resilient digital estate in minutes. Collaborate with co-founders, family members, or legal counsel without compromising your security posture.
              </p>
              <ul className="space-y-4 text-sm text-graphite-600 dark:text-graphite-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-500"></span>
                  <span>Fine-grained permissions for documents, password lists, and protocol runbooks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500"></span>
                  <span>Versioned notes with full audit trails and trustee acknowledgements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-graphite-400"></span>
                  <span>Automated status summaries delivered to your inbox or Slack workspace.</span>
                </li>
              </ul>
            </div>
            <div className="gradient-panel p-10">
              <div className="relative z-10 grid gap-6">
                <div className="placeholder-box h-36 w-full border border-graphite-200/60 dark:border-graphite-700/60"></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="placeholder-box h-32 border border-graphite-200/60 dark:border-graphite-700/60"></div>
                  <div className="placeholder-box h-32 border border-graphite-200/60 dark:border-graphite-700/60"></div>
                </div>
                <div className="placeholder-box h-24 w-full border border-graphite-200/60 dark:border-graphite-700/60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-ivory-50/80 dark:bg-graphite-900/80">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 text-center mb-16 tracking-tight">
            How It Works
          </h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
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

      {/* Security Section */}
      <section className="py-24 bg-white/90 dark:bg-graphite-800/60">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 tracking-tight mb-6">
              Security that scales with your trust network
            </h2>
            <p className="text-base text-graphite-600 dark:text-graphite-300">
              Every release, reminder, and trustee action is cryptographically verified. We design for redundancy, availability, and discretion so you can focus on continuity planning.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Pillar title="Hardware Security Modules" description="Keys stored encrypted with HSM-backed wrapping keys, rotated every 24 hours." />
            <Pillar title="Tamper-Evident Logs" description="Every action is notarised with append-only logs you and your counsel can audit." />
            <Pillar title="Jurisdictional Redundancy" description="Region-aware data residency controls and optional multi-region replication." />
            <Pillar title="Granular Trustee Roles" description="Delegate upload, review, or release actions separately with adaptive MFA prompts." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-ivory-50 dark:bg-graphite-900 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 text-center mb-16 tracking-tight">
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

      {/* FAQ */}
      <section className="py-24 bg-white/85 dark:bg-graphite-900/70">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-graphite-900 dark:text-ivory-50 text-center mb-12 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <FaqItem
                question="What makes Unlatches zero-knowledge?"
                answer="All encryption happens locally in your browser using keys derived from your passphrase and device secrets. We never receive the unencrypted keys or files, so only you and your designated trustees can decrypt the data."
              />
              <FaqItem
                question="How do scheduled releases work?"
                answer="Create a release bundle, choose recipients, and define timing or heartbeat requirements. Unlatches enforces those rules server-side while your encrypted payload stays locked until the policy conditions are met."
              />
              <FaqItem
                question="Can I integrate with my existing workflows?"
                answer="Yes. Connect Slack or email for notifications, export compliance reports, and invite legal counsel or operations teammates with restricted access levels."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-graphite-200/70 dark:border-graphite-700/60 py-12 bg-ivory-50/90 dark:bg-graphite-900">
        <div className="container mx-auto px-6 text-center text-graphite-600 dark:text-graphite-300">
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
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-8 transition-shadow duration-300 bg-white/85 dark:bg-graphite-800/80">
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.35em] text-graphite-400 dark:text-graphite-300 mb-4 block">
          {eyebrow}
        </span>
      )}
      <h3 className="text-xl font-medium text-graphite-900 dark:text-ivory-50 mb-3">
        {title}
      </h3>
      <p className="text-graphite-600 dark:text-graphite-300 text-sm leading-relaxed">{description}</p>
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
        <h3 className="text-lg font-medium text-graphite-900 dark:text-ivory-50 mb-2">
          {title}
        </h3>
        <p className="text-graphite-600 dark:text-graphite-300 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-graphite-200/60 bg-white/70 dark:border-graphite-700/50 dark:bg-graphite-900/60 px-5 py-4">
      <p className="text-xs uppercase tracking-[0.3em] text-graphite-400 dark:text-graphite-300 mb-2">{label}</p>
      <p className="text-lg font-medium text-graphite-900 dark:text-ivory-50">{value}</p>
    </div>
  );
}

function Pillar({ title, description }: { title: string; description: string }) {
  return (
    <div className="card p-6 bg-white/85 dark:bg-graphite-900/70">
      <h3 className="text-lg font-medium text-graphite-900 dark:text-ivory-50 mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-graphite-600 dark:text-graphite-300">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-graphite-200/70 bg-white/70 dark:border-graphite-700/60 dark:bg-graphite-800/50 p-6 transition-colors">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-graphite-900 dark:text-ivory-50 text-base font-medium">
        <span>{question}</span>
        <span className="text-graphite-400 transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-4 text-sm leading-relaxed text-graphite-600 dark:text-graphite-300">
        {answer}
      </p>
    </details>
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
      <h3 className="text-xl font-medium text-graphite-900 dark:text-ivory-50 mb-2">
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-4xl font-light text-graphite-900 dark:text-ivory-50">
          {price}
        </span>
        {period && (
          <span className="text-graphite-600 dark:text-graphite-300 text-sm">{period}</span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-graphite-600 dark:text-graphite-300">{feature}</span>
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
