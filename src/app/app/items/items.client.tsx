'use client';

import React, { useMemo, useState } from 'react';
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

export default function ItemsClient() {
  const { metadata } = useCrypto();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<ItemType>('file');

  const items = useMemo(() => {
    if (!metadata) return [];
    return [...metadata.items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [metadata]);

  if (!metadata) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-graphite-500">
        Loading your encrypted catalogue...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="gradient-panel relative overflow-hidden p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-graphite-500">
              Secure archive
            </span>
            <h1 className="text-4xl font-light tracking-tight text-graphite-900 dark:text-ivory-50">
              Encrypted items
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-graphite-600 dark:text-graphite-300">
              Organise files, notes, and operational runbooks in one encrypted stream. Every item remains wrapped in zero-knowledge encryption until you release it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-6" onClick={() => setShowAddModal(true)}>
                Add new item
              </Button>
              <Link href="/app/release">
                <Button size="lg" variant="secondary" className="rounded-full px-6">
                  Build release bundle
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="rounded-2xl border border-white/50 bg-white/80 px-5 py-4 text-sm shadow-sm backdrop-blur dark:border-graphite-700/70 dark:bg-graphite-900/70">
              <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">Inventory</p>
              <p className="mt-2 text-3xl font-light text-graphite-900 dark:text-ivory-50">{items.length}</p>
              <p className="text-xs text-graphite-500 dark:text-graphite-300">Total encrypted items</p>
            </div>
            <div className="placeholder-box h-28 w-48 border border-graphite-200/60 dark:border-graphite-700/60" aria-hidden />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-medium text-graphite-900 dark:text-ivory-50">Catalogue</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">Sorted by most recent updates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TogglePill label="Files" active={addType === 'file'} onClick={() => setAddType('file')} />
            <TogglePill label="Notes" active={addType === 'note'} onClick={() => setAddType('note')} />
            <Button className="rounded-full px-6" onClick={() => setShowAddModal(true)}>
              + Add
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
            <div className="placeholder-box h-28 w-28 border border-graphite-200/60 dark:border-graphite-700/60" aria-hidden />
            <h3 className="text-lg font-medium text-graphite-900 dark:text-ivory-50">No encrypted items yet</h3>
            <p className="max-w-md text-sm text-graphite-500 dark:text-graphite-300">
              Start by encrypting a document or capturing a secure note. You can combine items into release bundles whenever you are ready.
            </p>
            <Button className="rounded-full px-6" onClick={() => setShowAddModal(true)}>
              Create your first item
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/app/items/${item.id}`} className="block">
                <Card hover className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-graphite-900 text-ivory-50 text-lg">
                      {item.type === 'file' ? '📁' : '🗒️'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-graphite-900 dark:text-ivory-50">{item.name}</p>
                      <p className="text-xs text-graphite-500 dark:text-graphite-300">
                        {formatFileSize(item.size)} • {item.type === 'file' ? 'File' : 'Note'} • Updated {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg text-graphite-300">→</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

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
  const { addItem, session } = useCrypto();
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
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encryptedData = await encryptFile(noteContent, itemKey);

      const item = await addItem(
        {
          type: 'note',
          name: noteName,
          size: encryptedData.length,
          itemKeySalt: '',
        },
        itemKey
      );

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
      console.error(error);
      showToast('Failed to add note', 'error');
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
      const fileData = await readFileAsArrayBuffer(selectedFile);
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encryptedData = await encryptFile(new Uint8Array(fileData), itemKey);

      const item = await addItem(
        {
          type: 'file',
          name: selectedFile.name,
          size: encryptedData.length,
          itemKeySalt: '',
        },
        itemKey
      );

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
      console.error(error);
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (type === 'note') {
      await handleAddNote();
    } else {
      await handleAddFile();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Add encrypted item">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <TogglePill label="File" active={type === 'file'} onClick={() => onTypeChange('file')} />
          <TogglePill label="Secure note" active={type === 'note'} onClick={() => onTypeChange('note')} />
        </div>

        <p className="text-sm text-graphite-500 dark:text-graphite-300">
          Items are encrypted locally before upload. You can add them to release bundles after they sync.
        </p>

        {type === 'note' ? (
          <div className="space-y-4">
            <Input
              label="Note title"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="e.g. Incident response playbook"
            />
            <textarea
              className="h-40 w-full rounded-2xl border border-graphite-200/70 bg-white p-4 text-sm text-graphite-900 shadow-inner transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-graphite-600 dark:bg-graphite-900 dark:text-ivory-50"
              placeholder="Write your encrypted note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <FileUpload onFileSelect={setSelectedFile} />
            {selectedFile && (
              <div className="rounded-2xl border border-graphite-200/70 bg-white/80 p-4 text-sm dark:border-graphite-600 dark:bg-graphite-900/70">
                <p className="font-medium text-graphite-900 dark:text-ivory-50">{selectedFile.name}</p>
                <p className="text-xs text-graphite-500 dark:text-graphite-300">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} label={`${uploadProgress.toFixed(0)}% encrypted`} />
            <p className="text-xs text-graphite-500 dark:text-graphite-300">
              Keep this tab open until the upload completes.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="rounded-full px-6" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button className="rounded-full px-6" onClick={handleSubmit} isLoading={isUploading}>
            {type === 'note' ? 'Encrypt note' : 'Encrypt file'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-graphite-900 bg-graphite-900 text-white dark:border-ivory-100 dark:bg-ivory-100 dark:text-graphite-900'
          : 'border-graphite-200 bg-white text-graphite-600 hover:text-graphite-900 dark:border-graphite-600 dark:bg-graphite-900 dark:text-ivory-400'
      }`}
    >
      {label}
    </button>
  );
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
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
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
