'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Briefcase,
  Plus,
  DollarSign,
  CreditCard,
  Globe,
  Smartphone,
  Cloud,
  Bitcoin,
  Mail,
  Building,
  TrendingUp,
  Calendar,
  AlertCircle,
  Star,
  Archive,
  Edit,
  Trash2,
} from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { encryptData, generateItemKey, generateIV, wrapKey, bytesToHex } from '@/lib/crypto';

type AssetCategory =
  | 'financial'
  | 'social_media'
  | 'subscription'
  | 'email'
  | 'domain'
  | 'crypto'
  | 'cloud_storage'
  | 'other';

type AssetStatus = 'active' | 'archived' | 'closed';

export default function AssetsPageClient() {
  const { metadata, session } = useCrypto();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('financial');
  const [platform, setPlatform] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [url, setUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [important, setImportant] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [session.dbUserId]);

  const fetchAssets = async () => {
    if (!session.dbUserId) return;

    try {
      const response = await fetch(`/api/digital-assets?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!assetName.trim()) {
      showToast('Please enter an asset name', 'error');
      return;
    }

    try {
      // Generate encryption key for this asset
      const assetKey = await generateItemKey();

      // Encrypt sensitive fields
      let accountNumberEncrypted = null;
      let accountNumberIV = null;
      if (accountNumber.trim()) {
        const iv = generateIV();
        const encrypted = await encryptData(new TextEncoder().encode(accountNumber), assetKey, iv);
        accountNumberEncrypted = bytesToHex(encrypted);
        accountNumberIV = bytesToHex(iv);
      }

      let instructionsEncrypted = null;
      let instructionsIV = null;
      if (instructions.trim()) {
        const iv = generateIV();
        const encrypted = await encryptData(new TextEncoder().encode(instructions), assetKey, iv);
        instructionsEncrypted = bytesToHex(encrypted);
        instructionsIV = bytesToHex(iv);
      }

      // Wrap the asset key with the user's data key
      const wrappingIV = generateIV();
      const wrappedKey = await wrapKey(assetKey, session.dataKey!, wrappingIV);

      // Save to database
      const response = await fetch('/api/digital-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          name: assetName,
          category,
          platform: platform || null,
          url: url || null,
          accountNumberEncrypted,
          accountNumberIV,
          instructionsEncrypted,
          instructionsIV,
          estimatedValue: estimatedValue || null,
          valueCurrency: 'USD',
          renewalDate: renewalDate || null,
          assetKeySalt: '', // Not used but kept for consistency
          wrappedAssetKey: bytesToHex(wrappedKey),
          wrappedAssetKeyIV: bytesToHex(wrappingIV),
          important,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save asset');
      }

      showToast('Asset added successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      showToast(error instanceof Error ? error.message : 'Failed to add asset', 'error');
    }
  };

  const resetForm = () => {
    setAssetName('');
    setCategory('financial');
    setPlatform('');
    setAccountNumber('');
    setUrl('');
    setInstructions('');
    setEstimatedValue('');
    setRenewalDate('');
    setImportant(false);
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const categoryOptions = [
    { value: 'financial', label: 'Financial', icon: DollarSign, color: 'emerald' },
    { value: 'social_media', label: 'Social Media', icon: Smartphone, color: 'blue' },
    { value: 'subscription', label: 'Subscription', icon: CreditCard, color: 'purple' },
    { value: 'email', label: 'Email', icon: Mail, color: 'red' },
    { value: 'domain', label: 'Domain', icon: Globe, color: 'cyan' },
    { value: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'amber' },
    { value: 'cloud_storage', label: 'Cloud Storage', icon: Cloud, color: 'indigo' },
    { value: 'other', label: 'Other', icon: Briefcase, color: 'gray' },
  ];

  const activeAssets = assets.filter(a => a.status === 'active');
  const archivedAssets = assets.filter(a => a.status !== 'active');
  const totalValue = assets.reduce((sum, asset) => sum + (parseFloat(asset.estimatedValue) || 0), 0);

  const getCategoryIcon = (cat: string) => {
    const option = categoryOptions.find(o => o.value === cat);
    if (!option) return <Briefcase className="h-5 w-5" />;
    const Icon = option.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryColor = (cat: string) => {
    const option = categoryOptions.find(o => o.value === cat);
    return option?.color || 'gray';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <MobilePageHeader
        title="Digital Assets"
        subtitle="Track and organize your digital estate: bank accounts, subscriptions, crypto wallets, and online accounts for seamless handover to beneficiaries."
        icon={Briefcase}
        actions={
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="h-4 w-4" />
            <span className="ml-2">Add Asset</span>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-graphite-900">{activeAssets.length}</p>
              <p className="text-xs text-graphite-500">Active Assets</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-graphite-900">
                ${totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-graphite-500">Total Value</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-graphite-900">
                {activeAssets.filter(a => a.important).length}
              </p>
              <p className="text-xs text-graphite-500">High Priority</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-graphite-900">{archivedAssets.length}</p>
              <p className="text-xs text-graphite-500">Archived</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assets List */}
      {isLoading ? (
        <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
          <p className="py-12 text-center text-sm text-graphite-500">Loading assets...</p>
        </Card>
      ) : assets.length === 0 ? (
        <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-graphite-200 bg-graphite-50 text-graphite-500">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-graphite-900">No digital assets yet</h3>
            <p className="mt-2 max-w-sm text-sm text-graphite-600">
              Create an inventory of your bank accounts, subscriptions, crypto wallets, and online accounts to help your beneficiaries.
            </p>
            <Button onClick={() => setShowAddModal(true)} size="lg" className="mt-6">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Your First Asset</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Assets */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-graphite-900">Active Assets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeAssets.map((asset) => {
                const colorClass = getCategoryColor(asset.category);
                return (
                  <Card key={asset.id} className="rounded-2xl border border-graphite-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-${colorClass}-50 text-${colorClass}-600`}>
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-graphite-900 truncate">{asset.name}</h3>
                            {asset.important && (
                              <Star className="h-4 w-4 text-amber-500 flex-shrink-0 fill-current" />
                            )}
                          </div>
                          {asset.platform && (
                            <p className="mt-1 text-sm text-graphite-500 truncate">{asset.platform}</p>
                          )}
                          {asset.estimatedValue && (
                            <p className="mt-2 text-lg font-semibold text-emerald-600">
                              ${parseFloat(asset.estimatedValue).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {asset.renewalDate && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-graphite-500">
                        <Calendar className="h-4 w-4" />
                        <span>Renews: {new Date(asset.renewalDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Digital Asset"
        size="lg"
      >
        <div className="space-y-5">
          <Input
            label="Asset Name *"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="e.g., Wells Fargo Checking, Instagram Account"
          />

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setCategory(option.value as AssetCategory)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      category === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-graphite-200 hover:border-graphite-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 text-${option.color}-600`} />
                    <span className="text-xs font-medium text-graphite-900 block">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Platform/Institution"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g., Chase Bank, Netflix, Coinbase"
          />

          <Input
            label="Account Number/Username"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account identifier (encrypted)"
          />

          <Input
            label="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1">
              Instructions for Beneficiaries
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
              rows={3}
              placeholder="e.g., Close this account, Transfer to spouse, Archive and download data..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimated Value (USD)"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
            />

            <Input
              label="Renewal/Expiry Date"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="important"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="important" className="text-sm font-medium text-graphite-700 cursor-pointer">
              Mark as high priority
            </label>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Privacy & Security</p>
                <p>All sensitive information (account numbers, instructions) is encrypted end-to-end and only accessible to designated beneficiaries.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAsset}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Asset</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
