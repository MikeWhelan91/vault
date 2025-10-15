'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminFetch } from '@/hooks/useAdmin';
import Link from 'next/link';

interface Bundle {
  id: string;
  name: string;
  mode: string;
  released: boolean;
  releaseDate: string | null;
  releaseToken: string | null;
  firstAccessedAt: string | null;
  heartbeatCadenceDays: number | null;
  lastHeartbeat: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  _count: {
    bundleItems: number;
    trustees: number;
  };
  expirationStatus: string;
  expiresAt: string | null;
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setIsLoading(true);
      const response = await adminFetch('/api/admin/bundles');

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized - Admin access required');
        }
        throw new Error('Failed to fetch bundles');
      }

      const data = await response.json();
      setBundles(data.bundles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundles');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch =
      bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = filterMode === 'all' || bundle.mode === filterMode;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'released' && bundle.released) ||
      (filterStatus === 'pending' && !bundle.released) ||
      (filterStatus === 'expired' && bundle.expirationStatus === 'expired');

    return matchesSearch && matchesMode && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card>
          <p className="text-graphite-900">Loading bundles...</p>
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

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-graphite-900">Bundle Management</h1>
            <div className="flex gap-3">
              <Link href="/admin">
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="secondary" size="sm">Users</Button>
              </Link>
              <Link href="/app">
                <Button variant="secondary" size="sm">Back to Vault</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Search Bundles
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, owner email, or ID..."
                className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Filter by Mode
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="px-4 py-2 border border-graphite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Modes</option>
                <option value="time-lock">Time Lock</option>
                <option value="heartbeat">Heartbeat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-graphite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="released">Released</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{filteredBundles.length}</div>
              <div className="text-sm text-graphite-600">Total Bundles</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredBundles.filter((b) => b.released).length}
              </div>
              <div className="text-sm text-graphite-600">Released</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {filteredBundles.filter((b) => !b.released).length}
              </div>
              <div className="text-sm text-graphite-600">Pending</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {filteredBundles.filter((b) => b.expirationStatus === 'expired').length}
              </div>
              <div className="text-sm text-graphite-600">Expired</div>
            </div>
          </Card>
        </div>

        {/* Bundles Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-graphite-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Bundle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Mode</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Trustees</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Release Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredBundles.map((bundle) => (
                  <tr key={bundle.id} className="border-b border-graphite-100 hover:bg-graphite-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-graphite-900">{bundle.name}</div>
                        <div className="text-xs text-graphite-500 font-mono">{bundle.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm text-graphite-900">{bundle.user.email}</div>
                        <div className="text-xs text-graphite-600">{bundle.user.name || 'No name'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          bundle.mode === 'time-lock'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {bundle.mode === 'time-lock' ? 'Time Lock' : 'Heartbeat'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {bundle.expirationStatus === 'expired' ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : bundle.released ? (
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                            Released
                          </span>
                          {bundle.firstAccessedAt && (
                            <div className="text-xs text-graphite-600 mt-1">
                              Accessed {new Date(bundle.firstAccessedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">{bundle._count.bundleItems}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">{bundle._count.trustees}</div>
                    </td>
                    <td className="py-3 px-4">
                      {bundle.mode === 'time-lock' && bundle.releaseDate ? (
                        <div className="text-sm text-graphite-900">
                          {new Date(bundle.releaseDate).toLocaleString()}
                        </div>
                      ) : bundle.mode === 'heartbeat' ? (
                        <div>
                          <div className="text-sm text-graphite-900">
                            {bundle.heartbeatCadenceDays}d cadence
                          </div>
                          {bundle.lastHeartbeat && (
                            <div className="text-xs text-graphite-600">
                              Last: {new Date(bundle.lastHeartbeat).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-graphite-500">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">
                        {new Date(bundle.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBundles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-graphite-600">No bundles found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
