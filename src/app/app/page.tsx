'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import {
  Upload,
  Package,
  Users,
  Calendar,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  ArrowRight,
  Crown
} from 'lucide-react';
import { getFileTypeInfo } from '@/lib/file-types';
import { getTierLimits, type TierName } from '@/lib/pricing';

export default function DashboardPage() {
  const { metadata, session } = useCrypto();
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoadingBundles, setIsLoadingBundles] = useState(true);

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
        console.error('Error fetching bundles:', error);
      } finally {
        setIsLoadingBundles(false);
      }
    };

    fetchBundles();
  }, [session.dbUserId]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';
  const tierLimits = getTierLimits(tier);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;
  const activeBundles = bundles.filter(b => !b.released);
  const releasedBundles = bundles.filter(b => b.released);

  // Categorize items by type for storage breakdown
  const itemsByType = {
    images: metadata.items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'image';
    }),
    videos: metadata.items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'video';
    }),
    audio: metadata.items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'audio';
    }),
    documents: metadata.items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'text' || fileInfo.category === 'pdf';
    }),
    notes: metadata.items.filter(item => item.type === 'note'),
    other: metadata.items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'other';
    }),
  };

  const freeSpace = Math.max(0, metadata.storageLimit - metadata.totalSize);

  const storageByType = [
    {
      name: 'Images',
      value: itemsByType.images.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.images.length,
      color: '#d84531'
    },
    {
      name: 'Videos',
      value: itemsByType.videos.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.videos.length,
      color: '#f28383'
    },
    {
      name: 'Audio',
      value: itemsByType.audio.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.audio.length,
      color: '#fe4242'
    },
    {
      name: 'Documents',
      value: itemsByType.documents.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.documents.length,
      color: '#fb923c'
    },
    {
      name: 'Notes',
      value: itemsByType.notes.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.notes.length,
      color: '#fbbf24'
    },
    {
      name: 'Other',
      value: itemsByType.other.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.other.length,
      color: '#94a3b8'
    },
  ].filter(item => item.value > 0);

  // Add free space to the chart
  const storageDataWithFree = [
    ...storageByType,
    {
      name: 'Free Space',
      value: freeSpace,
      count: null,
      color: '#e5e7eb'
    }
  ];

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const recentItems = metadata.items
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {metadata.userName ? `Welcome back, ${metadata.userName}!` : 'Welcome back!'}
            </h1>
            <p className="text-primary-50 text-lg">{session.userId}</p>
          </div>
          <div className="flex items-center gap-4">
            {tier === 'free' && (
              <Link href="/app/pricing">
                <Button variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
                  Upgrade to Plus
                </Button>
              </Link>
            )}
            {tier === 'plus' && (
              <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Plus Member</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Upload className="w-5 h-5" />}
          label="Total Items"
          value={metadata.items.length.toString()}
          subtext="files & notes"
          color="bg-blue-500"
        />
        <MetricCard
          icon={<Package className="w-5 h-5" />}
          label="Active Bundles"
          value={activeBundles.length.toString()}
          subtext={tierLimits.bundles.max ? `of ${tierLimits.bundles.max}` : 'unlimited'}
          color="bg-green-500"
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Released"
          value={releasedBundles.length.toString()}
          subtext="bundles sent"
          color="bg-purple-500"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Storage Used"
          value={`${storagePercentage.toFixed(0)}%`}
          subtext={formatBytes(metadata.totalSize)}
          color={storagePercentage > 80 ? 'bg-red-500' : 'bg-orange-500'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Breakdown */}
          <Card>
            <h2 className="text-xl font-semibold text-graphite-900 mb-4">Storage Breakdown</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                {metadata.items.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={storageByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {storageByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatBytes(value)}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-3 rounded-full bg-graphite-100 flex items-center justify-center">
                        <Upload className="w-12 h-12 text-graphite-400" />
                      </div>
                      <p className="text-sm text-graphite-500">No items yet</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {storageByType.length > 0 ? (
                  <>
                    {storageByType.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-graphite-700">{item.name}</span>
                          <span className="text-graphite-400">({item.count})</span>
                        </div>
                        <span className="text-graphite-900 font-medium">
                          {formatBytes(item.value)}
                        </span>
                      </div>
                    ))}
                    {/* Free Space */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-graphite-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-graphite-200" />
                        <span className="text-graphite-700">Free Space</span>
                      </div>
                      <span className="text-graphite-900 font-medium">
                        {formatBytes(freeSpace)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-graphite-200" />
                      <span className="text-graphite-700">Free Space</span>
                    </div>
                    <span className="text-graphite-900 font-medium">
                      {formatBytes(freeSpace)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Storage Progress */}
            <div className="mt-6 pt-6 border-t border-graphite-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-graphite-700">
                  {tierLimits.displayName} Tier Storage
                </span>
                <span className="text-sm text-graphite-600">
                  {formatBytes(metadata.totalSize)} / {tierLimits.storage.display}
                </span>
              </div>
              <Progress
                value={storagePercentage}
                color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
                size="lg"
              />
              {tier === 'free' && storagePercentage > 70 && (
                <p className="text-sm text-orange-600 mt-2">
                  You're using {storagePercentage.toFixed(0)}% of your storage.
                  <Link href="/app/pricing" className="font-medium underline ml-1">
                    Upgrade to Plus
                  </Link> for 5 GB.
                </p>
              )}
            </div>
          </Card>

          {/* Active Bundles */}
          <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50/30 to-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-graphite-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary-600" />
                  Active Release Bundles
                </h2>
                <p className="text-sm text-graphite-600 mt-1">
                  {activeBundles.length === 0 ? 'Get started by creating your first bundle' : `Managing ${activeBundles.length} active ${activeBundles.length === 1 ? 'bundle' : 'bundles'}`}
                </p>
              </div>
              <Link href="/app/release">
                <Button className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Create New
                </Button>
              </Link>
            </div>

            {isLoadingBundles ? (
              <p className="text-graphite-500 text-center py-12">Loading bundles...</p>
            ) : activeBundles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-graphite-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-graphite-900 mb-2">No active bundles yet</h3>
                <p className="text-graphite-600 mb-6 max-w-sm mx-auto">
                  Create a release bundle to share your memories with loved ones when the time comes
                </p>
                <Link href="/app/release">
                  <Button size="lg" className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Create Your First Bundle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBundles.map((bundle) => {
                  const isTimeLock = bundle.mode === 'time-lock';
                  const releaseDate = isTimeLock && bundle.releaseDate ? new Date(bundle.releaseDate) : null;
                  const now = new Date();
                  const daysUntilRelease = releaseDate ? Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <div
                      key={bundle.id}
                      className="bg-white border-2 border-graphite-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-lg transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isTimeLock
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                            : 'bg-gradient-to-br from-red-100 to-red-200'
                        }`}>
                          {isTimeLock ? (
                            <Calendar className="w-7 h-7 text-blue-600" />
                          ) : (
                            <Heart className="w-7 h-7 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold text-graphite-900 truncate">
                              {bundle.name}
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              isTimeLock
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}>
                              {isTimeLock ? 'TIME-LOCK' : 'HEARTBEAT'}
                            </div>
                          </div>
                          <p className="text-sm text-graphite-500">
                            Created {formatDistanceToNow(new Date(bundle.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-graphite-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-graphite-600" />
                            <span className="text-xs font-medium text-graphite-600">Trustees</span>
                          </div>
                          <p className="text-xl font-bold text-graphite-900">
                            {bundle.trustees?.length || 0}
                          </p>
                        </div>
                        <div className="bg-graphite-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-graphite-600" />
                            <span className="text-xs font-medium text-graphite-600">Items</span>
                          </div>
                          <p className="text-xl font-bold text-graphite-900">
                            {bundle.items?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Release Info */}
                      {isTimeLock && releaseDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-700" />
                            <span className="text-sm font-semibold text-blue-900">Scheduled Release</span>
                          </div>
                          <p className="text-sm text-blue-800 mb-2">
                            {releaseDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {daysUntilRelease !== null && (
                            <p className="text-xs font-medium text-blue-700">
                              {daysUntilRelease > 0
                                ? `${daysUntilRelease} ${daysUntilRelease === 1 ? 'day' : 'days'} remaining`
                                : 'Releasing soon'}
                            </p>
                          )}
                        </div>
                      )}

                      {!isTimeLock && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-red-700" />
                            <span className="text-sm font-semibold text-red-900">Heartbeat Monitoring</span>
                          </div>
                          <p className="text-sm text-red-800">
                            Will release if you miss your check-in deadline
                          </p>
                          {bundle.heartbeatCadenceDays && (
                            <p className="text-xs font-medium text-red-700 mt-1">
                              Check-in every {bundle.heartbeatCadenceDays} days
                            </p>
                          )}
                        </div>
                      )}

                      {/* View Button */}
                      <div className="mt-4 pt-4 border-t border-graphite-200">
                        <Link href="/app/release">
                          <Button variant="ghost" className="w-full justify-between group">
                            <span>Manage Bundles</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          {recentItems.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-graphite-900">Recent Activity</h2>
                <Link href="/app/items">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <Link key={item.id} href={`/app/items/${item.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-graphite-50 transition-colors">
                      {getItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-graphite-900 truncate">{item.name}</p>
                        <p className="text-sm text-graphite-500">
                          {formatBytes(item.size)} • {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-graphite-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/app/items">
                <Button variant="secondary" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </Link>
              <Link href="/app/release">
                <Button variant="secondary" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Create Bundle
                </Button>
              </Link>
              <Link href="/app/settings/heartbeat">
                <Button variant="secondary" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              </Link>
            </div>
          </Card>

          {/* Next Steps */}
          {metadata.items.length === 0 && (
            <Card className="bg-primary-50 border-primary-200">
              <h3 className="text-lg font-semibold text-graphite-900 mb-3">Get Started</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-graphite-900">Upload your first items</p>
                    <p className="text-graphite-600">Photos, videos, or notes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-graphite-900">Create a release bundle</p>
                    <p className="text-graphite-600">Choose what to share</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-graphite-900">Add trustees</p>
                    <p className="text-graphite-600">Who should receive it</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Account Info */}
          <Card>
            <h3 className="text-lg font-semibold text-graphite-900 mb-3">Account</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-graphite-600">Plan</span>
                <span className="font-medium text-graphite-900">{tierLimits.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-600">Bundles</span>
                <span className="font-medium text-graphite-900">
                  {activeBundles.length}{tierLimits.bundles.max ? ` / ${tierLimits.bundles.max}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-600">Storage</span>
                <span className="font-medium text-graphite-900">
                  {formatBytes(metadata.totalSize)}
                </span>
              </div>
              <Link href="/app/settings">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Manage Settings
                </Button>
              </Link>
            </div>
          </Card>

          {/* Help */}
          <Card className="bg-gradient-to-br from-graphite-50 to-graphite-100 border-graphite-200">
            <h3 className="text-lg font-semibold text-graphite-900 mb-2">Need Help?</h3>
            <p className="text-sm text-graphite-600 mb-4">
              Check out our FAQ or contact support
            </p>
            <div className="flex gap-2">
              <Link href="/app/faq" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  FAQ
                </Button>
              </Link>
              <Link href="/app/support" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  Support
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-graphite-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-graphite-900 mb-1">{value}</p>
          <p className="text-xs text-graphite-500">{subtext}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <div className={`${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

function getItemIcon(item: any) {
  const iconClass = "w-5 h-5";

  if (item.type === 'note') {
    return (
      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
        <FileText className={`${iconClass} text-yellow-600`} />
      </div>
    );
  }

  const fileInfo = getFileTypeInfo(item.name);

  switch (fileInfo.category) {
    case 'image':
      return (
        <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className={`${iconClass} text-pink-600`} />
        </div>
      );
    case 'video':
      return (
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Video className={`${iconClass} text-purple-600`} />
        </div>
      );
    case 'audio':
      return (
        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
          <Music className={`${iconClass} text-green-600`} />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <File className={`${iconClass} text-blue-600`} />
        </div>
      );
  }
}
