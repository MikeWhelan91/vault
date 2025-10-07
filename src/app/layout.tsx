import type { Metadata } from "next";
import "./globals.css";
import { CryptoProvider } from "@/contexts/CryptoContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Vault - Zero-Knowledge Encrypted Storage",
  description: "Secure, zero-knowledge encrypted storage with time-locked releases",
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
        <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
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
