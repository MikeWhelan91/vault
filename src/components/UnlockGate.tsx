'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validatePassphrase } from '@/lib/crypto';

export function UnlockGate({ children }: { children: React.ReactNode }) {
  const { isUnlocked, unlock, signup } = useCrypto();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('vault_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Check if user just completed a payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your account has been upgraded to Plus. Please enter your password to access your vault.');
      // Clear the success param to avoid showing message on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate name for signup
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      // Save email for next time
      localStorage.setItem('vault_user_email', email.trim().toLowerCase());

      if (mode === 'signup') {
        await signup(password, email.trim().toLowerCase(), name.trim());
      } else {
        await unlock(password, email.trim().toLowerCase());
      }

      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode === 'signup' ? 'create account' : 'unlock vault'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validation = validatePassphrase(password);
  const showErrors = showValidation && !validation.valid && password.length > 0;

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
            {mode === 'login' ? 'Access Your Vault' : 'Create Your Account'}
          </h2>
          <p className="text-graphite-600 dark:text-graphite-400 text-sm">
            {mode === 'login'
              ? 'Enter your credentials to unlock'
              : 'Start protecting your digital legacy'}
          </p>
        </div>

        <div className="card p-8 animate-slide-up">
          {successMessage && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {mode === 'signup' && (
              <Input
                type="text"
                label="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Your name"
                disabled={isLoading}
                autoComplete="name"
              />
            )}

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onBlur={() => setShowValidation(mode === 'signup')}
              placeholder="Enter your password"
              error={error}
              disabled={isLoading}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              autoFocus={!!email && mode === 'login'}
            />

            {showErrors && mode === 'signup' && (
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
              disabled={isLoading || password.length === 0 || email.length === 0 || (mode === 'signup' && name.length === 0)}
              isLoading={isLoading}
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-graphite-200 dark:border-graphite-700">
            {mode === 'signup' && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3 leading-relaxed">
                <strong>Important:</strong> Your password encrypts all your data. We can never access it.
                If you forget your password, your data cannot be recovered.
              </p>
            )}
            <p className="text-xs text-graphite-600 dark:text-graphite-400 text-center">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setShowValidation(false);
                    }}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setShowValidation(false);
                    }}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Log in
                  </button>
                </>
              )}
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
