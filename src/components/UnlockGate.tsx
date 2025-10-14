'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validatePassphrase } from '@/lib/crypto';

export function UnlockGate({ children }: { children: React.ReactNode }) {
  const { isUnlocked, unlock } = useCrypto();
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vault_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Save email for next time
      localStorage.setItem('vault_user_email', email.trim().toLowerCase());

      // Use email as userId for encryption
      await unlock(passphrase, email.trim().toLowerCase());
      setPassphrase('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
    } finally {
      setIsLoading(false);
    }
  };

  const validation = validatePassphrase(passphrase);
  const showErrors = showValidation && !validation.valid && passphrase.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 dark:bg-graphite-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-semibold text-graphite-900 dark:text-ivory-50">
              Forebearer
            </h1>
          </Link>
          <h2 className="text-3xl font-light text-graphite-900 dark:text-ivory-50 mb-2">
            Access Your Vault
          </h2>
          <p className="text-graphite-600 dark:text-graphite-400 text-sm">
            Enter your credentials to unlock
          </p>
        </div>

        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleUnlock} className="space-y-5">
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
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError('');
              }}
              onBlur={() => setShowValidation(true)}
              placeholder="Enter your password"
              error={error}
              disabled={isLoading}
              autoComplete="current-password"
              autoFocus={!!email}
            />

            {showErrors && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Weak password:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || passphrase.length === 0 || email.length === 0}
              isLoading={isLoading}
            >
              Unlock Vault
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-graphite-200 dark:border-graphite-700">
            <p className="text-xs text-graphite-600 dark:text-graphite-400 leading-relaxed">
              <strong className="text-graphite-900 dark:text-ivory-50">First time?</strong> Enter your email and create a strong password.
              Your password encrypts all your data - we can never access it.
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-3 leading-relaxed">
              If you forget your password, your data cannot be recovered.
            </p>
          </div>
        </div>

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
