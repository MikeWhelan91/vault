import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/contexts/CryptoContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Unlatches - Zero-Knowledge Encrypted Storage",
  description: "Secure your digital legacy with zero-knowledge encrypted storage, time-locked releases, and heartbeat monitoring.",
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
