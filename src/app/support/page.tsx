'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Footer } from '@/components/Footer';

export default function SupportPage() {
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
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-semibold text-graphite-900 tracking-tight">
            Forebearer
          </Link>
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-graphite-900 mb-4">
            How Can We Help?
          </h1>
          <p className="text-lg text-graphite-600">
            Have a question or need assistance? We&apos;re here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Quick Links */}
          <Card>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/faq" className="block text-primary-600 hover:text-primary-700">
                → Frequently Asked Questions
              </Link>
              <a href="mailto:hello@forebearer.app" className="block text-primary-600 hover:text-primary-700">
                → Email: hello@forebearer.app
              </a>
            </div>
          </Card>

          {/* Response Time */}
          <Card>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Response Time</h2>
            <p className="text-graphite-600 mb-2">
              We typically respond within <strong>24-48 hours</strong> during business days.
            </p>
            <p className="text-sm text-graphite-500">
              For urgent issues, please include &quot;URGENT&quot; in your subject line.
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
