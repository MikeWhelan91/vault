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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-graphite-900">
            Your Release Bundles
          </h1>
          <p className="text-graphite-600 mt-1">
            Manage your scheduled memory releases
          </p>
        </div>
        <Link href="/app/release">
          <Button>+ Create New Bundle</Button>
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
          {bundles.map((bundle) => (
            <Card key={bundle.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-graphite-900">
                      {bundle.name}
                    </h3>
                    {bundle.released && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Released
                      </span>
                    )}
                    {!bundle.released && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {/* Release Mode Info */}
                    <div className="flex items-center gap-2 text-graphite-600">
                      <span>
                        {bundle.mode === 'time-lock' ? '⏰' : '💓'}
                      </span>
                      <span>
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
                      👥 {bundle.trustees.length} {bundle.trustees.length === 1 ? 'trustee' : 'trustees'}
                      {bundle.trustees.length > 0 && (
                        <span className="ml-2">
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
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>

              {/* Items List (Collapsed) */}
              {bundle.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-graphite-200">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
