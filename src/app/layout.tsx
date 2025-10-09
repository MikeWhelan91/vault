import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/contexts/CryptoContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Unlatches - Zero-Knowledge Encrypted Storage",
  description:
    "Secure your digital legacy with zero-knowledge encrypted storage, time-locked releases, and heartbeat monitoring for trusted data access.",
  keywords: [
    "zero-knowledge storage",
    "encrypted vault",
    "digital legacy",
    "secure file sharing",
    "time lock releases",
    "heartbeat monitoring",
  ],
  openGraph: {
    title: "Unlatches | Zero-Knowledge Encrypted Vault for Your Digital Legacy",
    description:
      "Protect sensitive notes and documents with client-side encryption, timed releases, and heartbeat monitoring for trusted recipients.",
    url: "https://unlatches.com",
    siteName: "Unlatches",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlatches - Encrypted Vault for Your Digital Legacy",
    description:
      "Secure your most important data with zero-knowledge encryption, scheduled releases, and heartbeat monitoring.",
  },
  metadataBase: new URL("https://unlatches.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics */}
        <script defer data-domain="unlatched.com" src="https://plausible.io/js/script.js"></script>
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          <CryptoProvider>
            {children}
          </CryptoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
