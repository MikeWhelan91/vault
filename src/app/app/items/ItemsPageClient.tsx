'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { Progress } from '@/components/ui/Progress';
import { encryptFile } from '@/lib/crypto';
import { uploadObject } from '@/lib/r2-client';
import type { ItemType } from '@/types';
import {
  FileText,
  StickyNote,
  Plus,
  Archive,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  File as FileIcon,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { getFileTypeInfo, canPreviewFile } from '@/lib/file-types';
import type { FileCategory } from '@/lib/file-types';
import { StorageIndicator } from '@/components/StorageIndicator';
import type { TierName } from '@/lib/pricing';
import { canUploadVideo, UPGRADE_MESSAGES } from '@/lib/pricing';

const CATEGORY_LABELS: Record<FileCategory, string> = {
  image: 'Image file',
  video: 'Video file',
  audio: 'Audio file',
  text: 'Document',
  pdf: 'PDF document',
  other: 'File',
};

export default function ItemsPageClient() {
  const { metadata, addItem, getItemKey, session } = useCrypto();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<ItemType>('file');

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';

  const items = metadata.items.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Categorize items
  const categorizedItems = {
    notes: items.filter(item => item.type === 'note'),
    images: items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'image';
    }),
    videos: items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'video';
    }),
    audio: items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'audio';
    }),
    documents: items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'text' || fileInfo.category === 'pdf';
    }),
    other: items.filter(item => {
      if (item.type !== 'file') return false;
      const fileInfo = getFileTypeInfo(item.name);
      return fileInfo.category === 'other';
    }),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-graphite-900">Your encrypted items</h1>
            <p className="mt-2 text-sm text-graphite-600">
              {items.length === 0
                ? 'Upload files or notes to start building your protected estate.'
                : `Organise ${items.length} encrypted ${items.length === 1 ? 'asset' : 'assets'} by type, preview metadata, and manage storage.`}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setShowAddModal(true)} size="lg">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add new item</span>
            </Button>
            {tier === 'free' && (
              <Link href="/app/pricing">
                <Button variant="secondary" size="lg">
                  Expand storage
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Storage Indicator */}
      <StorageIndicator
        tier={tier}
        usedBytes={metadata.totalSize}
        limitBytes={metadata.storageLimit}
      />

      {/* Items List */}
      {items.length === 0 ? (
        <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-graphite-200 bg-graphite-50 text-graphite-500">
              <Archive className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-graphite-900">No items yet</h3>
            <p className="mt-2 max-w-sm text-sm text-graphite-600">
              Securely upload files or capture notes to begin curating your legacy inside Forebearer.
            </p>
            <Button onClick={() => setShowAddModal(true)} size="lg" className="mt-6">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add your first item</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Notes */}
          {categorizedItems.notes.length > 0 && (
            <CategorySection
              title="Notes"
              icon={<StickyNote className="w-5 h-5" />}
              items={categorizedItems.notes}
              count={categorizedItems.notes.length}
            />
          )}

          {/* Images */}
          {categorizedItems.images.length > 0 && (
            <CategorySection
              title="Images"
              icon={<ImageIcon className="w-5 h-5" />}
              items={categorizedItems.images}
              count={categorizedItems.images.length}
            />
          )}

          {/* Videos */}
          {categorizedItems.videos.length > 0 && (
            <CategorySection
              title="Videos"
              icon={<VideoIcon className="w-5 h-5" />}
              items={categorizedItems.videos}
              count={categorizedItems.videos.length}
            />
          )}

          {/* Audio */}
          {categorizedItems.audio.length > 0 && (
            <CategorySection
              title="Audio"
              icon={<MusicIcon className="w-5 h-5" />}
              items={categorizedItems.audio}
              count={categorizedItems.audio.length}
            />
          )}

          {/* Documents */}
          {categorizedItems.documents.length > 0 && (
            <CategorySection
              title="Documents"
              icon={<FileText className="w-5 h-5" />}
              items={categorizedItems.documents}
              count={categorizedItems.documents.length}
            />
          )}

          {/* Other Files */}
          {categorizedItems.other.length > 0 && (
            <CategorySection
              title="Other Files"
              icon={<FileIcon className="w-5 h-5" />}
              items={categorizedItems.other}
              count={categorizedItems.other.length}
            />
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={addType}
        onTypeChange={setAddType}
      />
    </div>
  );
}

function CategorySection({
  title,
  icon,
  items,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  count: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
      {/* Category Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-graphite-900">{title}</h2>
            <p className="text-xs text-graphite-500">{count} {count === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-graphite-200 text-graphite-500 transition-transform">
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Items List */}
      {isExpanded && (
        <div className="divide-y divide-graphite-100">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item }: { item: any }) {
  const fileInfo = item.type === 'file' ? getFileTypeInfo(item.name) : null;
  const hasPreview = item.type === 'note' || (item.type === 'file' && canPreviewFile(item.name));
  const fileDescription = item.type === 'note'
    ? 'Secure note'
    : fileInfo
      ? CATEGORY_LABELS[fileInfo.category]
      : 'File';

  const getIcon = () => {
    if (item.type === 'note') {
      return <StickyNote className="w-4 h-4 text-graphite-500" />;
    }
    if (fileInfo) {
      switch (fileInfo.category) {
        case 'image':
          return <ImageIcon className="w-4 h-4 text-graphite-500" />;
        case 'video':
          return <VideoIcon className="w-4 h-4 text-graphite-500" />;
        case 'audio':
          return <MusicIcon className="w-4 h-4 text-graphite-500" />;
        case 'text':
          return <FileText className="w-4 h-4 text-graphite-500" />;
        default:
          return <FileIcon className="w-4 h-4 text-graphite-500" />;
      }
    }
    return <FileText className="w-4 h-4 text-graphite-500" />;
  };

  return (
    <Link href={`/app/items/${item.id}`} className="block">
      <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-primary-50/60">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-graphite-100 text-graphite-600 group-hover:bg-primary-100 group-hover:text-primary-700">
          {getIcon()}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-graphite-900">{item.name}</h3>
            <p className="mt-1 text-xs text-graphite-500">{fileDescription}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-6 text-xs text-graphite-500 md:flex">
            <span className="w-20 text-right font-medium text-graphite-700">{formatFileSize(item.size)}</span>
            <span className="w-28 text-right">{formatDate(item.updatedAt)}</span>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-graphite-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
        </div>
      </div>
    </Link>
  );
}

function AddItemModal({
  isOpen,
  onClose,
  type,
  onTypeChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: ItemType;
  onTypeChange: (type: ItemType) => void;
}) {
  const { metadata, addItem, getItemKey, session } = useCrypto();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [noteName, setNoteName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Clear error when file changes or type changes
  React.useEffect(() => {
    setUploadError(null);
  }, [selectedFiles, type]);

  // Clear error and reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUploadError(null);
      setSelectedFiles([]);
      setNoteName('');
      setNoteContent('');
      setCurrentFileIndex(0);
    }
  }, [isOpen]);

  const handleAddNote = async () => {
    if (!noteName.trim() || !noteContent.trim()) {
      showToast('Please enter a name and content for your note', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // Generate new item key and encrypt content
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encryptedData = await encryptFile(noteContent, itemKey);

      // Create item metadata in database (this also stores wrapped key)
      const item = await addItem({
        type: 'note',
        name: noteName,
        size: encryptedData.length,
        itemKeySalt: '',
      }, itemKey);

      try {
        // Upload encrypted data to R2
        await uploadObject(
          session.userId,
          item.id,
          1,
          encryptedData,
          (progress) => setUploadProgress(progress.percentage)
        );
      } catch (uploadError) {
        // If R2 upload fails, delete the database entry to keep things consistent
        console.error('R2 upload failed, cleaning up database entry:', uploadError);
        await fetch(`/api/items/${item.id}?userId=${session.dbUserId}`, {
          method: 'DELETE',
        });
        throw new Error('Upload failed. Please try again.');
      }

      showToast('Note added successfully', 'success');
      onClose();
      setNoteName('');
      setNoteContent('');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add note', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddFile = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one file');
      return;
    }

    // Check video limits if any file is a video
    if (metadata) {
      const tier = (metadata.tier as TierName) || 'free';
      const currentVideoCount = metadata.items.filter(item => {
        if (item.type !== 'file') return false;
        const itemFileInfo = getFileTypeInfo(item.name);
        return itemFileInfo.category === 'video';
      }).length;

      let newVideoCount = 0;
      for (const file of selectedFiles) {
        const fileInfo = getFileTypeInfo(file.name);
        if (fileInfo.category === 'video') {
          newVideoCount++;
        }
      }

      if (newVideoCount > 0 && !canUploadVideo(tier, currentVideoCount + newVideoCount - 1)) {
        const upgradeMsg = UPGRADE_MESSAGES.video_limit;
        setUploadError(upgradeMsg.message);
        return;
      }
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const { generateItemKey } = await import('@/lib/crypto');

      // Upload each file sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = selectedFiles[i];

        // Read file data, generate key, and encrypt
        const fileData = await readFileAsArrayBuffer(file);
        const itemKey = await generateItemKey();
        const encryptedData = await encryptFile(new Uint8Array(fileData), itemKey);

        // Create item metadata in database (this also stores wrapped key)
        const item = await addItem({
          type: 'file',
          name: file.name,
          size: encryptedData.length,
          itemKeySalt: '',
        }, itemKey);

        try {
          // Upload encrypted data to R2
          await uploadObject(
            session.userId,
            item.id,
            1,
            encryptedData,
            (progress) => setUploadProgress(progress.percentage)
          );
        } catch (uploadError) {
          // If R2 upload fails, delete the database entry to keep things consistent
          console.error('R2 upload failed, cleaning up database entry:', uploadError);
          await fetch(`/api/items/${item.id}?userId=${session.dbUserId}`, {
            method: 'DELETE',
          });
          throw new Error(`Upload failed for "${file.name}". Please try again.`);
        }
      }

      const fileCount = selectedFiles.length;
      showToast(`${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully`, 'success');
      onClose();
      setSelectedFiles([]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to upload files', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  const handleSubmit = () => {
    if (type === 'note') {
      handleAddNote();
    } else {
      handleAddFile();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item" size="lg">
      <div className="space-y-6">
        {/* Type Selector */}
        <div className="flex gap-4">
          <button
            onClick={() => onTypeChange('file')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-colors
              ${
                type === 'file'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-graphite-200 hover:border-graphite-300'
              }
            `}
          >
            <FileText className={`w-8 h-8 mx-auto mb-2 ${type === 'file' ? 'text-primary-600' : 'text-graphite-400'}`} />
            <span className="font-medium text-graphite-900">File</span>
          </button>
          <button
            onClick={() => onTypeChange('note')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-colors
              ${
                type === 'note'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-graphite-200 hover:border-graphite-300'
              }
            `}
          >
            <StickyNote className={`w-8 h-8 mx-auto mb-2 ${type === 'note' ? 'text-primary-600' : 'text-graphite-400'}`} />
            <span className="font-medium text-graphite-900">Note</span>
          </button>
        </div>

        {/* File Upload */}
        {type === 'file' && (
          <div>
            <FileUpload
              onFileSelect={(files) => {
                if (Array.isArray(files)) {
                  setSelectedFiles(files);
                } else {
                  setSelectedFiles([files]);
                }
              }}
              disabled={isUploading}
              multiple={metadata && (metadata.tier as TierName) === 'plus'}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-graphite-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                {selectedFiles.map((file, index) => (
                  <p key={index} className="text-xs text-graphite-600">
                    • {file.name} ({formatFileSize(file.size)})
                  </p>
                ))}
              </div>
            )}
            {metadata && (metadata.tier as TierName) === 'free' && (
              <p className="mt-2 text-xs text-amber-600">
                Upgrade to Plus to upload multiple files at once
              </p>
            )}
          </div>
        )}

        {/* Note Input */}
        {type === 'note' && (
          <div className="space-y-4">
            <Input
              label="Note Name"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="My Secret Note"
              disabled={isUploading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
                rows={8}
                placeholder="Enter your note content..."
                disabled={isUploading}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{uploadError}</p>
            <Link href="/app/pricing" className="text-sm font-medium text-red-600 hover:text-red-700 underline mt-2 inline-block">
              Upgrade to Plus
            </Link>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="space-y-2">
            {selectedFiles.length > 1 && (
              <p className="text-sm text-graphite-700">
                Uploading file {currentFileIndex + 1} of {selectedFiles.length}: {selectedFiles[currentFileIndex]?.name}
              </p>
            )}
            <Progress
              value={uploadProgress}
              label={selectedFiles.length > 1 ? "Encrypting and uploading..." : "Encrypting and uploading..."}
              color="blue"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isUploading}>
            {type === 'file'
              ? (selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload File')
              : 'Add Note'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
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
