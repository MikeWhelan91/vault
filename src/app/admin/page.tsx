'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminFetch } from '@/hooks/useAdmin';
import Link from 'next/link';

interface AdminStats {
  users: {
    total: number;
    recentWeek: number;
    byTier: Array<{ tier: string; count: number }>;
  };
  items: {
    total: number;
  };
  bundles: {
    total: number;
    released: number;
    pending: number;
    recentWeek: number;
    byType: Array<{ mode: string; count: number }>;
  };
  heartbeats: {
    total: number;
    active: number;
  };
  trustees: {
    total: number;
  };
  storage: {
    totalUsed: number;
    totalLimit: number;
    usedGB: number;
    limitGB: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminFetch('/api/admin/stats');

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized - Admin access required');
        }
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card>
          <p className="text-graphite-900">Loading admin dashboard...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-graphite-900 mb-4">Access Denied</h1>
            <p className="text-graphite-600 mb-4">{error}</p>
            <Link href="/app">
              <Button>Return to Vault</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-graphite-900">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <Button variant="secondary" size="sm">Users</Button>
              </Link>
              <Link href="/admin/bundles">
                <Button variant="secondary" size="sm">Bundles</Button>
              </Link>
              <Link href="/app">
                <Button variant="secondary" size="sm">Back to Vault</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-graphite-900">System Overview</h2>
          <p className="text-graphite-600">Real-time statistics and metrics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">{stats.users.total}</div>
              <div className="text-sm text-graphite-600">Total Users</div>
              <div className="text-xs text-graphite-500 mt-1">+{stats.users.recentWeek} this week</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.bundles.total}</div>
              <div className="text-sm text-graphite-600">Total Bundles</div>
              <div className="text-xs text-graphite-500 mt-1">+{stats.bundles.recentWeek} this week</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.items.total}</div>
              <div className="text-sm text-graphite-600">Total Items</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.storage.usedGB.toFixed(2)}
              </div>
              <div className="text-sm text-graphite-600">GB Used</div>
              <div className="text-xs text-graphite-500 mt-1">
                / {stats.storage.limitGB.toFixed(2)} GB total
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Users Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-graphite-900 mb-4">Users by Tier</h3>
            <div className="space-y-3">
              {stats.users.byTier.map((tier) => (
                <div key={tier.tier} className="flex items-center justify-between p-3 bg-graphite-50 rounded">
                  <span className="font-medium text-graphite-900 capitalize">{tier.tier}</span>
                  <span className="text-graphite-600">{tier.count} users</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Bundles Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-graphite-900 mb-4">Bundle Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="font-medium text-green-900">Released</span>
                <span className="text-green-700">{stats.bundles.released}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <span className="font-medium text-yellow-900">Pending</span>
                <span className="text-yellow-700">{stats.bundles.pending}</span>
              </div>
            </div>
          </Card>

          {/* Bundle Types */}
          <Card>
            <h3 className="text-lg font-semibold text-graphite-900 mb-4">Bundle Types</h3>
            <div className="space-y-3">
              {stats.bundles.byType.map((type) => (
                <div key={type.mode} className="flex items-center justify-between p-3 bg-graphite-50 rounded">
                  <span className="font-medium text-graphite-900 capitalize">{type.mode.replace('-', ' ')}</span>
                  <span className="text-graphite-600">{type.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Heartbeats */}
          <Card>
            <h3 className="text-lg font-semibold text-graphite-900 mb-4">Heartbeats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-graphite-50 rounded">
                <span className="font-medium text-graphite-900">Total</span>
                <span className="text-graphite-600">{stats.heartbeats.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="font-medium text-green-900">Active</span>
                <span className="text-green-700">{stats.heartbeats.active}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{stats.trustees.total}</div>
              <div className="text-sm text-graphite-600">Total Trustees</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {((stats.storage.usedGB / stats.storage.limitGB) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-graphite-600">Storage Utilization</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {(stats.items.total / Math.max(stats.users.total, 1)).toFixed(1)}
              </div>
              <div className="text-sm text-graphite-600">Avg Items per User</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
