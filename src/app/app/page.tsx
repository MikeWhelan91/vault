'use client';

import React from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';

export default function DashboardPage() {
  const { metadata, session } = useCrypto();

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const storageUsedMB = metadata.totalSize / (1024 * 1024);
  const storageLimitMB = metadata.storageLimit / (1024 * 1024);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;

  const recentItems = metadata.items
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-graphite-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-graphite-600 mt-2 text-sm">
          Welcome back, {session.userId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={metadata.items.length.toString()}
        />
        <StatCard
          title="Files"
          value={metadata.items.filter((i) => i.type === 'file').length.toString()}
        />
        <StatCard
          title="Notes"
          value={metadata.items.filter((i) => i.type === 'note').length.toString()}
        />
      </div>

      {/* Storage */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-graphite-900">
            Storage Usage
          </h2>
          {metadata.tier === 'free' && (
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-primary-600">
                Upgrade to Plus
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {/* Storage Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-graphite-700">
                {metadata.tier === 'free' ? 'Free Tier (300 MB)' : 'Plus Tier (2 GB)'}
              </span>
              <span className="text-sm text-graphite-600">
                {storageUsedMB.toFixed(1)} MB / {storageLimitMB.toFixed(0)} MB
              </span>
            </div>
            <Progress
              value={storagePercentage}
              color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
              size="md"
            />
          </div>

          {/* Tier-specific message */}
          {metadata.tier === 'free' && (
            <p className="text-sm text-graphite-600">
              Upload any file type • Unlimited items within storage limit
            </p>
          )}

          {metadata.tier === 'plus' && (
            <p className="text-sm text-graphite-600">
              2 GB storage • Unlimited items • All file types supported
            </p>
          )}

          {/* Warning message */}
          {metadata.tier === 'free' && storagePercentage > 80 && (
            <div className="pt-2 border-t border-graphite-200">
              <p className="text-sm text-red-600">
                You&apos;re approaching your storage limit. <Link href="/pricing" className="underline font-medium">Upgrade to Plus</Link> for 2GB storage.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Items */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-graphite-900">
            Recent Items
          </h2>
          <Link href="/app/items">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-graphite-500 mb-4 text-sm">
              No items yet. Start by adding your first file or note.
            </p>
            <Link href="/app/items">
              <Button>Add Item</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/app/items/${item.id}`}>
                <div className="flex items-center justify-between rounded-lg border border-transparent p-4 transition-all duration-200 cursor-pointer hover:border-graphite-200 hover:bg-graphite-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {item.type === 'file' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-graphite-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-graphite-500">
                        {formatFileSize(item.size)} • Updated{' '}
                        {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-graphite-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-medium text-graphite-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/app/items">
            <Button className="w-full" variant="secondary">
              Add New Item
            </Button>
          </Link>
          <Link href="/app/release">
            <Button className="w-full" variant="secondary">
              Create Release Bundle
            </Button>
          </Link>
          <Link href="/app/settings/heartbeat">
            <Button className="w-full" variant="secondary">
              Configure Heartbeat
            </Button>
          </Link>
          <Link href="/app/items">
            <Button className="w-full" variant="secondary">
              Browse All Items
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <div>
        <p className="text-sm text-graphite-600 mb-1">{title}</p>
        <p className="text-3xl font-light text-graphite-900">{value}</p>
      </div>
    </Card>
  );
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
