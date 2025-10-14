import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Forebearer",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "name": "Free Plan",
        "description": "300 MB storage for photos, videos, and messages"
      },
      {
        "@type": "Offer",
        "price": "9",
        "priceCurrency": "USD",
        "name": "Plus Plan",
        "description": "5 GB storage with unlimited bundles and trustees"
      }
    ],
    "description": "Store photos, videos, and messages safely. Share them with loved ones at the right time. End-to-end encrypted digital memory vault.",
    "featureList": [
      "End-to-end encryption",
      "Time-lock releases",
      "Heartbeat monitoring",
      "Secure file storage",
      "Automatic delivery to trustees",
      "Zero-knowledge privacy"
    ],
    "screenshot": "https://forebearer.app/hero.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Forebearer",
    "url": "https://forebearer.app",
    "logo": "https://forebearer.app/logo.png",
    "description": "Secure digital legacy and memory storage platform",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@forebearer.app",
      "contactType": "Customer Support"
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-lg sm:text-xl font-semibold text-graphite-900 tracking-tight">
            Forebearer
          </div>
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

      {/* Hero Section */}
      <section className="relative min-h-[450px] md:min-h-[550px] flex items-center overflow-hidden">
        {/* Background Image with Dimming */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Hero background"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content Overlay - Left Side */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight animate-fade-in">
              Leave Something Behind
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed animate-slide-up">
              Store memories, messages, and meaningful things. Share them with loved ones when the time is right.
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
        </div>
      </section>

      {/* Value Proposition Section - Image/Text Split */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-7xl mx-auto">
            {/* Text Content */}
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-semibold text-graphite-900 mb-6 leading-tight">
                Your memories, safely stored for the people who matter
              </h2>
              <p className="text-lg text-graphite-600 mb-8 leading-relaxed">
                Life moves fast. We help you capture what&apos;s important and make sure it reaches the right people at the right time—whether that&apos;s a birthday message for your daughter&apos;s 18th, or important information your family might need someday.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-graphite-900 mb-1">Photos, videos, letters—anything that matters</h3>
                    <p className="text-graphite-600">Upload memories in any format and keep them safe forever.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-graphite-900 mb-1">Set it and forget it</h3>
                    <p className="text-graphite-600">Once it&apos;s uploaded, we&apos;ll handle everything—reminders, delivery, the works.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-graphite-900 mb-1">Private and encrypted</h3>
                    <p className="text-graphite-600">Your memories are for you and the people you choose—no one else.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Image */}
            <div className="order-1 md:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/Your-memories.jpg"
                  alt="Memories being shared"
                  fill
                  className="object-cover"
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section className="py-20 md:py-32 bg-primary-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold text-graphite-900 mb-6">
              Three simple steps
            </h2>
            <p className="text-xl text-graphite-600">
              No complicated setup. Just you, your memories, and the people you care about.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-24">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/upload.jpg"
                  alt="Upload memories"
                  fill
                  className="object-cover"
                  quality={90}
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-graphite-900 mb-4">
                  Upload what you want to share
                </h3>
                <p className="text-lg text-graphite-600 leading-relaxed">
                  Photos from that trip you took together. A video message for their wedding day. The password to your email. Whatever matters to you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="md:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/decide.jpg"
                  alt="Choose recipients"
                  fill
                  className="object-cover"
                  quality={90}
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="md:order-1">
                <h3 className="text-3xl font-semibold text-graphite-900 mb-4">
                  Decide when and who
                </h3>
                <p className="text-lg text-graphite-600 leading-relaxed">
                  Choose who receives what. Set a specific date, or use check-ins so things are shared automatically if you stop responding. You&apos;re in control.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/handle.jpg"
                  alt="Live your life"
                  fill
                  className="object-cover"
                  quality={90}
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-graphite-900 mb-4">
                  We&apos;ll handle the rest
                </h3>
                <p className="text-lg text-graphite-600 leading-relaxed">
                  Live your life. We&apos;ll send you gentle reminders to check in, and make sure everything reaches the right people at exactly the right time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-graphite-900 mb-12">
              Built with care, security, and privacy
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">End-to-end encrypted</h3>
                <p className="text-graphite-600">Your memories are encrypted on your device before upload. We can&apos;t see them—only you and your chosen recipients can.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">Reliably stored</h3>
                <p className="text-graphite-600">Your data is stored on Cloudflare&apos;s global network with 99.9% uptime and automatic backups.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-graphite-900 mb-2">Made with purpose</h3>
                <p className="text-graphite-600">We built this because everyone deserves an easy way to leave something meaningful behind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-graphite-900 text-center mb-16 tracking-tight">
            Start Free, Upgrade When You Need
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              features={[
                '300 MB storage',
                '1 active release bundle',
                'Up to 10 trustees per bundle',
                'Unlimited items',
                'Upload any file type',
                'Monthly heartbeat check-ins',
                'Email notifications',
              ]}
              ctaText="Get Started"
              ctaLink="/signup"
            />
            <PricingCard
              name="Plus"
              price="$9"
              period="/month"
              annual="$99/year"
              features={[
                '5 GB storage',
                'Unlimited release bundles',
                'Unlimited trustees',
                'Custom heartbeat schedules',
                'Release analytics',
                'Priority support',
                'All file types',
              ]}
              ctaText="Coming Soon"
              ctaLink="#"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  annual,
  features,
  ctaText,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  period?: string;
  annual?: string;
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
        {annual && (
          <p className="text-xs text-graphite-500 mt-1">or {annual}</p>
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
