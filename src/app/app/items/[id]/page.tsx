'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { decryptFile } from '@/lib/crypto';
import { downloadObject, deleteObject } from '@/lib/r2-client';
import type { VaultItem } from '@/types';

export default function ItemViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { metadata, getItemKey, removeItem, session } = useCrypto();
  const { showToast } = useToast();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const unwrappedParams = React.use(params);

  useEffect(() => {
    if (metadata) {
      const foundItem = metadata.items.find((i) => i.id === unwrappedParams.id);
      setItem(foundItem || null);
      setIsLoading(false);

      // Auto-load notes
      if (foundItem && foundItem.type === 'note') {
        loadContent(foundItem);
      }
    }
  }, [metadata, unwrappedParams.id]);

  const loadContent = async (itemToLoad: VaultItem) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Download encrypted data
      setDownloadProgress(30);
      const encryptedData = await downloadObject(
        session.userId,
        itemToLoad.id,
        itemToLoad.version
      );

      setDownloadProgress(60);

      // Get item key and decrypt
      const itemKey = await getItemKey(itemToLoad.id);
      const decryptedData = await decryptFile(encryptedData, itemKey);

      setDownloadProgress(90);

      // Convert to string for notes
      const content = new TextDecoder().decode(decryptedData);
      setDecryptedContent(content);

      setDownloadProgress(100);
      showToast('Content loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load content:', error);
      showToast('Failed to load content', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadFile = async () => {
    if (!item) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Download encrypted data
      setDownloadProgress(30);
      const encryptedData = await downloadObject(
        session.userId,
        item.id,
        item.version
      );

      setDownloadProgress(60);

      // Get item key and decrypt
      const itemKey = await getItemKey(item.id);
      const decryptedData = await decryptFile(encryptedData, itemKey);

      setDownloadProgress(90);

      // Trigger download
      const blob = new Blob([new Uint8Array(decryptedData)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadProgress(100);
      showToast('File downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download file:', error);
      showToast('Failed to download file', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);

    try {
      // Delete from R2
      await deleteObject(session.userId, item.id, item.version);

      // Remove from metadata
      removeItem(item.id);

      showToast('Item deleted successfully', 'success');
      router.push('/app/items');
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('Failed to delete item', 'error');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <Card>
        <div className="text-center py-12">
          <span className="text-6xl block mb-4">❓</span>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Item Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The item you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/app/items')}>
            Back to Items
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{item.type === 'file' ? '📄' : '📝'}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {item.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formatFileSize(item.size)} •{' '}
              {item.type === 'file' ? 'File' : 'Note'} •{' '}
              Created {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/app/items')}
          >
            ← Back
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <Card>
          <Progress
            value={downloadProgress}
            label="Downloading and decrypting..."
            color="blue"
            size="lg"
          />
        </Card>
      )}

      {/* File Actions */}
      {item.type === 'file' && !isDownloading && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click below to download and decrypt this file
            </p>
            <Button onClick={handleDownloadFile} size="lg">
              📥 Download File
            </Button>
          </div>
        </Card>
      )}

      {/* Note Content */}
      {item.type === 'note' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Content
          </h2>
          {decryptedContent ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {decryptedContent}
            </div>
          ) : isDownloading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={() => loadContent(item)}>
                Load Content
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Metadata
        </h2>
        <dl className="space-y-2">
          <MetadataRow label="ID" value={item.id} />
          <MetadataRow label="Type" value={item.type} />
          <MetadataRow label="Size" value={formatFileSize(item.size)} />
          <MetadataRow label="Version" value={item.version.toString()} />
          <MetadataRow label="Created" value={new Date(item.createdAt).toLocaleString()} />
          <MetadataRow label="Updated" value={new Date(item.updatedAt).toLocaleString()} />
        </dl>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Item"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{item.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
      <dt className="font-medium text-gray-700 dark:text-gray-300">{label}</dt>
      <dd className="text-gray-600 dark:text-gray-400 font-mono text-sm">{value}</dd>
    </div>
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
