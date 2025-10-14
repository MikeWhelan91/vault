'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validatePassphrase } from '@/lib/crypto';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    const validation = validatePassphrase(password);
    if (!validation.valid) {
      setError('Password does not meet security requirements');
      setShowValidation(true);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Save email for signin
      localStorage.setItem('vault_user_email', email.trim().toLowerCase());

      // Send welcome email
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't block signup if email fails
      }

      // Redirect to app to set up vault
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const validation = validatePassphrase(password);
  const showErrors = showValidation && !validation.valid && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 dark:bg-graphite-900 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-semibold text-graphite-900 dark:text-ivory-50">
              Forebearer
            </h1>
          </Link>
          <h2 className="text-3xl font-light text-graphite-900 dark:text-ivory-50 mb-2">
            Create Your Account
          </h2>
          <p className="text-graphite-600 dark:text-graphite-400 text-sm">
            Start securing your digital legacy today
          </p>
        </div>

        {/* Form */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSignUp} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onBlur={() => setShowValidation(true)}
              placeholder="Create a strong password"
              disabled={isLoading}
              autoComplete="new-password"
              helperText="Minimum 12 characters, including uppercase, lowercase, numbers, and symbols"
            />

            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Re-enter your password"
              disabled={isLoading}
              autoComplete="new-password"
            />

            {showErrors && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Password requirements not met:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && !showErrors && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="bg-graphite-50 dark:bg-graphite-800 border border-graphite-200 dark:border-graphite-700 rounded-lg p-4">
              <p className="text-xs text-graphite-600 dark:text-graphite-400 leading-relaxed">
                <strong className="text-graphite-900 dark:text-ivory-50">Important:</strong> Your password encrypts all your data using zero-knowledge encryption.
                We cannot recover your password or decrypt your data if you forget it.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password || !confirmPassword}
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-graphite-600 dark:text-graphite-400">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-accent-600 dark:text-accent-400 hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-graphite-600 dark:text-graphite-400 hover:text-graphite-900 dark:hover:text-ivory-50 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
