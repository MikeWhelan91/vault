'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCrypto } from '@/contexts/CryptoContext';

export default function SignInPage() {
  const router = useRouter();
  const { unlock, isUnlocked } = useCrypto();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vault_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Redirect if already unlocked
  useEffect(() => {
    if (isUnlocked) {
      router.push('/app');
    }
  }, [isUnlocked, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // Save email for next time
      localStorage.setItem('vault_user_email', email.trim().toLowerCase());

      // Unlock vault
      await unlock(password, email.trim().toLowerCase());

      // Redirect to app
      router.push('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 transition-opacity hover:opacity-80">
            <img
              src="/logotextslim.png"
              alt="Forebearer"
              className="h-10 w-auto mx-auto"
            />
          </Link>
          <h2 className="text-3xl font-light text-graphite-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-graphite-600 text-sm">
            Sign in to access your encrypted vault
          </p>
        </div>

        {/* Form */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSignIn} className="space-y-5">
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
              autoFocus={!email}
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              error={error}
              disabled={isLoading}
              autoComplete="current-password"
              autoFocus={!!email}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-graphite-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-accent-600 hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-graphite-200">
            <p className="text-xs text-graphite-600 leading-relaxed">
              Your password is used to decrypt your data locally. We never see your password or decrypted data.
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-graphite-600 hover:text-graphite-900 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
