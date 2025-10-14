import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-graphite-200 py-12 bg-white mt-auto">
      <div className="container mx-auto px-6 text-center text-graphite-600">
        <p className="text-sm">&copy; 2025 Forebearer. Share what matters.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <Link href="/faq" className="hover:text-graphite-900">FAQ</Link>
          <Link href="/support" className="hover:text-graphite-900">Support</Link>
        </div>
      </div>
    </footer>
  );
}
