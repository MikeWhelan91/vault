'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminFetch } from '@/hooks/useAdmin';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  tier: string;
  totalSize: number;
  storageLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
  storagePercentage: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
    releaseBundles: number;
  };
  heartbeat: {
    enabled: boolean;
    cadenceDays: number;
    lastHeartbeat: string | null;
    nextHeartbeat: string | null;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminFetch('/api/admin/users');

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized - Admin access required');
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = filterTier === 'all' || user.tier === filterTier;

    return matchesSearch && matchesTier;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card>
          <p className="text-graphite-900">Loading users...</p>
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
            <h1 className="text-xl font-semibold text-graphite-900">User Management</h1>
            <div className="flex gap-3">
              <Link href="/admin">
                <Button variant="secondary" size="sm">Dashboard</Button>
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

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email, name, or ID..."
                className="w-full px-4 py-2 border border-graphite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Filter by Tier
              </label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2 border border-graphite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="plus">Plus</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{filteredUsers.length}</div>
              <div className="text-sm text-graphite-600">Total Users</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredUsers.reduce((sum, u) => sum + u._count.items, 0)}
              </div>
              <div className="text-sm text-graphite-600">Total Items</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {filteredUsers.reduce((sum, u) => sum + u._count.releaseBundles, 0)}
              </div>
              <div className="text-sm text-graphite-600">Total Bundles</div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-graphite-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Tier</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Storage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Bundles</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Heartbeat</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-graphite-100 hover:bg-graphite-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-graphite-900">{user.email}</div>
                        <div className="text-sm text-graphite-600">{user.name || 'No name'}</div>
                        <div className="text-xs text-graphite-500 font-mono">{user.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          user.tier === 'plus'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm text-graphite-900">
                          {user.storageUsedGB.toFixed(2)} / {user.storageLimitGB.toFixed(2)} GB
                        </div>
                        <div className="w-full bg-graphite-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              user.storagePercentage > 90
                                ? 'bg-red-500'
                                : user.storagePercentage > 75
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(user.storagePercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-graphite-500 mt-1">
                          {user.storagePercentage.toFixed(1)}% used
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">{user._count.items}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">{user._count.releaseBundles}</div>
                    </td>
                    <td className="py-3 px-4">
                      {user.heartbeat ? (
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              user.heartbeat.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.heartbeat.enabled ? 'Active' : 'Disabled'}
                          </span>
                          {user.heartbeat.enabled && (
                            <div className="text-xs text-graphite-600 mt-1">
                              Every {user.heartbeat.cadenceDays}d
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-graphite-500">Not configured</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-graphite-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-graphite-600">No users found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
