'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, LifeBuoy } from 'lucide-react';

export default function SupportPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send support message:', error);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-600">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-graphite-900 sm:text-4xl">How can we help?</h1>
        <p className="mt-3 text-sm text-graphite-600 sm:text-base">
          Have a question about your vault or a bundle configuration? Raise a secure ticket and our team will respond within 24–48 hours.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border border-graphite-200 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-graphite-900">Quick links</h2>
          <div className="space-y-3 text-sm">
            <Link href="/app/faq" className="group flex items-center justify-between rounded-xl border border-graphite-100 px-3 py-2 text-primary-700 transition-colors hover:border-primary-200">
              <span>View vault FAQs</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="mailto:hello@forebearer.app" className="group flex items-center justify-between rounded-xl border border-graphite-100 px-3 py-2 text-primary-700 transition-colors hover:border-primary-200">
              <span>hello@forebearer.app</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Card>

        <Card className="rounded-3xl border border-graphite-200 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-graphite-900">Response time</h2>
          <p className="text-sm text-graphite-600">
            We typically respond within <span className="font-semibold text-graphite-900">24–48 hours</span> on business days. For urgent matters, mention “URGENT” in the subject line so we can triage quickly.
          </p>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <h2 className="text-2xl font-semibold text-graphite-900 mb-6">Send Us a Message</h2>

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-medium">Message sent successfully!</p>
            <p className="text-sm">We&apos;ll get back to you as soon as possible.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">Failed to send message</p>
            <p className="text-sm">Please try again or email us directly at hello@forebearer.app</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-graphite-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-graphite-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-graphite-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-graphite-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={status === 'sending'}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
