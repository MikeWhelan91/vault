'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Calendar, Heart, Package, Users, Clock, FileText, ShieldCheck, ArrowRight, StickyNote } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  mode: 'time-lock' | 'heartbeat';
  releaseDate?: string;
  heartbeatCadenceDays?: number;
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

  useEffect(() => {
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

    fetchBundles();
  }, [session.dbUserId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <Package className="h-4 w-4" />
              Release orchestration
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-graphite-900">Your release bundles</h1>
              <p className="mt-2 text-sm text-graphite-600">
                Coordinate trustees, confirm delivery timelines, and keep every bundle ready to unlock at the right moment.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/app/release" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" size="lg">
                Create new bundle
              </Button>
            </Link>
            <Link href="/app/support" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto" size="lg">
                Talk to support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bundles List */}
      {bundles.length === 0 ? (
        <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-graphite-200 bg-graphite-50 text-primary-600">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-graphite-900">No release bundles yet</h2>
            <p className="mt-2 max-w-sm text-sm text-graphite-600">
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
              <Card key={bundle.id} className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-1 gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isTimeLock ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isTimeLock ? <Calendar className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-graphite-900">{bundle.name}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bundle.released ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {bundle.released ? 'Released' : 'In progress'}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isTimeLock ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                          {isTimeLock ? 'Time-lock' : 'Heartbeat'}
                        </span>
                      </div>
                      <div className="grid gap-3 text-sm text-graphite-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-graphite-500" />
                          {bundle.trustees.length} {bundle.trustees.length === 1 ? 'trustee' : 'trustees'}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-graphite-500" />
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
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-graphite-400" />
                          Created {new Date(bundle.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => setExpandedBundleId(isExpanded ? null : bundle.id)}
                    >
                      {isExpanded ? 'Hide details' : 'View details'}
                    </Button>
                    <Link href="/app/release" className="hidden sm:inline-flex">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                        Manage
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-5 border-t border-graphite-100 pt-5">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-graphite-800">Trustees</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {bundle.trustees.map((trustee) => (
                          <div key={trustee.id} className="flex items-center gap-3 rounded-2xl border border-graphite-100 bg-graphite-50/80 px-3 py-2 text-sm text-graphite-700">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                              {(trustee.name || trustee.email).charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-graphite-900">{trustee.name || trustee.email}</p>
                              <p className="truncate text-xs text-graphite-500">{trustee.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {bundle.items.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-graphite-800">Included items</h4>
                        <div className="flex flex-wrap gap-2">
                          {bundle.items.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-white px-3 py-1 text-xs text-graphite-600"
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
