'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { User, Trash2, Database, AlertTriangle, CreditCard, Fingerprint, Smartphone, Settings } from 'lucide-react';
import { useIsNativeApp } from '@/lib/platform';
import { biometric, haptics } from '@/lib/mobile';
import { isPaidTier, type TierName } from '@/lib/pricing';
import {
  hasBiometricCredentials,
  storeBiometricCredentials,
  clearBiometricCredentials,
  isBiometricEnabled,
} from '@/lib/biometric-storage';
import { getPreferences, setPreference } from '@/lib/preferences';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

export default function SettingsPageClient() {
  const router = useRouter();
  const { session, metadata, updateMetadata } = useCrypto();
  const { showToast } = useToast();
  const isNativeApp = useIsNativeApp();
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState('');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Check biometric availability and preferences on mount
  useEffect(() => {
    async function init() {
      if (isNativeApp && session.userId) {
        const available = await biometric.isAvailable();
        setBiometricAvailable(available);

        if (available) {
          const enabled = isBiometricEnabled(session.userId);
          setBiometricEnabled(enabled);
        }
      }

      // Load preferences
      const prefs = getPreferences();
      setHapticsEnabled(prefs.hapticsEnabled);
    }

    init();
  }, [isNativeApp, session.userId]);

  const handleEnableBiometric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsProcessing(true);
    try {
      await haptics.medium();
      await storeBiometricCredentials(session.userId, password);
      await haptics.success();

      setBiometricEnabled(true);
      setShowBiometricModal(false);
      setPassword('');
      showToast('Biometric authentication enabled', 'success');
    } catch (error) {
      await haptics.error();
      console.error('Failed to enable biometric:', error);
      showToast('Failed to enable biometric authentication', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      await haptics.medium();
      clearBiometricCredentials(session.userId);
      setBiometricEnabled(false);
      showToast('Biometric authentication disabled', 'success');
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      showToast('Failed to disable biometric authentication', 'error');
    }
  };

  const handleToggleHaptics = async () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    setPreference('hapticsEnabled', newValue);

    // Give feedback only if enabling (not disabling)
    if (newValue) {
      await haptics.medium();
    }

    showToast(
      newValue ? 'Haptic feedback enabled' : 'Haptic feedback disabled',
      'success'
    );
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      // Update metadata to reflect deletion
      if (metadata) {
        updateMetadata({
          items: [],
          totalSize: 0,
        });
      }

      showToast('All your data has been deleted', 'success');
      setShowDeleteDataModal(false);
      router.push('/app');
    } catch (error) {
      console.error('Failed to delete data:', error);
      showToast('Failed to delete data', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (!response.ok) {
        // If account not found (404), it was already deleted - clear session and redirect
        if (response.status === 404) {
          localStorage.clear();
          sessionStorage.clear();
          showToast('Account was already deleted', 'info');
          router.push('/');
          return;
        }
        throw new Error('Failed to delete account');
      }

      showToast('Your account has been deleted', 'success');
      setShowDeleteAccountModal(false);

      // Clear local storage and redirect to home
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      showToast('Failed to delete account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <MobilePageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        icon={Settings}
      />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Information */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-champagne-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-plum-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-plum-900 mb-2">Account</h2>
              <div className="space-y-1 text-sm text-plum-600">
                <div className="truncate">{session.userId}</div>
                {metadata && (
                  <div>{metadata.items.length} items stored</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Billing & Subscription */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-champagne-100 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-plum-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-plum-900 mb-2">Billing</h2>
              <p className="text-sm text-plum-600 mb-3">
                {metadata && isPaidTier(metadata.tier as TierName) ? 'Plus Tier - $9/month' : 'Free Tier'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/app/settings/billing')}
                className="text-xs"
              >
                Manage
              </Button>
            </div>
          </div>
        </Card>

        {/* Haptic Feedback - Mobile Only */}
        {isNativeApp && (
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-champagne-100 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-plum-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-plum-900 mb-2">Haptic Feedback</h2>
                <p className="text-sm text-plum-600 mb-3">
                  {hapticsEnabled ? 'Vibration enabled for interactions' : 'Vibration disabled'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleHaptics}
                  className="text-xs"
                >
                  {hapticsEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Delete All Data */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-champagne-100 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-plum-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-plum-900 mb-2">Delete All Data</h2>
              <p className="text-sm text-plum-600 mb-3">
                Remove all items and bundles. Account stays active.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDataModal(true)}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                Delete Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Account */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-champagne-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-plum-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-plum-900 mb-2">Delete Account</h2>
              <p className="text-sm text-plum-600 mb-3">
                Permanently delete everything. Cannot be undone.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAccountModal(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete All Data Modal */}
      <Modal
        isOpen={showDeleteDataModal}
        onClose={() => setShowDeleteDataModal(false)}
        title="Delete All Data"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All your encrypted items ({metadata?.items.length || 0} items)</li>
                <li>All your release bundles</li>
                <li>All trustee information</li>
                <li>All files from R2 storage</li>
              </ul>
              <p className="mt-2 font-medium">Your account will remain active and you can add new data.</p>
            </div>
          </div>

          <p className="text-sm text-plum-600">
            This action cannot be undone. Are you sure you want to continue?
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDataModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAllData}
              isLoading={isDeleting}
            >
              Yes, Delete All Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your entire account</li>
                <li>All your encrypted items</li>
                <li>All your release bundles</li>
                <li>All trustee information</li>
                <li>All files from R2 storage</li>
              </ul>
              <p className="mt-2 font-medium">You will not be able to log in again with this email.</p>
            </div>
          </div>

          <p className="text-sm text-plum-600">
            This action cannot be undone. Are you absolutely sure?
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteAccountModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Yes, Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
