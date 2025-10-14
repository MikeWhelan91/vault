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
import { FileText, StickyNote, Plus, Clock, HardDrive, ChevronRight, Archive, Image, Video, Music, File } from 'lucide-react';
import { getFileTypeInfo, canPreviewFile } from '@/lib/file-types';
import { StorageIndicator } from '@/components/StorageIndicator';
import type { TierName } from '@/lib/pricing';
import { canUploadVideo, UPGRADE_MESSAGES } from '@/lib/pricing';

export default function ItemsPage() {
  const { metadata, addItem, getItemKey, session } = useCrypto();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<ItemType>('file');

  if (!metadata) {
    return <div>Loading...</div>;
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-graphite-900">Items</h1>
          <p className="text-sm sm:text-base text-graphite-600 mt-1 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            {items.length} encrypted {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto sm:flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Storage Indicator */}
      <StorageIndicator
        tier={(metadata.tier as TierName) || 'free'}
        usedBytes={metadata.totalSize}
        limitBytes={metadata.storageLimit}
      />

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-graphite-100 flex items-center justify-center">
              <Archive className="w-8 h-8 text-graphite-400" />
            </div>
            <h3 className="text-xl font-semibold text-graphite-900 mb-2">
              No items yet
            </h3>
            <p className="text-graphite-600 mb-6">
              Start by adding your first encrypted file or note
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
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
              icon={<Image className="w-5 h-5" />}
              items={categorizedItems.images}
              count={categorizedItems.images.length}
            />
          )}

          {/* Videos */}
          {categorizedItems.videos.length > 0 && (
            <CategorySection
              title="Videos"
              icon={<Video className="w-5 h-5" />}
              items={categorizedItems.videos}
              count={categorizedItems.videos.length}
            />
          )}

          {/* Audio */}
          {categorizedItems.audio.length > 0 && (
            <CategorySection
              title="Audio"
              icon={<Music className="w-5 h-5" />}
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
              icon={<File className="w-5 h-5" />}
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
    <div className="border border-graphite-200 rounded">
      {/* Category Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-graphite-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-graphite-700">
            {icon}
            <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
          </div>
          <span className="text-xs text-graphite-400">
            {count}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 text-graphite-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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

  const getIcon = () => {
    if (item.type === 'note') {
      return <StickyNote className="w-4 h-4 text-graphite-500" />;
    }
    if (fileInfo) {
      switch (fileInfo.category) {
        case 'image':
          return <Image className="w-4 h-4 text-graphite-500" />;
        case 'video':
          return <Video className="w-4 h-4 text-graphite-500" />;
        case 'audio':
          return <Music className="w-4 h-4 text-graphite-500" />;
        case 'text':
          return <FileText className="w-4 h-4 text-graphite-500" />;
        default:
          return <File className="w-4 h-4 text-graphite-500" />;
      }
    }
    return <FileText className="w-4 h-4 text-graphite-500" />;
  };

  return (
    <Link href={`/app/items/${item.id}`}>
      <div className="group flex items-center gap-3 px-4 py-3 bg-white hover:bg-graphite-50 transition-colors">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm text-graphite-900 truncate">
              {item.name}
            </h3>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-graphite-500">
            <span className="w-20 text-right">{formatFileSize(item.size)}</span>
            <span className="w-24 text-right">{formatDate(item.updatedAt)}</span>
          </div>

          <ChevronRight className="w-4 h-4 text-graphite-300 flex-shrink-0" />
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Clear error when file changes or type changes
  React.useEffect(() => {
    setUploadError(null);
  }, [selectedFile, type]);

  // Clear error and reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUploadError(null);
      setSelectedFile(null);
      setNoteName('');
      setNoteContent('');
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
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    // Check if this is a video file
    const fileInfo = getFileTypeInfo(selectedFile.name);
    const isVideo = fileInfo.category === 'video';

    // If it's a video, check video limits for free tier
    if (isVideo && metadata) {
      const tier = (metadata.tier as TierName) || 'free';
      const currentVideoCount = metadata.items.filter(item => {
        if (item.type !== 'file') return false;
        const itemFileInfo = getFileTypeInfo(item.name);
        return itemFileInfo.category === 'video';
      }).length;

      if (!canUploadVideo(tier, currentVideoCount)) {
        const upgradeMsg = UPGRADE_MESSAGES.video_limit;
        setUploadError(upgradeMsg.message);
        return;
      }
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      // Read file data, generate key, and encrypt
      const fileData = await readFileAsArrayBuffer(selectedFile);
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encryptedData = await encryptFile(new Uint8Array(fileData), itemKey);

      // Create item metadata in database (this also stores wrapped key)
      const item = await addItem({
        type: 'file',
        name: selectedFile.name,
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

      showToast('File uploaded successfully', 'success');
      onClose();
      setSelectedFile(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to upload file', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
              onFileSelect={setSelectedFile}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-graphite-600">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
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
          <Progress
            value={uploadProgress}
            label="Encrypting and uploading..."
            color="blue"
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isUploading}>
            {type === 'file' ? 'Upload File' : 'Add Note'}
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
