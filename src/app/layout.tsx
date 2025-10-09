import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/contexts/CryptoContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Unlatches - Zero-Knowledge Encrypted Storage",
  description: "Secure your digital legacy with zero-knowledge encrypted storage, time-locked releases, and heartbeat monitoring.",
  keywords: [
    "zero-knowledge storage",
    "encrypted vault",
    "digital legacy planning",
    "secure document sharing",
    "time-lock releases",
    "heartbeat monitoring",
  ],
  openGraph: {
    title: "Unlatches - Zero-Knowledge Encrypted Storage",
    description:
      "Client-side encrypted storage with automated releases, trustee workflows, and heartbeat monitoring to protect your most sensitive data.",
    type: "website",
    siteName: "Unlatches",
    url: "https://unlatches.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlatches - Zero-Knowledge Encrypted Storage",
    description:
      "Protect critical files and notes with zero-knowledge encryption, automated releases, and trustee controls.",
  },
  alternates: {
    canonical: "https://unlatches.app/",
  },
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
