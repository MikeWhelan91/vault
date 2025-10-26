'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  Crown,
  Home,
  Briefcase,
  Zap,
  Activity
} from 'lucide-react';
import { getFileTypeInfo } from '@/lib/file-types';
import { getTierLimits, type TierName } from '@/lib/pricing';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { BundleCheckIn } from '@/components/BundleCheckIn';

export default function DashboardPageClient() {
  const { metadata, session } = useCrypto();
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoadingBundles, setIsLoadingBundles] = useState(true);
  const searchParams = useSearchParams();
  const checkInRef = useRef<HTMLDivElement>(null);
  const [checkInBundleId, setCheckInBundleId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchBundles();
  }, [session.dbUserId]);

  // Handle checkin parameter from URL or localStorage (persists through login)
  useEffect(() => {
    const urlCheckinParam = searchParams.get('checkin');

    if (urlCheckinParam) {
      // Store in localStorage so it persists through login redirect
      localStorage.setItem('pendingCheckin', urlCheckinParam);
      setCheckInBundleId(urlCheckinParam);
    } else {
      // Check if there's a pending checkin from before login
      const pendingCheckin = localStorage.getItem('pendingCheckin');
      if (pendingCheckin) {
        setCheckInBundleId(pendingCheckin);
        // Clear it after retrieving
        localStorage.removeItem('pendingCheckin');
      }
    }
  }, [searchParams]);

  // Scroll to check-in section when checkin param is present
  useEffect(() => {
    if (checkInBundleId && checkInRef.current && !isLoadingBundles) {
      setTimeout(() => {
        checkInRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [checkInBundleId, isLoadingBundles]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';
  const tierLimits = getTierLimits(tier);
  const storagePercentage = (metadata.totalSize / metadata.storageLimit) * 100;
  const activeBundles = bundles.filter(b => !b.released);
  const releasedBundles = bundles.filter(b => b.released);
  const heartbeatBundles = activeBundles.filter(b => b.mode === 'heartbeat');

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
      color: '#ff7451' // Coral - primary color
    },
    {
      name: 'Videos',
      value: itemsByType.videos.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.videos.length,
      color: '#f05a39' // Deeper coral
    },
    {
      name: 'Audio',
      value: itemsByType.audio.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.audio.length,
      color: '#ffb8a3' // Light peach
    },
    {
      name: 'Documents',
      value: itemsByType.documents.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.documents.length,
      color: '#d44729' // Burnt orange
    },
    {
      name: 'Notes',
      value: itemsByType.notes.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.notes.length,
      color: '#ffd4c8' // Soft pink
    },
    {
      name: 'Other',
      value: itemsByType.other.reduce((acc, item) => acc + item.size, 0),
      count: itemsByType.other.length,
      color: '#913324' // Deep warm brown
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

  const isOverStorageLimit = tier === 'free' && metadata.totalSize > metadata.storageLimit;
  const isOverBundleLimit = tier === 'free' && activeBundles.length > (tierLimits.bundles.max || 0);

  // Calculate grace period days remaining
  const gracePeriodEndsAt = metadata.gracePeriodEndsAt ? new Date(metadata.gracePeriodEndsAt) : null;
  const daysRemaining = gracePeriodEndsAt
    ? Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Grace Period Warning Banner (Critical - data will be deleted) */}
      {metadata.gracePeriodEndsAt && daysRemaining !== null && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">
                {daysRemaining <= 3 ? '⚠️ ' : ''}
                Data Deletion Warning - {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Remaining
              </h3>
              <div className="mt-2 space-y-2 text-sm text-red-800">
                <p className="font-semibold">
                  Your subscription was cancelled and you&apos;re currently over the free tier limits.
                </p>
                {isOverStorageLimit && (
                  <p>
                    • Storage: Using {formatBytes(metadata.totalSize)} / {tierLimits.storage.display} limit
                  </p>
                )}
                {isOverBundleLimit && (
                  <p>
                    • Bundles: {activeBundles.length} active / {tierLimits.bundles.max} limit
                  </p>
                )}
                <p className="mt-3 font-bold text-red-900">
                  On {gracePeriodEndsAt.toLocaleDateString()}, the following will happen automatically:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-medium">
                  {isOverStorageLimit && (
                    <li>Your <strong>newest files</strong> will be permanently deleted until storage is under 300MB (oldest files are kept)</li>
                  )}
                  {isOverBundleLimit && (
                    <li>Excess bundles will be disabled (only your oldest bundle will remain active)</li>
                  )}
                </ul>
                <p className="mt-3 font-semibold">
                  To prevent data loss, you can:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Upgrade to Plus to keep everything (recommended)</li>
                  <li>Delete items manually to get under 300MB</li>
                  <li>Download important files before {gracePeriodEndsAt.toLocaleDateString()}</li>
                </ul>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href="/app/settings/billing">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Upgrade Now to Save Your Data
                  </Button>
                </Link>
                <Link href="/app/items">
                  <Button size="sm" variant="secondary">
                    Manage Files
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Read-Only Mode Banner (no grace period, just over limits) */}
      {!metadata.gracePeriodEndsAt && (isOverStorageLimit || isOverBundleLimit) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-amber-900">Account in Read-Only Mode</h3>
              <div className="mt-2 space-y-1 text-sm text-amber-800">
                {isOverStorageLimit && (
                  <p>
                    You&apos;re using {formatBytes(metadata.totalSize)} of storage, which exceeds the free tier limit of {tierLimits.storage.display}.
                  </p>
                )}
                {isOverBundleLimit && (
                  <p>
                    You have {activeBundles.length} active bundles, which exceeds the free tier limit of {tierLimits.bundles.max}.
                  </p>
                )}
                <p className="mt-3 font-medium">
                  Your existing data and bundles remain secure and accessible, but you cannot upload new items or create new bundles until you:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {isOverStorageLimit && <li>Delete items to free up storage, or</li>}
                  {isOverBundleLimit && <li>Remove excess bundles, or</li>}
                  <li>Upgrade to Plus for unlimited access</li>
                </ul>
              </div>
              <div className="mt-4">
                <Link href="/app/settings/billing">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Upgrade to Plus
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heartbeat Check-In Section */}
      {heartbeatBundles.length > 0 && (
        <div ref={checkInBundleId ? checkInRef : null} className="space-y-4">
          {checkInBundleId && (
            <div className="rounded-2xl border-2 border-primary-300 bg-primary-50 p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">Check-In Required</h3>
                  <p className="mt-1 text-sm text-primary-700">
                    Click the &quot;I&apos;m Alive&quot; button below to reset your heartbeat timer and prevent automatic release.
                  </p>
                </div>
              </div>
            </div>
          )}
          {heartbeatBundles.map((bundle) => (
            <BundleCheckIn
              key={bundle.id}
              bundleId={bundle.id}
              bundleName={bundle.name}
              lastHeartbeat={bundle.lastHeartbeat}
              nextHeartbeat={bundle.nextHeartbeat}
              cadenceDays={bundle.heartbeatCadenceDays || 1}
              onCheckInSuccess={fetchBundles}
            />
          ))}
        </div>
      )}

      {/* Hero Section */}
      <MobilePageHeader
        title={metadata.userName ? `Welcome back, ${metadata.userName.split(' ')[0]}` : 'Welcome back'}
        subtitle="Monitor your encrypted storage, track release readiness, and keep every trustee in the loop from one private dashboard."
        icon={Home}
        badge={
          tier === 'plus' ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3 w-3" />
              Plus
            </div>
          ) : undefined
        }
        actions={
          <>
            <div className="rounded-2xl border border-graphite-200 bg-graphite-50 px-4 py-2.5 text-center shadow-inner">
              <p className="text-xs font-medium uppercase tracking-wide text-graphite-500">Account ID</p>
              <p className="mt-0.5 text-sm font-semibold text-graphite-800">{session.userId || metadata.userId}</p>
            </div>
            {tier === 'free' && (
              <Link href="/app/pricing">
                <Button size="sm">
                  Upgrade for more space
                </Button>
              </Link>
            )}
          </>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          icon={<Upload className="w-5 h-5" />}
          label="Total Items"
          value={metadata.items.length.toString()}
          subtext="encrypted assets"
          tone="primary"
          href="/app/items"
          trend={metadata.items.length > 0 ? 'up' : undefined}
        />
        <MetricCard
          icon={<Package className="w-5 h-5" />}
          label="Active Bundles"
          value={activeBundles.length.toString()}
          subtext={tierLimits.bundles.max ? `of ${tierLimits.bundles.max} max` : 'unlimited'}
          tone="emerald"
          href="/app/bundles"
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Released"
          value={releasedBundles.length.toString()}
          subtext="bundles delivered"
          tone="violet"
          href="/app/bundles"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Storage Used"
          value={`${storagePercentage.toFixed(0)}%`}
          subtext={formatBytes(metadata.totalSize)}
          tone={storagePercentage > 85 ? 'red' : 'amber'}
          href="/app/items"
          trend={storagePercentage > 50 ? 'up' : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Breakdown */}
          <Card className="rounded-3xl border border-graphite-200 shadow-sm">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-graphite-900">Storage Breakdown</h2>
              <p className="mt-2 text-sm text-graphite-500">Understand what&apos;s filling your encrypted vault.</p>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-center rounded-2xl border border-graphite-100 bg-graphite-50/60 p-4">
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
                  <div className="flex h-[200px] w-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-graphite-200 bg-white">
                      <Upload className="h-8 w-8 text-graphite-400" />
                    </div>
                    <p className="text-sm font-medium text-graphite-700">No items yet</p>
                    <p className="text-xs text-graphite-500">Add encrypted files to see your storage profile.</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {storageByType.length > 0 ? (
                  <>
                    {storageByType.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl border border-graphite-100 bg-white px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-2 w-8 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <p className="font-medium text-graphite-800">{item.name}</p>
                            <p className="text-xs text-graphite-500">{item.count} {item.count === 1 ? 'item' : 'items'}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-graphite-900">
                          {formatBytes(item.value)}
                        </span>
                      </div>
                    ))}
                    {/* Free Space */}
                    <div className="flex items-center justify-between rounded-2xl border border-dashed border-graphite-200 bg-graphite-50 px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-8 rounded-full bg-graphite-200" />
                        <span className="font-medium text-graphite-700">Free space</span>
                      </div>
                      <span className="font-semibold text-graphite-900">
                        {formatBytes(freeSpace)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-dashed border-graphite-200 bg-graphite-50 px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-8 rounded-full bg-graphite-200" />
                      <span className="font-medium text-graphite-700">Free space</span>
                    </div>
                    <span className="font-semibold text-graphite-900">
                      {formatBytes(freeSpace)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Storage Progress */}
            <div className="mt-8 rounded-2xl border border-graphite-100 bg-white px-4 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-graphite-700">
                  Storage usage
                </span>
                <span className="text-sm text-graphite-600">
                  {formatBytes(metadata.totalSize)} of {tierLimits.storage.display}
                </span>
              </div>
              <Progress
                value={storagePercentage}
                color={storagePercentage > 80 ? 'red' : storagePercentage > 60 ? 'yellow' : 'blue'}
                size="lg"
              />
              {tier === 'free' && storagePercentage > 70 && (
                <p className="mt-3 text-sm text-amber-700">
                  You&apos;re using {storagePercentage.toFixed(0)}% of your included storage.
                  <Link href="/app/pricing" className="ml-1 font-semibold text-primary-600 hover:text-primary-700">
                    Unlock 5 GB with Plus.
                  </Link>
                </p>
              )}
            </div>
          </Card>

          {/* Active Bundles */}
          <Card className="rounded-3xl border border-graphite-200 shadow-sm">
            <div className="space-y-4 text-center">
              <div>
                <h2 className="text-2xl font-semibold text-graphite-900">Active Releases</h2>
                <p className="mt-2 text-sm text-graphite-500">
                  {activeBundles.length === 0
                    ? 'Get started by assembling your first release bundle.'
                    : `Managing ${activeBundles.length} active ${activeBundles.length === 1 ? 'bundle' : 'bundles'}.`}
                </p>
              </div>
              <Link href="/app/release" className="inline-block">
                <Button variant="secondary">
                  Plan a release
                </Button>
              </Link>
            </div>

            {isLoadingBundles ? (
              <p className="py-12 text-center text-sm text-graphite-500">Loading bundles...</p>
            ) : activeBundles.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-graphite-200 bg-graphite-50 px-6 py-14 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary-100 bg-white text-primary-600">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-graphite-900">No active bundles yet</h3>
                <p className="mt-2 max-w-sm text-sm text-graphite-500">
                  Create a release bundle to ensure your memories are shared securely with the right people when the time arrives.
                </p>
                <Link href="/app/release" className="mt-6">
                  <Button size="lg">Create your first bundle</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {activeBundles.map((bundle) => {
                  const isTimeLock = bundle.mode === 'time-lock';
                  const releaseDate = isTimeLock && bundle.releaseDate ? new Date(bundle.releaseDate) : null;
                  const now = new Date();
                  const daysUntilRelease = releaseDate ? Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <div
                      key={bundle.id}
                      className="rounded-2xl border border-graphite-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-md"
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-start gap-3 sm:gap-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
                            isTimeLock ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isTimeLock ? <Calendar className="h-6 w-6 sm:h-7 sm:w-7" /> : <Heart className="h-6 w-6 sm:h-7 sm:w-7" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <h3 className="break-words text-base font-semibold text-graphite-900 sm:text-lg">{bundle.name}</h3>
                            <div
                              className={`w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                                isTimeLock ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isTimeLock ? 'Time-lock' : 'Heartbeat'}
                            </div>
                          </div>
                          <p className="text-sm text-graphite-500">
                            Created {formatDistanceToNow(new Date(bundle.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-graphite-100 bg-graphite-50/60 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-graphite-600">
                            <Users className="h-4 w-4" />
                            Trustees
                          </div>
                          <p className="text-xl font-semibold text-graphite-900">
                            {bundle.trustees?.length || 0}
                          </p>
                        </div>
                        <div className="rounded-xl border border-graphite-100 bg-graphite-50/60 p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-graphite-600">
                            <FileText className="h-4 w-4" />
                            Items
                          </div>
                          <p className="text-xl font-semibold text-graphite-900">
                            {bundle.items?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Release Info */}
                      {isTimeLock && releaseDate && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
                            <Clock className="h-4 w-4" />
                            Scheduled release
                          </div>
                          <p className="text-sm text-blue-700">
                            {releaseDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {daysUntilRelease !== null && (
                            <p className="mt-1 text-xs font-medium text-blue-600">
                              {daysUntilRelease > 0
                                ? `${daysUntilRelease} ${daysUntilRelease === 1 ? 'day' : 'days'} remaining`
                                : 'Releasing soon'}
                            </p>
                          )}
                        </div>
                      )}

                      {!isTimeLock && (
                        <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
                            <Heart className="h-4 w-4" />
                            Heartbeat monitoring
                          </div>
                          <p className="text-sm text-rose-700">
                            Will release if you miss your check-in deadline.
                          </p>
                          {bundle.heartbeatCadenceDays && (
                            <p className="mt-1 text-xs font-medium text-rose-600">
                              Check-in every {bundle.heartbeatCadenceDays} days
                            </p>
                          )}
                        </div>
                      )}

                      {/* View Button */}
                      <div className="mt-4 border-t border-graphite-100 pt-4">
                        <Link
                          href="/app/release"
                          className="group inline-flex w-full items-center justify-between text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          <span>Manage bundles</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card className="rounded-3xl border border-graphite-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-graphite-900">Activity</h2>
            </div>

            {recentItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-graphite-200 bg-graphite-50 p-8 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-graphite-400" />
                <p className="text-sm text-graphite-600">No recent activity</p>
                <p className="text-xs text-graphite-500 mt-1">Your uploads will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item, index) => (
                  <Link key={item.id} href={`/app/items/${item.id}`}>
                    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent transition-all border border-transparent hover:border-primary-100">
                      <div className="relative">
                        {getItemIcon(item)}
                        {index !== recentItems.length - 1 && (
                          <div className="absolute left-5 top-10 w-[2px] h-6 bg-gradient-to-b from-graphite-200 to-transparent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-graphite-900 truncate group-hover:text-primary-700 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-graphite-500 mt-0.5">
                              {formatBytes(item.size)}
                            </p>
                          </div>
                          <span className="text-xs text-graphite-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/app/items" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-center mt-2">
                    View All Items
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="rounded-3xl border border-graphite-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-primary-50 to-white p-4 border-b border-primary-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
                  <Zap className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-graphite-900">Quick Actions</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/app/items"
                className="group flex items-center justify-between rounded-xl border border-graphite-100 bg-gradient-to-br from-white to-graphite-50/50 px-4 py-3 text-sm font-medium text-graphite-700 transition-all hover:border-primary-300 hover:shadow-md hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Upload className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-graphite-900">Open My Vault</div>
                    <div className="text-xs text-graphite-500">Files, messages & assets</div>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-graphite-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
              </Link>

              <Link
                href="/app/release"
                className="group flex items-center justify-between rounded-xl border border-graphite-100 bg-gradient-to-br from-white to-graphite-50/50 px-4 py-3 text-sm font-medium text-graphite-700 transition-all hover:border-primary-300 hover:shadow-md hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-graphite-900">Create Bundle</div>
                    <div className="text-xs text-graphite-500">Plan release</div>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-graphite-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
              </Link>
            </div>
          </Card>

          {/* Next Steps */}
          {metadata.items.length === 0 && (
            <Card className="rounded-3xl border border-primary-100 bg-primary-50/70 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-graphite-900">Getting Started</h3>
              <div className="space-y-4 text-sm">
                {[{
                  title: 'Upload your first items',
                  description: 'Add photos, videos, or notes to your encrypted vault.',
                }, {
                  title: 'Create a release bundle',
                  description: 'Curate what should be shared and when it unlocks.',
                }, {
                  title: 'Invite trustees',
                  description: 'Nominate who will verify and receive your releases.',
                }].map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-primary-600 shadow-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-graphite-900">{step.title}</p>
                      <p className="text-graphite-600">{step.description}</p>
                    </div>
                  </div>
                ))}
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
          <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-3 text-primary-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-graphite-900">Need help?</h3>
                <p className="mt-1 text-sm text-graphite-600">
                  Explore the in-app FAQ or start a secure support request if you need personalised assistance.
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href="/app/faq" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      View FAQ
                    </Button>
                  </Link>
                  <Link href="/app/support" className="flex-1">
                    <Button size="sm" className="w-full justify-center">
                      Contact support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const metricThemes = {
  primary: {
    iconBg: 'bg-primary-50',
    iconText: 'text-primary-600',
    accent: 'ring-2 ring-primary-100',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    accent: 'ring-2 ring-emerald-100',
  },
  violet: {
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-600',
    accent: 'ring-2 ring-violet-100',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    accent: 'ring-2 ring-amber-100',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    accent: 'ring-2 ring-red-100',
  },
} satisfies Record<string, { iconBg: string; iconText: string; accent: string }>;

function MetricCard({
  icon,
  label,
  value,
  subtext,
  tone = 'primary',
  href,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  tone?: keyof typeof metricThemes;
  href?: string;
  trend?: 'up' | 'down';
}) {
  const theme = metricThemes[tone] ?? metricThemes.primary;

  const content = (
    <div className="flex flex-col items-center text-center">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText} ${theme.accent}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-semibold text-graphite-900">{value}</p>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-graphite-500">{subtext}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card className="relative overflow-hidden rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm ring-1 ring-inset ring-transparent transition-all hover:shadow-md hover:border-primary-200 hover:scale-[1.02] cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm ring-1 ring-inset ring-transparent">
      {content}
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
