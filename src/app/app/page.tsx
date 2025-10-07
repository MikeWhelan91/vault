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

  const storageUsedGB = metadata.totalSize / (1024 * 1024 * 1024);
  const storageLimitGB = metadata.storageLimit / (1024 * 1024 * 1024);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;

  const recentItems = metadata.items
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {session.userId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={metadata.items.length.toString()}
          icon="📁"
        />
        <StatCard
          title="Files"
          value={metadata.items.filter((i) => i.type === 'file').length.toString()}
          icon="📄"
        />
        <StatCard
          title="Notes"
          value={metadata.items.filter((i) => i.type === 'note').length.toString()}
          icon="📝"
        />
      </div>

      {/* Storage */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Storage Usage
        </h2>
        <Progress
          value={storagePercentage}
          label={`${storageUsedGB.toFixed(2)} GB / ${storageLimitGB} GB`}
          color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
          size="lg"
        />
        {storagePercentage > 80 && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ You&apos;re running low on storage. Consider upgrading to Pro for 100GB.
          </p>
        )}
      </Card>

      {/* Recent Items */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No items yet. Start by adding your first file or note.
            </p>
            <Link href="/app/items">
              <Button>Add Item</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/app/items/${item.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {item.type === 'file' ? '📄' : '📝'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.size)} • Updated{' '}
                        {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/app/items">
            <Button className="w-full" variant="secondary">
              📁 Add New Item
            </Button>
          </Link>
          <Link href="/app/release">
            <Button className="w-full" variant="secondary">
              ⏰ Create Release Bundle
            </Button>
          </Link>
          <Link href="/app/settings/heartbeat">
            <Button className="w-full" variant="secondary">
              💓 Configure Heartbeat
            </Button>
          </Link>
          <Link href="/app/items">
            <Button className="w-full" variant="secondary">
              🔍 Browse All Items
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
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
