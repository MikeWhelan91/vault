'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import type { ReleaseBundle } from '@/types';

export default function DashboardClient() {
  const { metadata, session } = useCrypto();
  const [releaseBundles, setReleaseBundles] = useState<ReleaseBundle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem('release_bundles');
      if (stored) {
        const parsed = JSON.parse(stored) as ReleaseBundle[];
        setReleaseBundles(parsed);
      }
    } catch (error) {
      console.error('Failed to load release bundles from storage', error);
    }
  }, []);

  const recentItems = useMemo(() => {
    const source = metadata?.items ?? [];
    return [...source]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [metadata]);

  const nextRelease = useMemo(() => {
    if (releaseBundles.length === 0) return undefined;

    return [...releaseBundles]
      .sort((a, b) => {
        const aDate = getBundleSortDate(a);
        const bDate = getBundleSortDate(b);
        return aDate.getTime() - bDate.getTime();
      })
      .find(Boolean);
  }, [releaseBundles]);

  const totalTrustees = useMemo(() => {
    const map = new Map<string, string>();
    releaseBundles.forEach((bundle) => {
      bundle.trustees.forEach((trustee) => {
        map.set(trustee.email.toLowerCase(), trustee.name || trustee.email);
      });
    });
    return map.size;
  }, [releaseBundles]);

  if (!metadata) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-graphite-500">
        Preparing your vault...
      </div>
    );
  }

  const storageUsedGB = metadata.totalSize / (1024 * 1024 * 1024);
  const storageLimitGB = metadata.storageLimit / (1024 * 1024 * 1024);
  const storagePercentage = metadata.storageLimit === 0 ? 0 : (metadata.totalSize / metadata.storageLimit) * 100;

  const activeBundles = releaseBundles.length;
  const heartbeatBundles = releaseBundles.filter((bundle) => bundle.mode === 'heartbeat').length;

  return (
    <div className="space-y-12">
      <section className="gradient-panel relative overflow-hidden p-10">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-graphite-500 dark:border-graphite-600 dark:bg-graphite-900/70 dark:text-graphite-200">
              Encrypted workspace
            </span>
            <h1 className="text-4xl font-light tracking-tight text-graphite-900 dark:text-ivory-50">
              Good to see you, {session.userId || metadata.userId}.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-graphite-600 dark:text-graphite-300">
              Keep your organisation&apos;s most sensitive notes, credentials, and protocols organised. Everything you add here stays encrypted until the exact moment you choose to release it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app/items">
                <Button size="lg" className="rounded-full px-6">Add to vault</Button>
              </Link>
              <Link href="/app/release">
                <Button variant="secondary" size="lg" className="rounded-full px-6">
                  Plan a release
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="placeholder-box h-40 w-full border border-graphite-200/60 dark:border-graphite-700/60" aria-hidden />
            <Card className="relative overflow-hidden border-0 bg-white/80 p-6 shadow-none dark:bg-graphite-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-graphite-400">Vault health</p>
                  <p className="mt-2 text-2xl font-light text-graphite-900 dark:text-ivory-50">{metadata.items.length} items secured</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-graphite-500">Storage used</p>
                  <p className="text-lg font-semibold text-graphite-900 dark:text-ivory-50">
                    {storageUsedGB.toFixed(2)} GB
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Progress
                  value={storagePercentage}
                  label={`${storageUsedGB.toFixed(2)} GB / ${storageLimitGB} GB`}
                  color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
                  size="lg"
                />
              </div>
              {storagePercentage > 80 && (
                <p className="mt-3 text-sm text-red-600">
                  You&apos;re close to the current limit. Consider upgrading to expand your encrypted archive.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Encrypted items" value={metadata.items.length.toString()} trend="Updated live" />
        <SummaryTile label="Release bundles" value={activeBundles.toString()} trend={activeBundles ? `${heartbeatBundles} heartbeat` : 'Draft your first'} />
        <SummaryTile label="Trusted recipients" value={totalTrustees.toString()} trend={totalTrustees ? 'Actively monitored' : 'Add trustees'} />
        <SummaryTile label="Storage remaining" value={`${Math.max(storageLimitGB - storageUsedGB, 0).toFixed(2)} GB`} trend="Auto-encrypted" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium text-graphite-900 dark:text-ivory-50">Recent activity</h2>
              <p className="text-sm text-graphite-500 dark:text-graphite-300">A rolling view of what changed inside the vault</p>
            </div>
            <Link href="/app/items">
              <Button variant="ghost" size="sm" className="rounded-full px-4">
                View all items
              </Button>
            </Link>
          </header>

          {recentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-graphite-200/70 bg-white/60 px-6 py-16 text-center dark:border-graphite-700/70 dark:bg-graphite-900/40">
              <span className="placeholder-box h-20 w-20 border border-graphite-200/50 dark:border-graphite-700/50" aria-hidden />
              <p className="text-base font-medium text-graphite-800 dark:text-ivory-50">Your vault is ready for its first entry</p>
              <p className="max-w-sm text-sm text-graphite-500 dark:text-graphite-300">
                Upload encrypted files or compose notes. Each item stays client-side encrypted until released.
              </p>
              <Link href="/app/items">
                <Button size="sm" className="rounded-full px-5">
                  Create an item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <Link key={item.id} href={`/app/items/${item.id}`} className="block">
                  <Card hover className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-graphite-900 text-ivory-50 text-lg font-semibold dark:bg-ivory-100 dark:text-graphite-900">
                        {item.type === 'file' ? '📄' : '📝'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-graphite-900 dark:text-ivory-50">{item.name}</p>
                        <p className="text-xs text-graphite-500 dark:text-graphite-300">
                          {formatFileSize(item.size)} • {item.type === 'file' ? 'File' : 'Note'} • Updated {formatDate(item.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg text-graphite-300">→</span>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-medium text-graphite-900 dark:text-ivory-50">Upcoming release</h2>
                <p className="text-sm text-graphite-500 dark:text-graphite-300">
                  Automate when and how encrypted packages unlock for trustees.
                </p>
              </div>
              <Link href="/app/release">
                <Button variant="ghost" size="sm" className="rounded-full px-4">
                  Manage
                </Button>
              </Link>
            </div>

            {nextRelease ? (
              <div className="space-y-3 rounded-2xl border border-graphite-200/60 bg-white/70 p-4 dark:border-graphite-700/60 dark:bg-graphite-900/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-graphite-800 dark:text-ivory-50">{nextRelease.name}</p>
                  <span className="rounded-full bg-graphite-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ivory-50 dark:bg-ivory-50 dark:text-graphite-900">
                    {nextRelease.mode === 'time-lock' ? 'Scheduled' : 'Heartbeat'}
                  </span>
                </div>
                <p className="text-xs text-graphite-500 dark:text-graphite-300">
                  {describeBundle(nextRelease)}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-graphite-400 dark:text-graphite-300">
                  <span>{nextRelease.items.length} items secured</span>
                  <span>•</span>
                  <span>{nextRelease.trustees.length} trustees</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-dashed border-graphite-200/70 bg-white/60 px-5 py-10 text-center dark:border-graphite-700/70 dark:bg-graphite-900/40">
                <p className="text-base font-medium text-graphite-800 dark:text-ivory-50">No automated releases yet</p>
                <p className="text-sm text-graphite-500 dark:text-graphite-300">
                  Design a release playbook to ensure the right people gain access at the right time.
                </p>
                <Link href="/app/release">
                  <Button size="sm" className="rounded-full px-5">
                    Create bundle
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-medium text-graphite-900 dark:text-ivory-50">Quick actions</h2>
            <div className="grid gap-3">
              <QuickAction href="/app/items" label="Upload encrypted file" description="Wrap new documents in client-side encryption." />
              <QuickAction href="/app/items" label="Compose secure note" description="Draft protocols, runbooks, or credentials for trusted teams." />
              <QuickAction href="/app/settings/heartbeat" label="Tune heartbeat cadence" description="Define how often you need to check in before releases fire." />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <Card className="space-y-2 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">{label}</p>
      <p className="text-3xl font-light text-graphite-900 dark:text-ivory-50">{value}</p>
      <p className="text-xs text-graphite-500 dark:text-graphite-300">{trend}</p>
    </Card>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href} className="block">
      <Card hover className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-semibold text-graphite-900 dark:text-ivory-50">{label}</p>
          <p className="text-xs text-graphite-500 dark:text-graphite-300">{description}</p>
        </div>
        <span className="text-lg text-graphite-300">→</span>
      </Card>
    </Link>
  );
}

function getBundleSortDate(bundle: ReleaseBundle): Date {
  if (bundle.mode === 'time-lock' && bundle.releaseDate) {
    return new Date(bundle.releaseDate);
  }

  if (bundle.mode === 'heartbeat' && bundle.lastHeartbeat) {
    return new Date(bundle.lastHeartbeat);
  }

  return new Date(bundle.createdAt);
}

function describeBundle(bundle: ReleaseBundle): string {
  if (bundle.mode === 'time-lock' && bundle.releaseDate) {
    return `Unlocks on ${new Date(bundle.releaseDate).toLocaleString()}`;
  }

  if (bundle.mode === 'heartbeat' && bundle.heartbeatCadence) {
    return `Heartbeat window: every ${bundle.heartbeatCadence} days`;
  }

  return `Created ${new Date(bundle.createdAt).toLocaleDateString()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
