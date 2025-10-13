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
import {
  FileText,
  StickyNote,
  Download,
  Trash2,
  ArrowLeft,
  Calendar,
  HardDrive,
  Hash,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MediaViewer } from '@/components/media/MediaViewer';
import { getFileTypeInfo, canPreviewFile } from '@/lib/file-types';

export default function ItemViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { metadata, getItemKey, removeItem, session } = useCrypto();
  const { showToast } = useToast();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const unwrappedParams = React.use(params);

  useEffect(() => {
    if (metadata) {
      const foundItem = metadata.items.find((i) => i.id === unwrappedParams.id);
      setItem(foundItem || null);
      setIsLoading(false);

      // Auto-load notes and previewable files
      if (foundItem) {
        if (foundItem.type === 'note' || canPreviewFile(foundItem.name)) {
          loadContent(foundItem);
        }
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
      const decryptedDataBuffer = await decryptFile(encryptedData, itemKey);

      setDownloadProgress(90);

      // Store decrypted data
      setDecryptedData(decryptedDataBuffer);

      // Convert to string for notes
      if (itemToLoad.type === 'note') {
        const content = new TextDecoder().decode(decryptedDataBuffer);
        setDecryptedContent(content);
      }

      setDownloadProgress(100);
      showToast('Content loaded successfully', 'success');
    } catch (error: any) {
      console.error('Failed to load content:', error);

      // Show more specific error message for 404s
      if (error?.statusCode === 404) {
        showToast('File not found in storage. This item may be corrupted.', 'error');
      } else {
        showToast('Failed to load content', 'error');
      }
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
        <p className="text-graphite-500">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-graphite-900 mb-2">
            Item Not Found
          </h2>
          <p className="text-graphite-600 mb-6">
            The item you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/app/items')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/app/items')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Items
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        <Card>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center">
              {item.type === 'file' ? (
                <FileText className="w-8 h-8 text-primary-600" />
              ) : (
                <StickyNote className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900 break-words">
                {item.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-graphite-600">
                <span className="flex items-center gap-1.5">
                  {item.type === 'file' ? <FileText className="w-4 h-4" /> : <StickyNote className="w-4 h-4" />}
                  {item.type === 'file' ? 'File' : 'Note'}
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  {formatFileSize(item.size)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Card>
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

      {/* File Content - Media Viewer */}
      {item.type === 'file' && !isDownloading && (
        <>
          {decryptedData && canPreviewFile(item.name) ? (
            <MediaViewer
              filename={item.name}
              data={decryptedData}
              onDownload={handleDownloadFile}
            />
          ) : !decryptedData ? (
            <Card>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <Download className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-graphite-600 mb-4">
                  {canPreviewFile(item.name)
                    ? 'Click below to load preview'
                    : 'Preview not available for this file type'}
                </p>
                <Button onClick={() => loadContent(item)} size="lg">
                  {canPreviewFile(item.name) ? 'Load Preview' : 'Download File'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-graphite-600 mb-4">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownloadFile} size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Note Content */}
      {item.type === 'note' && (
        <Card>
          <h2 className="text-xl font-semibold text-graphite-900 mb-4">
            Content
          </h2>
          {decryptedContent ? (
            <div className="bg-graphite-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {decryptedContent}
            </div>
          ) : isDownloading ? (
            <div className="text-center py-8 text-graphite-500">
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
        <h2 className="text-xl font-semibold text-graphite-900 mb-6 flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Metadata
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetadataItem
            icon={<Hash className="w-5 h-5 text-graphite-400" />}
            label="ID"
            value={item.id}
          />
          <MetadataItem
            icon={item.type === 'file' ? <FileText className="w-5 h-5 text-graphite-400" /> : <StickyNote className="w-5 h-5 text-graphite-400" />}
            label="Type"
            value={item.type}
          />
          <MetadataItem
            icon={<HardDrive className="w-5 h-5 text-graphite-400" />}
            label="Size"
            value={formatFileSize(item.size)}
          />
          <MetadataItem
            icon={<Hash className="w-5 h-5 text-graphite-400" />}
            label="Version"
            value={item.version.toString()}
          />
          <MetadataItem
            icon={<Calendar className="w-5 h-5 text-graphite-400" />}
            label="Created"
            value={new Date(item.createdAt).toLocaleString()}
          />
          <MetadataItem
            icon={<Clock className="w-5 h-5 text-graphite-400" />}
            label="Updated"
            value={new Date(item.updatedAt).toLocaleString()}
          />
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Item"
      >
        <div className="space-y-4">
          <p className="text-graphite-600">
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

function MetadataItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-graphite-50">
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-700 mb-1">{label}</dt>
        <dd className="text-sm text-graphite-600 font-mono break-all">{value}</dd>
      </div>
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
