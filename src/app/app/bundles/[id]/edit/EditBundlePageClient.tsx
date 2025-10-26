'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Package, Users, FileText, Trash2, Plus, StickyNote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

interface Bundle {
  id: string;
  name: string;
  mode: 'time-lock' | 'heartbeat';
  releaseDate?: string;
  heartbeatCadenceDays?: number;
  released: boolean;
  items: Array<{
    id: string;
    name: string;
    type: 'file' | 'note';
  }>;
  trustees: Array<{
    id: string;
    email: string;
    name?: string;
  }>;
}

interface EditBundlePageClientProps {
  bundleId: string;
}

export default function EditBundlePageClient({ bundleId }: EditBundlePageClientProps) {
  const { session } = useCrypto();
  const { showToast } = useToast();
  const router = useRouter();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [bundleName, setBundleName] = useState('');
  const [newTrusteeEmail, setNewTrusteeEmail] = useState('');
  const [newTrusteeName, setNewTrusteeName] = useState('');
  const [availableItems, setAvailableItems] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [showAddItems, setShowAddItems] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);
  const [trusteeToRemove, setTrusteeToRemove] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    fetchBundle();
    fetchAvailableItems();
  }, [bundleId, session.dbUserId]);

  const fetchBundle = async () => {
    if (!session.dbUserId) return;

    try {
      const response = await fetch(`/api/bundles/${bundleId}?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setBundle(data.bundle);
        setBundleName(data.bundle.name);
      } else {
        showToast('Bundle not found', 'error');
        router.push('/app/bundles');
      }
    } catch (error) {
      console.error('Failed to fetch bundle:', error);
      showToast('Failed to load bundle', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    if (!session.dbUserId) return;

    try {
      const response = await fetch(`/api/items?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleSaveName = async () => {
    if (!bundleName.trim()) {
      showToast('Bundle name cannot be empty', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/bundles/${bundleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          name: bundleName,
        }),
      });

      if (response.ok) {
        showToast('Bundle name updated', 'success');
        await fetchBundle();
      } else {
        throw new Error('Failed to update bundle name');
      }
    } catch (error) {
      showToast('Failed to update bundle name', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTrustee = async () => {
    if (!newTrusteeEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/bundles/${bundleId}/trustees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          email: newTrusteeEmail,
          name: newTrusteeName || null,
        }),
      });

      if (response.ok) {
        showToast('Trustee added', 'success');
        setNewTrusteeEmail('');
        setNewTrusteeName('');
        await fetchBundle();
      } else {
        throw new Error('Failed to add trustee');
      }
    } catch (error) {
      showToast('Failed to add trustee', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTrustee = async () => {
    if (!trusteeToRemove) return;

    try {
      const response = await fetch(`/api/bundles/${bundleId}/trustees/${trusteeToRemove.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (response.ok) {
        showToast('Trustee removed', 'success');
        setTrusteeToRemove(null);
        await fetchBundle();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove trustee');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove trustee', 'error');
    }
  };

  const handleAddItem = async (itemId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/bundles/${bundleId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          itemId,
        }),
      });

      if (response.ok) {
        showToast('Item added to bundle', 'success');
        await fetchBundle();
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      showToast('Failed to add item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      const response = await fetch(`/api/bundles/${bundleId}/items/${itemToRemove.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.dbUserId }),
      });

      if (response.ok) {
        showToast('Item removed from bundle', 'success');
        setItemToRemove(null);
        await fetchBundle();
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bundle) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-warm-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h1 className="text-3xl font-semibold text-warm-900">Edit {bundle.name}</h1>
            <p className="mt-2 text-sm text-warm-600">
              Manage bundle name, trustees, and items. Release settings cannot be changed after creation.
            </p>
          </div>
        </div>
      </section>

      {/* Bundle Name */}
      <Card className="rounded-3xl border border-warm-200 bg-white shadow-sm">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-900">Bundle Name</h2>
          <div className="flex gap-3">
            <Input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="flex-1"
            />
            <Button onClick={handleSaveName} isLoading={isSaving} disabled={bundleName === bundle.name}>
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Trustees */}
      <Card className="rounded-3xl border border-warm-200 bg-white shadow-sm">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-warm-900">Trustees</h2>
          </div>

          {bundle.trustees.length > 0 && (
            <div className="space-y-3">
              {bundle.trustees.map((trustee) => (
                <div
                  key={trustee.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-warm-100 bg-warm-50/80 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                      {(trustee.name || trustee.email).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium text-warm-900">{trustee.name || trustee.email}</p>
                      <p className="break-all text-sm text-warm-500">{trustee.email}</p>
                    </div>
                  </div>
                  {!bundle.released && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTrusteeToRemove({ id: trustee.id, name: trustee.name || '', email: trustee.email })}
                      className="flex-shrink-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!bundle.released && (
            <div className="space-y-3 border-t border-warm-100 pt-5">
              <h3 className="text-sm font-medium text-warm-700">Add Trustee</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="email"
                  value={newTrusteeEmail}
                  onChange={(e) => setNewTrusteeEmail(e.target.value)}
                  placeholder="Email address"
                />
                <Input
                  value={newTrusteeName}
                  onChange={(e) => setNewTrusteeName(e.target.value)}
                  placeholder="Name (optional)"
                />
              </div>
              <Button onClick={handleAddTrustee} isLoading={isSaving}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trustee
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Items */}
      <Card className="rounded-3xl border border-warm-200 bg-white shadow-sm">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-warm-900">Included Items</h2>
          </div>

          {bundle.items.length > 0 && (
            <div className="space-y-3">
              {bundle.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-warm-100 bg-warm-50/80 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      {item.type === 'file' ? <FileText className="h-5 w-5" /> : <StickyNote className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium text-warm-900">{item.name}</p>
                      <p className="text-xs text-warm-500">{item.type === 'file' ? 'File' : 'Note'}</p>
                    </div>
                  </div>
                  {!bundle.released && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setItemToRemove({ id: item.id, name: item.name })}
                      className="flex-shrink-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!bundle.released && (
            <div className="space-y-4 border-t border-warm-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-warm-800">Add Items to Bundle</h3>
                {showAddItems && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddItems(false)}
                  >
                    Hide
                  </Button>
                )}
              </div>

              {!showAddItems ? (
                <Button onClick={() => setShowAddItems(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Available Items
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-warm-500">Click the + icon to add an item to this bundle</p>
                  {availableItems
                    .filter((item) => !bundle.items.find((bi) => bi.id === item.id))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-warm-200 bg-white px-4 py-3 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warm-100">
                            {item.type === 'file' ? <FileText className="h-4 w-4 text-warm-600" /> : <StickyNote className="h-4 w-4 text-warm-600" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-warm-900">{item.name}</p>
                            <p className="text-xs text-warm-500">{item.type === 'file' ? 'File' : 'Note'}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(item.id)}
                          disabled={isSaving}
                          className="flex flex-shrink-0 items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                      </div>
                    ))}
                  {availableItems.filter((item) => !bundle.items.find((bi) => bi.id === item.id)).length === 0 && (
                    <div className="rounded-xl border border-dashed border-warm-200 bg-warm-50 px-4 py-8 text-center">
                      <p className="text-sm text-warm-500">All your items are already in this bundle</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button onClick={() => router.push('/app/bundles')}>
          Save and Back
        </Button>
      </div>

      {/* Remove Item Modal */}
      <Modal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        title="Remove Item"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-600">
            Are you sure you want to remove <strong>{itemToRemove?.name}</strong> from this bundle?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setItemToRemove(null)}>
              Cancel
            </Button>
            <Button variant="ghost" onClick={handleRemoveItem} className="text-red-600 hover:text-red-700">
              Remove Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Trustee Modal */}
      <Modal
        isOpen={!!trusteeToRemove}
        onClose={() => setTrusteeToRemove(null)}
        title="Remove Trustee"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-600">
            Are you sure you want to remove <strong>{trusteeToRemove?.name || trusteeToRemove?.email}</strong> from this bundle?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setTrusteeToRemove(null)}>
              Cancel
            </Button>
            <Button variant="ghost" onClick={handleRemoveTrustee} className="text-red-600 hover:text-red-700">
              Remove Trustee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
