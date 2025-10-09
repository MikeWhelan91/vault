'use client';

import React, { useMemo, useState } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReleaseMode, ReleaseBundle, Trustee } from '@/types';

const steps = ['Plan basics', 'Select items', 'Assign trustees', 'Review & launch'];

export default function ReleaseClient() {
  const { metadata } = useCrypto();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
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
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
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

  const handleNext = () => {
    if (step === 0) {
      if (!bundleName.trim()) {
        showToast('Name your release bundle to continue', 'error');
        return;
      }
      if (mode === 'time-lock' && !releaseDate) {
        showToast('Select a release date and time', 'error');
        return;
      }
    }

    if (step === 1) {
      if (selectedItems.length === 0) {
        showToast('Choose at least one encrypted item', 'error');
        return;
      }
    }

    if (step === 2) {
      if (trustees.length === 0) {
        showToast('Add at least one trustee', 'error');
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreateBundle = () => {
    if (!bundleName.trim()) {
      showToast('Bundle name is required', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Select at least one item', 'error');
      return;
    }

    if (mode === 'time-lock' && !releaseDate) {
      showToast('Provide a release date', 'error');
      return;
    }

    if (trustees.length === 0) {
      showToast('Trustees are required to deliver releases', 'error');
      return;
    }

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

    const existingBundles = JSON.parse(localStorage.getItem('release_bundles') || '[]');
    localStorage.setItem('release_bundles', JSON.stringify([...existingBundles, bundle]));

    showToast('Release bundle created successfully', 'success');

    setBundleName('');
    setSelectedItems([]);
    setReleaseDate('');
    setTrustees([]);
    setStep(0);
  };

  const nextActionLabel = step === steps.length - 1 ? 'Create bundle' : 'Continue';

  const reviewItems = useMemo(
    () =>
      selectedItems
        .map((itemId) => metadata?.items?.find((item) => item.id === itemId))
        .filter(Boolean),
    [metadata, selectedItems]
  );

  if (!metadata) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-graphite-500">
        Loading release planner...
      </div>
    );
  }

  const itemsAvailable = metadata.items.length > 0;

  return (
    <div className="space-y-12">
      <section className="gradient-panel relative overflow-hidden p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-graphite-500">
              Automated trust
            </span>
            <h1 className="text-4xl font-light tracking-tight text-graphite-900 dark:text-ivory-50">
              Orchestrate a future-proof release
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-graphite-600 dark:text-graphite-300">
              Define which encrypted assets unlock, who receives them, and the precise moment or heartbeat cadence that makes it happen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-6" onClick={handleNext}>
                {step === 0 ? 'Start planning' : nextActionLabel}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-6"
                onClick={() => setMode((prev) => (prev === 'time-lock' ? 'heartbeat' : 'time-lock'))}
              >
                Switch to {mode === 'time-lock' ? 'heartbeat' : 'time-lock'}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/50 bg-white/80 px-6 py-5 text-sm shadow-sm backdrop-blur dark:border-graphite-700/70 dark:bg-graphite-900/70">
              <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">Current mode</p>
              <p className="mt-3 text-2xl font-light text-graphite-900 dark:text-ivory-50">
                {mode === 'time-lock' ? 'Time-locked delivery' : 'Heartbeat escalation'}
              </p>
              <p className="text-xs text-graphite-500 dark:text-graphite-300">
                {mode === 'time-lock'
                  ? 'Release automatically on a scheduled date and time.'
                  : 'Release when heartbeat check-ins are missed.'}
              </p>
            </div>
            <div className="placeholder-box h-32 w-full border border-graphite-200/60 dark:border-graphite-700/60" aria-hidden />
          </div>
        </div>
      </section>

      <Stepper currentStep={step} />

      {step === 0 && (
        <Card className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Bundle foundation</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Name the bundle and set how it unlocks.
            </p>
          </header>

          <div className="space-y-6">
            <Input
              label="Bundle name"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g. Founder transition kit"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <ReleaseModeCard
                title="Time-lock"
                description="Unlock everything on a specific future date."
                icon="⏰"
                active={mode === 'time-lock'}
                onClick={() => setMode('time-lock')}
              />
              <ReleaseModeCard
                title="Heartbeat"
                description="Trigger a release when check-ins are missed."
                icon="💓"
                active={mode === 'heartbeat'}
                onClick={() => setMode('heartbeat')}
              />
            </div>

            {mode === 'time-lock' ? (
              <Input
                type="datetime-local"
                label="Release date & time"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                helperText="Trustees receive access when this moment arrives."
              />
            ) : (
              <Input
                type="number"
                label="Heartbeat cadence (days)"
                value={heartbeatCadence}
                min={1}
                max={365}
                onChange={(e) => setHeartbeatCadence(parseInt(e.target.value) || 1)}
                helperText="Number of days between required check-ins."
              />
            )}
          </div>

          <FooterActions
            onNext={handleNext}
            nextLabel="Continue"
            disableNext={!bundleName || (mode === 'time-lock' ? !releaseDate : heartbeatCadence <= 0)}
          />
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Select encrypted items</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Choose which assets should unlock together.
            </p>
          </header>

          {!itemsAvailable ? (
            <div className="rounded-2xl border border-dashed border-graphite-200/70 bg-white/60 px-6 py-12 text-center text-sm text-graphite-500 dark:border-graphite-700/70 dark:bg-graphite-900/40">
              No items available. Add encrypted items first.
            </div>
          ) : (
            <div className="space-y-3">
              {metadata.items.map((item) => {
                const selected = selectedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-graphite-900 bg-graphite-900 text-white dark:border-ivory-100 dark:bg-ivory-100 dark:text-graphite-900'
                        : 'border-graphite-200 bg-white text-graphite-700 hover:border-graphite-400 dark:border-graphite-600 dark:bg-graphite-900 dark:text-ivory-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.type === 'file' ? '📄' : '📝'}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs opacity-80">{formatFileSize(item.size)} • Updated {formatDate(item.updatedAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs uppercase tracking-[0.3em] ${selected ? 'opacity-90' : 'opacity-60'}`}>
                      {selected ? 'Added' : 'Add'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <FooterActions
            onBack={handleBack}
            onNext={handleNext}
            disableNext={selectedItems.length === 0}
            nextLabel="Continue"
          />
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Assign trustees</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Add the people who should receive access when conditions are met.
            </p>
          </header>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email address"
                type="email"
                value={newTrusteeEmail}
                onChange={(e) => setNewTrusteeEmail(e.target.value)}
                placeholder="trustee@example.com"
              />
              <Input
                label="Name (optional)"
                value={newTrusteeName}
                onChange={(e) => setNewTrusteeName(e.target.value)}
                placeholder="Jamie Rivera"
              />
            </div>
            <Button variant="secondary" className="w-full rounded-full" onClick={handleAddTrustee}>
              + Add trustee
            </Button>
          </div>

          {trustees.length > 0 && (
            <div className="space-y-3">
              {trustees.map((trustee) => (
                <div
                  key={trustee.id}
                  className="flex items-center justify-between rounded-2xl border border-graphite-200 bg-white/80 px-4 py-3 text-sm dark:border-graphite-600 dark:bg-graphite-900/70"
                >
                  <div>
                    <p className="font-medium text-graphite-900 dark:text-ivory-50">{trustee.name || trustee.email}</p>
                    {trustee.name && (
                      <p className="text-xs text-graphite-500 dark:text-graphite-300">{trustee.email}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveTrustee(trustee.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <FooterActions
            onBack={handleBack}
            onNext={handleNext}
            disableNext={trustees.length === 0}
            nextLabel="Continue"
          />
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Review & confirm</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Double-check the configuration before generating the bundle.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-graphite-200/70 bg-white/70 p-5 dark:border-graphite-600 dark:bg-graphite-900/60">
              <ReviewRow label="Bundle name" value={bundleName || '—'} />
              <ReviewRow
                label="Release mode"
                value={
                  mode === 'time-lock'
                    ? `Time-lock • ${releaseDate ? new Date(releaseDate).toLocaleString() : 'No date set'}`
                    : `Heartbeat • every ${heartbeatCadence} days`
                }
              />
              <ReviewRow label="Trustees" value={`${trustees.length}`} />
            </div>
            <div className="space-y-3 rounded-2xl border border-graphite-200/70 bg-white/70 p-5 dark:border-graphite-600 dark:bg-graphite-900/60">
              <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">Items included</p>
              {reviewItems.length === 0 ? (
                <p className="text-sm text-graphite-500 dark:text-graphite-300">No items selected.</p>
              ) : (
                <ul className="space-y-2 text-sm text-graphite-800 dark:text-ivory-50">
                  {reviewItems.map((item) => (
                    <li key={item!.id} className="flex items-center gap-2">
                      <span>{item!.type === 'file' ? '📄' : '📝'}</span>
                      <span>{item!.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <FooterActions onBack={handleBack} onNext={handleCreateBundle} nextLabel="Create bundle" />
        </Card>
      )}

      <Card className="space-y-3 border border-amber-200/70 bg-amber-50/80 p-6 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100">
        <h3 className="text-base font-semibold">Prototype notice</h3>
        <p>
          Release bundles are stored in local storage for now. In production, trustees receive secure notifications once release conditions are met.
        </p>
      </Card>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-3">
        {steps.map((label, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] transition ${
                active
                  ? 'border-graphite-900 bg-graphite-900 text-white'
                  : completed
                  ? 'border-graphite-300 bg-white text-graphite-500'
                  : 'border-graphite-200 bg-white/60 text-graphite-400'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[0.75rem]">
                {completed ? '✓' : index + 1}
              </span>
              {label}
            </div>
          );
        })}
      </div>
      <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">
        Step {currentStep + 1} of {steps.length}
      </p>
    </div>
  );
}

function ReleaseModeCard({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col gap-3 rounded-2xl border px-5 py-6 text-left transition ${
        active
          ? 'border-graphite-900 bg-graphite-900 text-white'
          : 'border-graphite-200 bg-white text-graphite-700 hover:border-graphite-400'
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}

function FooterActions({
  onBack,
  onNext,
  disableNext,
  nextLabel = 'Continue',
}: {
  onBack?: () => void;
  onNext: () => void;
  disableNext?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" className="rounded-full px-6" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button className="rounded-full px-6" onClick={onNext} disabled={disableNext}>
        {nextLabel}
      </Button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">{label}</p>
      <p className="text-sm font-medium text-graphite-900 dark:text-ivory-50">{value}</p>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
