"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Failed to send support message:", error);
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-graphite-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Support team
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-graphite-900 sm:text-5xl">
              How can we help you today?
            </h1>
            <p className="max-w-2xl text-base text-graphite-600 sm:text-lg">
              Send us a message and we will reply within 24–48 hours on business days. Include as much detail as you can so we can assist quickly.
            </p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="border-graphite-200/80 bg-white/95 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-graphite-900">Send us a message</h2>
            <p className="mt-2 text-sm text-graphite-600">
              We read every message. If your request is urgent, add &ldquo;URGENT&rdquo; to the subject line.
            </p>

            {status === "success" && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <p className="font-medium">Message sent successfully.</p>
                <p>We will get back to you as soon as possible.</p>
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-medium">Something went wrong.</p>
                <p>Please try again or email us directly at hello@forebearer.app.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-graphite-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-graphite-200 px-4 py-3 text-sm text-graphite-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-graphite-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl border border-graphite-200 px-4 py-3 text-sm text-graphite-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-sm font-medium text-graphite-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="rounded-xl border border-graphite-200 px-4 py-3 text-sm text-graphite-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-graphite-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="resize-none rounded-xl border border-graphite-200 px-4 py-3 text-sm text-graphite-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={status === "sending"}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send message"}
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-graphite-200/70 bg-white p-6">
              <h2 className="text-xl font-semibold text-graphite-900">Quick help</h2>
              <p className="mt-2 text-sm text-graphite-600">Check these pages before you write in—we keep them updated.</p>
              <ul className="mt-4 space-y-2 text-sm text-primary-600">
                <li>
                  <Link href="/faq" className="transition-colors hover:text-primary-700">
                    Browse the FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="transition-colors hover:text-primary-700">
                    Compare pricing tiers
                  </Link>
                </li>
                <li>
                  <Link href="/release" className="transition-colors hover:text-primary-700">
                    See the latest product updates
                  </Link>
                </li>
              </ul>
            </Card>

            <Card className="border-primary-200/80 bg-primary-50/80 p-6">
              <h2 className="text-xl font-semibold text-graphite-900">Prefer email?</h2>
              <p className="mt-2 text-sm text-graphite-600">
                Email us directly and we will create a ticket for you.
              </p>
              <a
                href="mailto:hello@forebearer.app"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                <Mail className="h-4 w-4" aria-hidden="true" /> hello@forebearer.app
              </a>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
