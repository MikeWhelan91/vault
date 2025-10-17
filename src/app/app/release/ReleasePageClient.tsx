'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReleaseMode, ReleaseBundle, Trustee } from '@/types';
import { Calendar, Heart, FileText, StickyNote, Plus, X, Crown } from 'lucide-react';
import { UpgradePrompt, type UpgradeReason } from '@/components/UpgradePrompt';
import { canCreateBundle, canAddTrustee, getTierLimits, type TierName } from '@/lib/pricing';

export default function ReleasePageClient() {
  const { metadata, session, getExtractableItemKey } = useCrypto();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [bundleName, setBundleName] = useState('');
  const [bundleNote, setBundleNote] = useState('');
  const [mode, setMode] = useState<ReleaseMode>('time-lock');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState('');
  const [heartbeatCadence, setHeartbeatCadence] = useState(30);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [newTrusteeEmail, setNewTrusteeEmail] = useState('');
  const [newTrusteeName, setNewTrusteeName] = useState('');
  const [existingBundles, setExistingBundles] = useState<any[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>('bundle_limit');
  const [includeEmailMessage, setIncludeEmailMessage] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [conditionalRelease, setConditionalRelease] = useState(false);
  const [conditionType, setConditionType] = useState<'all' | 'any' | 'count'>('all');
  const [conditionCount, setConditionCount] = useState(2);

  // Fetch existing bundles on mount
  useEffect(() => {
    if (session.dbUserId) {
      fetchBundles();
    }
  }, [session.dbUserId]);

  const fetchBundles = async () => {
    try {
      const response = await fetch(`/api/bundles?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingBundles(data.bundles.filter((b: any) => !b.released));
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
    }
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddTrustee = () => {
    if (!newTrusteeEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    if (!metadata) return;

    const tier = (metadata.tier as TierName) || 'free';
    const tierLimits = getTierLimits(tier);

    // Check tier-based trustee limit
    if (!canAddTrustee(tier, trustees.length)) {
      setUpgradeReason('trustee_limit');
      setShowUpgradePrompt(true);
      return;
    }

    const trustee: Trustee = {
      id: crypto.randomUUID(),
      email: newTrusteeEmail.trim(),
      name: newTrusteeName.trim() || undefined,
    };

    setTrustees([...trustees, trustee]);
    setNewTrusteeEmail('');
    setNewTrusteeName('');
  };

  const handleRemoveTrustee = (id: string) => {
    setTrustees(trustees.filter((t) => t.id !== id));
  };

  const handleCreateBundle = async () => {
    if (!metadata) return;

    // Validation
    if (!bundleName.trim()) {
      showToast('Please enter a bundle name', 'error');
      return;
    }

    if (!bundleNote.trim()) {
      showToast('Please enter a note for your trustees', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Please select at least one item', 'error');
      return;
    }

    if (mode === 'time-lock' && !releaseDate) {
      showToast('Please select a release date', 'error');
      return;
    }

    if (trustees.length === 0) {
      showToast('Please add at least one trustee', 'error');
      return;
    }

    // Check bundle limit before attempting to create
    const tier = (metadata.tier as TierName) || 'free';
    if (!canCreateBundle(tier, existingBundles.length)) {
      setUpgradeReason('bundle_limit');
      setShowUpgradePrompt(true);
      return;
    }

    try {
      // IMPORTANT: Client-side key wrapping for zero-knowledge encryption
      // We need to wrap item keys with a bundle key so trustees can decrypt
      const { deriveBundleKey, wrapKey, generateIV, bytesToHex, encryptData } = await import('@/lib/crypto');

      // Generate a bundle token on the client
      const releaseToken = crypto.randomUUID();

      // Derive bundle key from token
      const bundleKey = await deriveBundleKey(releaseToken);

      // Encrypt the bundle note with the bundle key
      const noteData = new TextEncoder().encode(bundleNote);
      const noteIV = generateIV();
      const noteEncrypted = await crypto.subtle.encrypt(
        // @ts-expect-error - TypeScript has issues with ArrayBuffer vs SharedArrayBuffer in crypto.subtle
        { name: 'AES-GCM', iv: noteIV },
        bundleKey,
        noteData
      );
      const bundleNoteEncrypted = bytesToHex(new Uint8Array(noteEncrypted));
      const bundleNoteIV = bytesToHex(noteIV);

      // Encrypt the email message if provided
      let emailMessageEncrypted: string | undefined = undefined;
      let emailMessageIV: string | undefined = undefined;
      if (includeEmailMessage && emailMessage.trim()) {
        const emailData = new TextEncoder().encode(emailMessage);
        const emailIV = generateIV();
        const emailEncrypted = await crypto.subtle.encrypt(
          // @ts-expect-error - TypeScript has issues with ArrayBuffer vs SharedArrayBuffer in crypto.subtle
          { name: 'AES-GCM', iv: emailIV },
          bundleKey,
          emailData
        );
        emailMessageEncrypted = bytesToHex(new Uint8Array(emailEncrypted));
        emailMessageIV = bytesToHex(emailIV);
      }

      // Wrap each item key with the bundle key
      const itemsWithWrappedKeys = await Promise.all(
        selectedItems.map(async (itemId) => {
          try {
            // Get the extractable item key (unwrapped with user's data key)
            const itemKey = await getExtractableItemKey(itemId);

            // Generate IV for wrapping
            const iv = generateIV();

            // Wrap item key with bundle key
            const wrappedKey = await wrapKey(itemKey, bundleKey, iv);

            return {
              itemId,
              bundleWrappedKey: bytesToHex(wrappedKey),
              bundleWrappedKeyIV: bytesToHex(iv),
            };
          } catch (error) {
            console.error(`Failed to wrap key for item ${itemId}:`, error);
            throw error;
          }
        })
      );

      // Convert release date from local time to ISO string
      let releaseDateISO: string | undefined = undefined;
      if (mode === 'time-lock' && releaseDate) {
        // datetime-local gives us "YYYY-MM-DDTHH:mm" in local time
        // Create a Date object which interprets this as local time
        const localDate = new Date(releaseDate);
        // Convert to ISO string (which is in UTC)
        releaseDateISO = localDate.toISOString();
      }

      // Force free users to 30 days for heartbeat
      const finalHeartbeatCadence = mode === 'heartbeat'
        ? (isPaidUser ? heartbeatCadence : 30)
        : undefined;

      // Call API to create bundle with wrapped keys
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          name: bundleName,
          mode,
          releaseDate: releaseDateISO,
          heartbeatCadenceDays: finalHeartbeatCadence,
          releaseToken, // Send the token we generated
          bundleNoteEncrypted, // Encrypted note for trustees
          bundleNoteIV, // IV for note decryption
          includeEmailMessage,
          emailMessageEncrypted,
          emailMessageIV,
          conditionalRelease,
          conditionType: conditionalRelease ? conditionType : null,
          conditionCount: conditionalRelease && conditionType === 'count' ? conditionCount : null,
          items: itemsWithWrappedKeys,
          trustees: trustees.map(t => ({ email: t.email, name: t.name })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Handle limit errors by showing upgrade prompt
        if (errorData?.code === 'BUNDLE_LIMIT_EXCEEDED') {
          setUpgradeReason('bundle_limit');
          setShowUpgradePrompt(true);
          return;
        } else if (errorData?.code === 'TRUSTEE_LIMIT_EXCEEDED') {
          setUpgradeReason('trustee_limit');
          setShowUpgradePrompt(true);
          return;
        }

        throw new Error(errorData?.error || 'Failed to create bundle');
      }

      const data = await response.json();

      showToast('Release bundle created successfully', 'success');

      // Refresh bundles list
      await fetchBundles();

      // Reset form
      setBundleName('');
      setBundleNote('');
      setSelectedItems([]);
      setReleaseDate('');
      setTrustees([]);
      setIncludeEmailMessage(false);
      setEmailMessage('');
      setConditionalRelease(false);
      setConditionType('all');
      setConditionCount(2);
      setStep(1);
    } catch (error) {
      console.error('Create bundle error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create release bundle', 'error');
    }
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';
  const isPaidUser = tier !== 'free';
  const canCreate = canCreateBundle(tier, existingBundles.length);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-graphite-900">
          Share Your Memories
        </h1>
        <p className="text-graphite-600 mt-1">
          Choose what you want to share and who should receive it
        </p>
      </div>

      {/* Bundle Limit Reached - Show Upgrade Prompt */}
      {!canCreate && (
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-graphite-900 mb-2">
                Bundle Limit Reached
              </h2>
              <p className="text-sm text-graphite-700 mb-4">
                Free tier allows 1 active release bundle. You currently have {existingBundles.length} active {existingBundles.length === 1 ? 'bundle' : 'bundles'}. Upgrade to Plus for unlimited bundles to organize memories for different groups of loved ones.
              </p>
              <Button onClick={() => {
                setUpgradeReason('bundle_limit');
                setShowUpgradePrompt(true);
              }}>
                Upgrade to Plus
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Progress - Only show if can create */}
      {canCreate && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`
                flex-1 h-2 rounded-full
                ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}
              `}
            />
          ))}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {canCreate && step === 1 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 mb-4">
            Step 1: Basic Information
          </h2>
          <div className="space-y-6">
            <Input
              label="Bundle Name"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="My Will & Testament"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message to Your Trustees <span className="text-red-500">*</span>
              </label>
              <textarea
                value={bundleNote}
                onChange={(e) => setBundleNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
                rows={6}
                placeholder="Write a message to your loved ones... This note will be included when they receive your memories."
                required
              />
              <p className="text-xs text-graphite-500 mt-1">
                This message will be encrypted and included in the download for your trustees
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-graphite-200 bg-graphite-50 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmailMessage}
                  onChange={(e) => setIncludeEmailMessage(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include custom note in release email
                </span>
              </label>
              {includeEmailMessage && (
                <div>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
                    rows={4}
                    placeholder="Write a personal message that will appear in the release email to your trustees..."
                  />
                  <p className="text-xs text-graphite-500 mt-1">
                    This note will be displayed in the email notification when the bundle is released
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Release Mode
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('time-lock')}
                  className={`
                    p-6 rounded-lg border-2 transition-colors text-left
                    ${
                      mode === 'time-lock'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-graphite-200 hover:border-graphite-300'
                    }
                  `}
                >
                  <Calendar className={`w-8 h-8 mb-3 ${mode === 'time-lock' ? 'text-primary-600' : 'text-graphite-400'}`} />
                  <h3 className="font-semibold text-graphite-900 mb-1">
                    Scheduled Date
                  </h3>
                  <p className="text-sm text-graphite-600">
                    Share on a specific future date
                  </p>
                </button>

                <button
                  onClick={() => setMode('heartbeat')}
                  className={`
                    p-6 rounded-lg border-2 transition-colors text-left
                    ${
                      mode === 'heartbeat'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-graphite-200 hover:border-graphite-300'
                    }
                  `}
                >
                  <Heart className={`w-8 h-8 mb-3 ${mode === 'heartbeat' ? 'text-primary-600' : 'text-graphite-400'}`} />
                  <h3 className="font-semibold text-graphite-900 mb-1">
                    If I Stop Checking In
                  </h3>
                  <p className="text-sm text-graphite-600">
                    Share if I miss check-ins for too long
                  </p>
                </button>
              </div>
            </div>

            {mode === 'time-lock' && (
              <div>
                <Input
                  type="datetime-local"
                  label="When should this be shared?"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  helperText="Your memories will be sent at this date and time (in your local timezone)"
                />
                <p className="text-xs text-graphite-500 mt-1">
                  Releases are checked every hour
                </p>
              </div>
            )}

            {mode === 'heartbeat' && (
              isPaidUser ? (
                <Input
                  type="number"
                  label="How long between check-ins? (days)"
                  value={heartbeatCadence}
                  onChange={(e) => setHeartbeatCadence(parseInt(e.target.value) || 1)}
                  helperText="If you don't check in for this long, memories will be shared"
                  min={1}
                  max={365}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-graphite-200 bg-graphite-50 p-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Check-in frequency
                      </label>
                      <p className="text-sm text-graphite-500">
                        Free users check in every 30 days
                      </p>
                    </div>
                    <div className="text-2xl font-semibold text-graphite-900">
                      30 days
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Want custom check-in schedules?
                        </p>
                        <p className="text-sm text-amber-800 mb-3">
                          Plus members can choose any check-in frequency from 1 to 365 days.
                        </p>
                        <Link href="/app/pricing">
                          <Button size="sm" variant="secondary" className="bg-white hover:bg-amber-50">
                            Upgrade to Plus
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next Step</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Select Items */}
      {canCreate && step === 2 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 mb-4">
            Step 2: Select Items
          </h2>
          <p className="text-graphite-600 mb-4">
            Choose which items to include in this release bundle
          </p>

          {metadata.items.length === 0 ? (
            <p className="text-center py-8 text-graphite-500">
              No items available. Add items first.
            </p>
          ) : (
            <div className="space-y-2 mb-6">
              {metadata.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-graphite-50 cursor-pointer border border-transparent hover:border-graphite-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    {item.type === 'file' ? (
                      <FileText className="w-5 h-5 text-primary-600" />
                    ) : (
                      <StickyNote className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <span className="flex-1 text-graphite-900">
                    {item.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={selectedItems.length === 0}
            >
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Add Trustees */}
      {canCreate && step === 3 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 mb-4">
            Step 3: Who Should Receive This?
          </h2>
          <p className="text-graphite-600 mb-4">
            Add the people who will receive these memories when the time comes
          </p>

          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={newTrusteeEmail}
                onChange={(e) => setNewTrusteeEmail(e.target.value)}
                placeholder="trustee@example.com"
              />
              <Input
                label="Name (optional)"
                value={newTrusteeName}
                onChange={(e) => setNewTrusteeName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleAddTrustee}
              className="w-full"
              disabled={!canAddTrustee((metadata.tier as TierName) || 'free', trustees.length)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Trustee
            </Button>
          </div>

          {trustees.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-700">
                Added Trustees ({trustees.length})
              </h3>
              {trustees.map((trustee) => (
                <div
                  key={trustee.id}
                  className="flex items-center justify-between p-3 bg-graphite-50 rounded-lg border border-graphite-200"
                >
                  <div>
                    <p className="font-medium text-graphite-900">
                      {trustee.name || trustee.email}
                    </p>
                    {trustee.name && (
                      <p className="text-sm text-graphite-600">
                        {trustee.email}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrustee(trustee.id)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Conditional Release (Plus Feature) */}
          {isPaidUser && trustees.length >= 2 && (
            <div className="space-y-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditionalRelease}
                      onChange={(e) => setConditionalRelease(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-primary-900">
                      Require trustee confirmation before release
                    </span>
                  </label>
                  <p className="text-xs text-primary-700 mt-1 ml-7">
                    Bundle will only be released when trustees confirm they should receive it
                  </p>
                </div>
              </div>

              {conditionalRelease && (
                <div className="ml-7 space-y-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conditionType"
                        value="all"
                        checked={conditionType === 'all'}
                        onChange={() => setConditionType('all')}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-graphite-900">All trustees must confirm</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conditionType"
                        value="any"
                        checked={conditionType === 'any'}
                        onChange={() => setConditionType('any')}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-graphite-900">Any single trustee can confirm</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conditionType"
                        value="count"
                        checked={conditionType === 'count'}
                        onChange={() => setConditionType('count')}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-graphite-900 flex items-center gap-2">
                        At least
                        <input
                          type="number"
                          value={conditionCount}
                          onChange={(e) => setConditionCount(parseInt(e.target.value) || 2)}
                          min={2}
                          max={trustees.length}
                          disabled={conditionType !== 'count'}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
                        />
                        trustees must confirm
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={trustees.length === 0}>
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Create */}
      {canCreate && step === 4 && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 mb-4">
            Step 4: Review & Create
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Bundle Name
              </h3>
              <p className="text-graphite-900">{bundleName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Release Mode
              </h3>
              <div className="flex items-center gap-2 text-graphite-900">
                {mode === 'time-lock' ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Time-Lock ({new Date(releaseDate).toLocaleString()})</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Heartbeat ({heartbeatCadence} days)</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Selected Items ({selectedItems.length})
              </h3>
              <ul className="space-y-2">
                {selectedItems.map((itemId) => {
                  const item = metadata.items.find((i) => i.id === itemId);
                  return item ? (
                    <li key={itemId} className="flex items-center gap-2 text-graphite-900">
                      {item.type === 'file' ? (
                        <FileText className="w-4 h-4 text-primary-600" />
                      ) : (
                        <StickyNote className="w-4 h-4 text-primary-600" />
                      )}
                      <span>{item.name}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Trustees ({trustees.length})
              </h3>
              <ul className="space-y-1">
                {trustees.map((trustee) => (
                  <li key={trustee.id} className="text-graphite-900">
                    {trustee.name || trustee.email}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreateBundle}>
                Create Bundle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        reason={upgradeReason}
      />
    </div>
  );
}
