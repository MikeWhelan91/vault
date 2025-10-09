'use client';

import React, { useState } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReleaseMode, ReleaseBundle, Trustee } from '@/types';

export default function ReleasePage() {
  const { metadata } = useCrypto();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [bundleName, setBundleName] = useState('');
  const [mode, setMode] = useState<ReleaseMode>('time-lock');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState('');
  const [heartbeatCadence, setHeartbeatCadence] = useState(30);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [newTrusteeEmail, setNewTrusteeEmail] = useState('');
  const [newTrusteeName, setNewTrusteeName] = useState('');

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddTrustee = () => {
    if (!newTrusteeEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    const trustee: Trustee = {
      id: crypto.randomUUID(),
      email: newTrusteeEmail.trim(),
      name: newTrusteeName.trim() || undefined,
    };

    setTrustees([...trustees, trustee]);
    setNewTrusteeEmail('');
    setNewTrusteeName('');
  };

  const handleRemoveTrustee = (id: string) => {
    setTrustees(trustees.filter((t) => t.id !== id));
  };

  const handleCreateBundle = () => {
    // Validation
    if (!bundleName.trim()) {
      showToast('Please enter a bundle name', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Please select at least one item', 'error');
      return;
    }

    if (mode === 'time-lock' && !releaseDate) {
      showToast('Please select a release date', 'error');
      return;
    }

    if (trustees.length === 0) {
      showToast('Please add at least one trustee', 'error');
      return;
    }

    // Create bundle
    const bundle: ReleaseBundle = {
      id: crypto.randomUUID(),
      name: bundleName,
      mode,
      items: selectedItems,
      createdAt: new Date().toISOString(),
      releaseDate: mode === 'time-lock' ? releaseDate : undefined,
      heartbeatCadence: mode === 'heartbeat' ? heartbeatCadence : undefined,
      trustees,
    };

    // Save to localStorage (in production, this would sync with backend)
    const existingBundles = JSON.parse(localStorage.getItem('release_bundles') || '[]');
    localStorage.setItem('release_bundles', JSON.stringify([...existingBundles, bundle]));

    showToast('Release bundle created successfully', 'success');

    // Reset form
    setBundleName('');
    setSelectedItems([]);
    setReleaseDate('');
    setTrustees([]);
    setStep(1);
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-graphite-900 dark:text-ivory-50">
          ⏰ Create Release Bundle
        </h1>
        <p className="text-graphite-600 mt-1 dark:text-graphite-300">
          Configure automatic release of encrypted data to trustees
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`
              flex-1 h-2 rounded-full
              ${s <= step ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-graphite-700'}
            `}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50 mb-4">
            Step 1: Basic Information
          </h2>
          <div className="space-y-6">
            <Input
              label="Bundle Name"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="My Will & Testament"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-ivory-300 mb-3">
                Release Mode
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('time-lock')}
                  className={`
                    p-6 rounded-lg border-2 transition-colors text-left
                    ${
                      mode === 'time-lock'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-graphite-200 dark:border-graphite-600'
                    }
                  `}
                >
                  <span className="text-3xl block mb-2">⏰</span>
                  <h3 className="font-semibold text-graphite-900 dark:text-ivory-50 mb-1">
                    Time-Lock
                  </h3>
                  <p className="text-sm text-graphite-600 dark:text-graphite-400">
                    Release on a specific date in the future
                  </p>
                </button>

                <button
                  onClick={() => setMode('heartbeat')}
                  className={`
                    p-6 rounded-lg border-2 transition-colors text-left
                    ${
                      mode === 'heartbeat'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-graphite-200 dark:border-graphite-600'
                    }
                  `}
                >
                  <span className="text-3xl block mb-2">💓</span>
                  <h3 className="font-semibold text-graphite-900 dark:text-ivory-50 mb-1">
                    Heartbeat
                  </h3>
                  <p className="text-sm text-graphite-600 dark:text-graphite-400">
                    Release if you miss regular check-ins
                  </p>
                </button>
              </div>
            </div>

            {mode === 'time-lock' && (
              <Input
                type="datetime-local"
                label="Release Date & Time"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                helperText="Data will be released to trustees at this time"
              />
            )}

            {mode === 'heartbeat' && (
              <Input
                type="number"
                label="Heartbeat Cadence (days)"
                value={heartbeatCadence}
                onChange={(e) => setHeartbeatCadence(parseInt(e.target.value) || 1)}
                helperText="Release if you miss check-in by this many days"
                min={1}
                max={365}
              />
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next Step</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Select Items */}
      {step === 2 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50 mb-4">
            Step 2: Select Items
          </h2>
          <p className="text-graphite-600 mb-4 dark:text-graphite-400">
            Choose which items to include in this release bundle
          </p>

          {metadata.items.length === 0 ? (
            <p className="text-center py-8 text-graphite-500 dark:text-graphite-400">
              No items available. Add items first.
            </p>
          ) : (
            <div className="space-y-2 mb-6">
              {metadata.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-graphite-50 dark:hover:bg-graphite-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-2xl">
                    {item.type === 'file' ? '📄' : '📝'}
                  </span>
                  <span className="flex-1 text-graphite-900 dark:text-ivory-50">
                    {item.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={selectedItems.length === 0}
            >
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Add Trustees */}
      {step === 3 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50 mb-4">
            Step 3: Add Trustees
          </h2>
          <p className="text-graphite-600 mb-4 dark:text-graphite-400">
            Trustees will receive access to the encrypted data when release conditions are met
          </p>

          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={newTrusteeEmail}
                onChange={(e) => setNewTrusteeEmail(e.target.value)}
                placeholder="trustee@example.com"
              />
              <Input
                label="Name (optional)"
                value={newTrusteeName}
                onChange={(e) => setNewTrusteeName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <Button variant="secondary" onClick={handleAddTrustee} className="w-full">
              + Add Trustee
            </Button>
          </div>

          {trustees.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-ivory-300">
                Added Trustees ({trustees.length})
              </h3>
              {trustees.map((trustee) => (
                <div
                  key={trustee.id}
                  className="flex items-center justify-between p-3 bg-graphite-50 dark:bg-graphite-900/60 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-graphite-900 dark:text-ivory-50">
                      {trustee.name || trustee.email}
                    </p>
                    {trustee.name && (
                      <p className="text-sm text-graphite-600 dark:text-graphite-400">
                        {trustee.email}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrustee(trustee.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={trustees.length === 0}>
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Create */}
      {step === 4 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50 mb-4">
            Step 4: Review & Create
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-ivory-300 mb-1">
                Bundle Name
              </h3>
              <p className="text-graphite-900 dark:text-ivory-50">{bundleName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-ivory-300 mb-1">
                Release Mode
              </h3>
              <p className="text-graphite-900 dark:text-ivory-50">
                {mode === 'time-lock' ? `⏰ Time-Lock (${new Date(releaseDate).toLocaleString()})` : `💓 Heartbeat (${heartbeatCadence} days)`}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-ivory-300 mb-1">
                Selected Items ({selectedItems.length})
              </h3>
              <ul className="space-y-1">
                {selectedItems.map((itemId) => {
                  const item = metadata.items.find((i) => i.id === itemId);
                  return item ? (
                    <li key={itemId} className="text-graphite-900 dark:text-ivory-50">
                      {item.type === 'file' ? '📄' : '📝'} {item.name}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-ivory-300 mb-1">
                Trustees ({trustees.length})
              </h3>
              <ul className="space-y-1">
                {trustees.map((trustee) => (
                  <li key={trustee.id} className="text-graphite-900 dark:text-ivory-50">
                    {trustee.name || trustee.email}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreateBundle}>
                Create Bundle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-primary-50 border-blue-200 dark:bg-primary-900/20 dark:border-blue-500/40">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          Note: Placeholder Implementation
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-100">
          This is a client-side prototype. In production, bundles would be stored on the backend
          and trustees would receive email notifications with secure unlock links when conditions are met.
        </p>
      </Card>
    </div>
  );
}
