'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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

export default function BundlesPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900">
            Your Release Bundles
          </h1>
          <p className="text-sm sm:text-base text-graphite-600 mt-1">
            Manage your scheduled memory releases
          </p>
        </div>
        <Link href="/app/release" className="sm:flex-shrink-0">
          <Button className="w-full sm:w-auto">+ Create New Bundle</Button>
        </Link>
      </div>

      {/* Bundles List */}
      {bundles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">📦</span>
            <h2 className="text-xl font-semibold text-graphite-900 mb-2">
              No Release Bundles Yet
            </h2>
            <p className="text-graphite-600 mb-6">
              Create your first bundle to share memories with loved ones
            </p>
            <Link href="/app/release">
              <Button>Create Your First Bundle</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bundles.map((bundle) => {
            const isExpanded = expandedBundleId === bundle.id;

            return (
              <Card key={bundle.id}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-graphite-900">
                        {bundle.name}
                      </h3>
                      {bundle.released && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded whitespace-nowrap">
                          Released
                        </span>
                      )}
                      {!bundle.released && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded whitespace-nowrap">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      {/* Release Mode Info */}
                      <div className="flex items-center gap-2 text-graphite-600">
                        <span className="flex-shrink-0">
                          {bundle.mode === 'time-lock' ? '⏰' : '💓'}
                        </span>
                        <span className="break-words">
                          {bundle.mode === 'time-lock'
                            ? `Releases on ${new Date(bundle.releaseDate!).toLocaleDateString()}`
                            : `Heartbeat mode (${bundle.heartbeatCadenceDays} days)`
                          }
                        </span>
                      </div>

                      {/* Items Count */}
                      <div className="text-graphite-600">
                        📄 {bundle.items.length} {bundle.items.length === 1 ? 'item' : 'items'}
                      </div>

                      {/* Trustees */}
                      <div className="text-graphite-600">
                        <span className="flex-shrink-0">👥 {bundle.trustees.length} {bundle.trustees.length === 1 ? 'trustee' : 'trustees'}</span>
                        {!isExpanded && bundle.trustees.length > 0 && bundle.trustees.length <= 3 && (
                          <span className="ml-2 break-words">
                            ({bundle.trustees.map(t => t.name || t.email).join(', ')})
                          </span>
                        )}
                      </div>

                      {/* Created Date */}
                      <div className="text-graphite-500 text-xs">
                        Created {new Date(bundle.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => setExpandedBundleId(isExpanded ? null : bundle.id)}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-graphite-200 space-y-4">
                    {/* All Trustees */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Trustees:
                      </h4>
                      <div className="space-y-2">
                        {bundle.trustees.map((trustee) => (
                          <div key={trustee.id} className="flex items-center gap-2 text-sm text-graphite-700">
                            <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                              {(trustee.name || trustee.email).charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <span className="font-medium">{trustee.name || trustee.email}</span>
                              {trustee.name && (
                                <span className="text-graphite-500 text-xs ml-2">{trustee.email}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items List */}
                    {bundle.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Included Items:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {bundle.items.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-graphite-100 text-graphite-700 text-xs rounded"
                            >
                              {item.type === 'file' ? '📄' : '📝'}
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
