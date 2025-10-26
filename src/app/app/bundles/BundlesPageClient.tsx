'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Calendar, Heart, Package, Users, Clock, FileText, ShieldCheck, ArrowRight, StickyNote, Pause, Play } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

interface Bundle {
  id: string;
  name: string;
  mode: 'time-lock' | 'heartbeat';
  releaseDate?: string;
  heartbeatCadenceDays?: number;
  heartbeatPaused?: boolean;
  heartbeatPausedAt?: string;
  released: boolean;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    type: 'file' | 'note';
  }>;
  trustees: Array<{
    id: string;
    email: string;
    name?: string;
  }>;
}

export default function BundlesPageClient() {
  const { session } = useCrypto();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBundleId, setExpandedBundleId] = useState<string | null>(null);
  const [pausingBundleId, setPausingBundleId] = useState<string | null>(null);

  const fetchBundles = async () => {
    if (!session.dbUserId) return;

    try {
      const response = await fetch(`/api/bundles?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles || []);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, [session.dbUserId]);

  const handlePauseBundle = async (bundleId: string) => {
    setPausingBundleId(bundleId);
    try {
      const response = await fetch(`/api/bundles/${bundleId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (response.ok) {
        await fetchBundles();
      } else {
        console.error('Failed to pause bundle');
      }
    } catch (error) {
      console.error('Error pausing bundle:', error);
    } finally {
      setPausingBundleId(null);
    }
  };

  const handleResumeBundle = async (bundleId: string) => {
    setPausingBundleId(bundleId);
    try {
      const response = await fetch(`/api/bundles/${bundleId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (response.ok) {
        await fetchBundles();
      } else {
        console.error('Failed to resume bundle');
      }
    } catch (error) {
      console.error('Error resuming bundle:', error);
    } finally {
      setPausingBundleId(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <MobilePageHeader
        title="My Bundles"
        subtitle="Coordinate trustees, confirm delivery timelines, and keep every bundle ready to unlock at the right moment."
        icon={Package}
        iconColor="text-emerald-600"
        actions={
          <>
            <Link href="/app/release">
              <Button size="sm">
                Create new bundle
              </Button>
            </Link>
            <Link href="/app/support">
              <Button variant="secondary" size="sm">
                Talk to support
              </Button>
            </Link>
          </>
        }
      />

      {/* Bundles List */}
      {bundles.length === 0 ? (
        <Card className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-champagne-200 bg-champagne-50 text-primary-600">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="font-display text-xl font-semibold text-plum-900">No Release Bundles Yet</h2>
            <p className="mt-2 max-w-sm text-sm text-plum-600">
              Create your first bundle to choreograph how and when encrypted memories unlock for the people you trust most.
            </p>
            <Link href="/app/release" className="mt-6">
              <Button size="lg">Create your first bundle</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {bundles.map((bundle) => {
            const isExpanded = expandedBundleId === bundle.id;
            const isTimeLock = bundle.mode === 'time-lock';
            const releaseDate = isTimeLock && bundle.releaseDate ? new Date(bundle.releaseDate) : null;

            return (
              <Card key={bundle.id} className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-1 gap-3 sm:gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isTimeLock ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isTimeLock ? <Calendar className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-base font-semibold text-plum-900 sm:text-lg">{bundle.name}</h3>
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${bundle.released ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {bundle.released ? 'Released' : 'In progress'}
                        </span>
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${isTimeLock ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                          {isTimeLock ? 'Time-lock' : 'Heartbeat'}
                        </span>
                      </div>
                      <div className="grid gap-3 text-sm text-plum-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-plum-500" />
                          {bundle.trustees.length} {bundle.trustees.length === 1 ? 'trustee' : 'trustees'}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-plum-500" />
                          {bundle.items.length} {bundle.items.length === 1 ? 'item' : 'items'}
                        </div>
                        {isTimeLock && releaseDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Releases on {releaseDate.toLocaleDateString()}
                          </div>
                        )}
                        {!isTimeLock && bundle.heartbeatCadenceDays && (
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-rose-500" />
                            Check-in every {bundle.heartbeatCadenceDays} days
                            {bundle.heartbeatPaused && (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Paused
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-plum-400" />
                          Created {new Date(bundle.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    {!isTimeLock && !bundle.released && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => bundle.heartbeatPaused ? handleResumeBundle(bundle.id) : handlePauseBundle(bundle.id)}
                        disabled={pausingBundleId === bundle.id}
                        className="flex items-center gap-1.5"
                      >
                        {bundle.heartbeatPaused ? (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Pause</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs whitespace-nowrap sm:text-sm"
                      onClick={() => setExpandedBundleId(isExpanded ? null : bundle.id)}
                    >
                      {isExpanded ? 'Hide' : 'View'} details
                    </Button>
                    <Link href={`/app/bundles/${bundle.id}/edit`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                        Edit
                        <ArrowRight className="h-4 w-4 hidden sm:inline-block" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-5 border-t border-champagne-100 pt-5">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-plum-800">Trustees</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {bundle.trustees.map((trustee) => (
                          <div key={trustee.id} className="flex items-center gap-3 rounded-2xl border border-champagne-100 bg-champagne-50/80 px-3 py-2 text-sm text-plum-700">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                              {(trustee.name || trustee.email).charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="break-words font-medium text-plum-900">{trustee.name || trustee.email}</p>
                              <p className="break-all text-xs text-plum-500">{trustee.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {bundle.items.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-plum-800">Included Items</h4>
                        <div className="flex flex-wrap gap-2">
                          {bundle.items.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-2 rounded-full border border-champagne-200 bg-white px-3 py-1 text-xs text-plum-600"
                            >
                              {item.type === 'file' ? <FileText className="h-3.5 w-3.5" /> : <StickyNote className="h-3.5 w-3.5" />}
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
