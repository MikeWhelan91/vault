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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-graphite-900">Items</h1>
          <p className="text-graphite-600 mt-1">
            {items.length} encrypted {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Item</Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-graphite-900 mb-2">
              No items yet
            </h3>
            <p className="text-graphite-600 mb-6">
              Start by adding your first encrypted file or note
            </p>
            <Button onClick={() => setShowAddModal(true)}>Add Your First Item</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Link key={item.id} href={`/app/items/${item.id}`}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">
                      {item.type === 'file' ? '📄' : '📝'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-graphite-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-graphite-500">
                        {formatFileSize(item.size)} •{' '}
                        {item.type === 'file' ? 'File' : 'Note'} •{' '}
                        Updated {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Card>
            </Link>
          ))}
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
  const { addItem, getItemKey, session } = useCrypto();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [noteName, setNoteName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

      // Upload encrypted data to R2
      await uploadObject(
        session.userId,
        item.id,
        1,
        encryptedData,
        (progress) => setUploadProgress(progress.percentage)
      );

      showToast('Note added successfully', 'success');
      onClose();
      setNoteName('');
      setNoteContent('');
    } catch (error) {
      showToast('Failed to add note', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddFile = async () => {
    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }

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

      // Upload encrypted data to R2
      await uploadObject(
        session.userId,
        item.id,
        1,
        encryptedData,
        (progress) => setUploadProgress(progress.percentage)
      );

      showToast('File uploaded successfully', 'success');
      onClose();
      setSelectedFile(null);
    } catch (error) {
      showToast('Failed to upload file', 'error');
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
                  ? 'border-blue-500 bg-primary-50'
                  : 'border-graphite-200'
              }
            `}
          >
            <span className="text-3xl block mb-2">📄</span>
            <span className="font-medium text-graphite-900">File</span>
          </button>
          <button
            onClick={() => onTypeChange('note')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-colors
              ${
                type === 'note'
                  ? 'border-blue-500 bg-primary-50'
                  : 'border-graphite-200'
              }
            `}
          >
            <span className="text-3xl block mb-2">📝</span>
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
