'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';

export default function UnlockPage({ params }: { params: Promise<{ token: string }> }) {
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [bundleData, setBundleData] = useState<any>(null);
  const [error, setError] = useState('');
  const unwrappedParams = React.use(params);

  // Simulate fetching bundle metadata (in production, this would be an API call)
  useEffect(() => {
    // Placeholder: In production, fetch bundle info from backend using token
    const mockBundle = {
      id: unwrappedParams.token,
      name: 'My Secret Documents',
      ownerName: 'John Doe',
      itemCount: 3,
      releaseDate: new Date().toISOString(),
      mode: 'time-lock' as const,
    };

    setBundleData(mockBundle);
  }, [unwrappedParams.token]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    try {
      // Placeholder: In production, this would:
      // 1. Send token + passphrase to backend
      // 2. Backend verifies token and retrieves wrapped data key
      // 3. Client derives key from passphrase and unwraps data key
      // 4. Client downloads and decrypts items

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo, just show success
      setUnlocked(true);
    } catch (err) {
      setError('Failed to unlock bundle. Please check your passphrase.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!bundleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔓 Unlock Release Bundle
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You&apos;ve received access to encrypted data
          </p>
        </div>

        {!unlocked ? (
          <Card>
            {/* Bundle Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {bundleData.name}
              </h2>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p>From: <strong>{bundleData.ownerName}</strong></p>
                <p>Items: <strong>{bundleData.itemCount}</strong></p>
                <p>
                  Released:{' '}
                  <strong>{new Date(bundleData.releaseDate).toLocaleString()}</strong>
                </p>
              </div>
            </div>

            {/* Unlock Form */}
            <form onSubmit={handleUnlock} className="space-y-6">
              <Input
                type="password"
                label="Passphrase"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setError('');
                }}
                placeholder="Enter passphrase provided by the sender"
                error={error}
                disabled={isUnlocking}
                autoFocus
                helperText="You should have received this passphrase separately from the owner"
              />

              {isUnlocking && (
                <Progress
                  value={50}
                  label="Unlocking bundle..."
                  color="blue"
                  showPercentage={false}
                />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isUnlocking || passphrase.length === 0}
                isLoading={isUnlocking}
              >
                Unlock Bundle
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>How it works:</strong> The passphrase you enter will decrypt
                the bundle&apos;s data key, allowing you to access the encrypted items.
                Your passphrase is never sent to the server.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            {/* Success View */}
            <div className="text-center py-8">
              <span className="text-6xl block mb-4">✅</span>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Bundle Unlocked!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You can now access the encrypted items
              </p>

              {/* Placeholder Items List */}
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Important Document.pdf
                      </p>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Secret Note
                      </p>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This is a placeholder implementation. In production,
                  actual encrypted files would be downloaded and decrypted here.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by <strong>Vault</strong> - Zero-Knowledge Encrypted Storage
          </p>
        </div>
      </div>
    </div>
  );
}
