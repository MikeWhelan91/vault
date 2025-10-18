'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCrypto } from '@/contexts/CryptoContext';
import { useIsNativeApp } from '@/lib/platform';
import { biometric, haptics } from '@/lib/mobile';
import {
  hasBiometricCredentials,
  retrieveBiometricCredentials,
  storeBiometricCredentials,
  getStoredEmail,
  clearBiometricCredentials,
} from '@/lib/biometric-storage';
import { Fingerprint } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { unlock, isUnlocked } = useCrypto();
  const isNativeApp = useIsNativeApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [showEnableBiometric, setShowEnableBiometric] = useState(false);

  // Check biometric availability and saved credentials on mount
  useEffect(() => {
    async function init() {
      if (isNativeApp) {
        const available = await biometric.isAvailable();
        setBiometricAvailable(available);

        const hasCredentials = hasBiometricCredentials();
        setHasSavedCredentials(hasCredentials);

        if (hasCredentials) {
          const storedEmail = getStoredEmail();
          if (storedEmail) {
            setEmail(storedEmail);
          }
        }
      } else {
        // Web fallback - load saved email
        const savedEmail = localStorage.getItem('vault_user_email');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
    }

    init();
  }, [isNativeApp]);

  // Redirect if already unlocked (but not if showing biometric modal)
  useEffect(() => {
    if (isUnlocked && !showEnableBiometric) {
      router.push('/app');
    }
  }, [isUnlocked, showEnableBiometric, router]);

  const handleBiometricSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await haptics.light();

      // Authenticate with biometrics
      const authenticated = await biometric.authenticate('Sign in to Forebearer');

      if (!authenticated) {
        await haptics.error();
        setError('Biometric authentication failed');
        setIsLoading(false);
        return;
      }

      await haptics.success();

      // Retrieve stored credentials
      const credentials = await retrieveBiometricCredentials();

      if (!credentials) {
        setError('Failed to retrieve credentials. Please sign in with password.');
        setIsLoading(false);
        return;
      }

      // Unlock vault with stored credentials
      await unlock(credentials.password, credentials.email);

      // Redirect to app
      router.push('/app');
    } catch (err) {
      await haptics.error();
      setError(err instanceof Error ? err.message : 'Biometric sign in failed');
      setIsLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (!email || !password) return;

    try {
      await haptics.medium();
      await storeBiometricCredentials(email, password);
      await haptics.success();
      setShowEnableBiometric(false);
      setHasSavedCredentials(true);
    } catch (error) {
      console.error('Failed to enable biometric:', error);
    }
  };

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

      // On mobile, offer to enable biometric after successful login
      if (isNativeApp && biometricAvailable && !hasSavedCredentials) {
        setShowEnableBiometric(true);
        // Don't redirect - let the modal handle it
      } else {
        // Redirect to app immediately if not showing biometric prompt
        router.push('/app');
      }
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
          {/* Biometric Sign In Button - Show if credentials are saved */}
          {isNativeApp && biometricAvailable && hasSavedCredentials && (
            <div className="mb-6">
              <Button
                type="button"
                onClick={handleBiometricSignIn}
                className="w-full flex items-center justify-center gap-2"
                variant="secondary"
                size="lg"
                disabled={isLoading}
              >
                <Fingerprint className="w-5 h-5" />
                Sign in with Biometrics
              </Button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-graphite-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-graphite-500">Or sign in with password</span>
                </div>
              </div>
            </div>
          )}

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

      {/* Biometric Enrollment Modal */}
      {showEnableBiometric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-slide-up">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary-100 p-3">
                <Fingerprint className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h3 className="mb-2 text-center text-xl font-semibold text-graphite-900">
              Enable Biometric Login?
            </h3>
            <p className="mb-6 text-center text-sm text-graphite-600">
              Sign in faster next time using your fingerprint or face recognition
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowEnableBiometric(false);
                  router.push('/app');
                }}
              >
                Skip
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={async () => {
                  await handleEnableBiometric();
                  router.push('/app');
                }}
              >
                Enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
