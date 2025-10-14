import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/contexts/CryptoContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Forebearer - Leave Something Behind | Secure Digital Legacy",
  description: "Store photos, videos, and messages safely. Share them with loved ones at the right time. End-to-end encrypted digital memory vault with time-lock and heartbeat features.",
  keywords: [
    "digital legacy",
    "memory storage",
    "encrypted photos",
    "time capsule",
    "digital inheritance",
    "secure file storage",
    "heartbeat monitoring",
    "dead man switch",
    "posthumous messages",
    "digital vault",
    "encrypted memories",
    "family memories",
  ],
  authors: [{ name: "Forebearer" }],
  metadataBase: new URL("https://forebearer.app"),
  openGraph: {
    title: "Forebearer - Leave Something Behind",
    description:
      "Store memories, messages, and meaningful things. Share them with loved ones when the time is right. Fully encrypted and private.",
    type: "website",
    siteName: "Forebearer",
    url: "https://forebearer.app",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forebearer - Leave Something Behind",
    description:
      "Store photos, videos, and messages safely. Share them with loved ones when the time is right.",
    creator: "@forebearer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://forebearer.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>
          <CryptoProvider>
            {children}
          </CryptoProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
