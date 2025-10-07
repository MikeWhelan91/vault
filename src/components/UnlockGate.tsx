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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔒 Unlock Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your encrypted vault
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleUnlock} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="your@email.com"
              disabled={isLoading}
              autoComplete="email"
              autoFocus={!email}
            />

            <Input
              type="password"
              label="Passphrase"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError('');
              }}
              onBlur={() => setShowValidation(true)}
              placeholder="Enter your passphrase"
              error={error}
              disabled={isLoading}
              autoComplete="current-password"
              autoFocus={!!email}
            />

            {showErrors && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Weak passphrase:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
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

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>First time?</strong> Enter your email and create a strong passphrase.
              Your passphrase encrypts all your data - we can never access it.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              ⚠️ If you forget your passphrase, your data cannot be recovered.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
