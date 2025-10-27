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
import { encryptFile, generateIV, generateSalt, wrapKey, bytesToHex } from '@/lib/crypto';
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
  FolderOpen,
  Key,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Vault,
  Mail,
  Briefcase,
} from 'lucide-react';
import { getFileTypeInfo, canPreviewFile } from '@/lib/file-types';
import type { FileCategory } from '@/lib/file-types';
import { StorageIndicator } from '@/components/StorageIndicator';
import type { TierName } from '@/lib/pricing';
import { canUploadVideo, UPGRADE_MESSAGES } from '@/lib/pricing';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { SimpleRecordModal } from '@/components/SimpleRecordModal';
import { useThumbnail } from '@/hooks/useThumbnail';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

const CATEGORY_LABELS: Record<FileCategory, string> = {
  image: 'Image file',
  video: 'Video file',
  audio: 'Audio file',
  text: 'Document',
  pdf: 'PDF document',
  other: 'File',
};

type VaultTab = 'all' | 'images' | 'videos' | 'documents' | 'passwords' | 'other';

export default function ItemsPageClient() {
  const { metadata, addItem, getItemKey, session } = useCrypto();
  const { showToast } = useToast();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<ItemType>('file');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<VaultTab>('all');

  // Calculate days since last activity for warning banner
  const daysSinceActivity = metadata?.lastActivityAt
    ? Math.floor((Date.now() - new Date(metadata.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const tier = (metadata.tier as TierName) || 'free';

  const items = metadata.items.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Categorize items
  const categorizedItems = {
    passwords: items.filter(item => item.type === 'password'),
    cards: items.filter(item => item.type === 'card'),
    secureNotes: items.filter(item => item.type === 'secure_note'),
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

  // Get items for current tab
  const getItemsForTab = () => {
    switch (activeTab) {
      case 'images':
        return categorizedItems.images;
      case 'videos':
        return categorizedItems.videos;
      case 'documents':
        return categorizedItems.documents;
      case 'passwords':
        return [...categorizedItems.passwords, ...categorizedItems.cards, ...categorizedItems.secureNotes];
      case 'other':
        return [...categorizedItems.audio, ...categorizedItems.other];
      case 'all':
      default:
        return items;
    }
  };

  const tabItems = getItemsForTab();

  // Count items not in any bundles (for warning)
  const itemsNotInBundles = items.filter(item => {
    // Check if item is in any bundle
    const inBundle = metadata.bundles?.some(bundle =>
      bundle.items?.some((bundleItem: any) => bundleItem.itemId === item.id)
    );
    return !inBundle;
  }).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <MobilePageHeader
        title="My Vault"
        subtitle="All your encrypted files, passwords, and recordings in one secure place."
        icon={Vault}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowRecordModal(true)} size="sm" variant="secondary">
              <VideoIcon className="h-4 w-4" />
              <span className="ml-2">Record</span>
            </Button>
            <Button onClick={() => setShowAddModal(true)} size="sm">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Item</span>
            </Button>
          </div>
        }
      />

      {/* Inactivity Warning Banner */}
      {daysSinceActivity >= 540 && itemsNotInBundles > 0 && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Vault Storage Policy Notice
              </h3>
              <p className="text-sm text-amber-800 mb-3">
                You have {itemsNotInBundles} item{itemsNotInBundles !== 1 ? 's' : ''} not in any bundles.
                Items not in bundles will be deleted after <strong>2 years of inactivity</strong>.
                You've been inactive for <strong>{Math.floor(daysSinceActivity / 30)} months</strong>.
              </p>
              <p className="text-xs text-amber-700 mb-3">
                <strong>To protect these items:</strong> Add them to a bundle or log in regularly.
              </p>
              <Button
                onClick={() => router.push('/app/release')}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                Add Items to Bundle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Storage Indicator */}
      <StorageIndicator
        tier={tier}
        usedBytes={metadata.totalSize}
        limitBytes={metadata.storageLimit}
      />

      {/* Tabs */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            All ({items.length})
          </button>
          {categorizedItems.images.length > 0 && (
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'images'
                  ? 'bg-primary-500 text-white'
                  : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Images ({categorizedItems.images.length})
            </button>
          )}
          {categorizedItems.videos.length > 0 && (
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-primary-500 text-white'
                  : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
              }`}
            >
              <VideoIcon className="h-4 w-4" />
              Videos ({categorizedItems.videos.length})
            </button>
          )}
          {categorizedItems.documents.length > 0 && (
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-primary-500 text-white'
                  : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              Documents ({categorizedItems.documents.length})
            </button>
          )}
          {(categorizedItems.passwords.length > 0 || categorizedItems.cards.length > 0 || categorizedItems.secureNotes.length > 0) && (
            <button
              onClick={() => setActiveTab('passwords')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'passwords'
                  ? 'bg-primary-500 text-white'
                  : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
              }`}
            >
              <Key className="h-4 w-4" />
              Passwords ({categorizedItems.passwords.length + categorizedItems.cards.length + categorizedItems.secureNotes.length})
            </button>
          )}
          {(categorizedItems.audio.length > 0 || categorizedItems.other.length > 0) && (
            <button
              onClick={() => setActiveTab('other')}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'other'
                  ? 'bg-primary-500 text-white'
                  : 'bg-champagne-100 text-plum-700 hover:bg-champagne-200'
              }`}
            >
              <FileIcon className="h-4 w-4" />
              Other ({categorizedItems.audio.length + categorizedItems.other.length})
            </button>
          )}
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <Card className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-champagne-200 bg-champagne-50 text-plum-500">
              <Archive className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-semibold text-plum-900">No items yet</h3>
            <p className="mt-2 max-w-sm text-sm text-plum-600">
              Securely upload files or capture notes to begin curating your legacy inside Forebearer.
            </p>
            <Button onClick={() => setShowAddModal(true)} size="lg" className="mt-6">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add your first item</span>
            </Button>
          </div>
        </Card>
      ) : tabItems.length === 0 ? (
        <Card className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm text-plum-600">No items in this category</p>
          </div>
        </Card>
      ) : (
        <div className={`grid gap-4 ${activeTab === 'images' || activeTab === 'videos' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : ''}`}>
          {tabItems.map((item) => (
            <ItemCard key={item.id} item={item} viewMode={activeTab === 'images' || activeTab === 'videos' ? 'grid' : 'list'} />
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

      {/* Record Video/Audio Modal */}
      <SimpleRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  );
}

function ThumbnailImage({ itemId, itemName, isVideo }: { itemId: string; itemName: string; isVideo: boolean }) {
  const { thumbnail, isLoading } = useThumbnail(itemId, itemName, true);

  if (isLoading || !thumbnail) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-champagne-100 to-champagne-200">
        {isVideo ? (
          <div className="relative flex items-center justify-center">
            <VideoIcon className="h-12 w-12 text-plum-300 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center">
                <div className="h-0 w-0 border-l-[8px] border-l-plum-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        ) : (
          <ImageIcon className="h-12 w-12 text-plum-300 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <img
      src={thumbnail}
      alt={itemName}
      className="h-full w-full object-cover"
    />
  );
}

function ItemCard({ item, viewMode = 'list' }: { item: any; viewMode?: 'list' | 'grid' }) {
  const fileInfo = item.type === 'file' ? getFileTypeInfo(item.name) : null;

  const getDescription = () => {
    if (item.type === 'password') return 'Login credentials';
    if (item.type === 'card') return 'Credit card';
    if (item.type === 'secure_note') return 'Secure note';
    if (fileInfo) return CATEGORY_LABELS[fileInfo.category];
    return 'File';
  };

  const fileDescription = getDescription();

  const getIcon = () => {
    if (item.type === 'password') {
      return <Key className="w-4 h-4 text-plum-500" />;
    }
    if (item.type === 'card') {
      return <CreditCard className="w-4 h-4 text-plum-500" />;
    }
    if (item.type === 'secure_note') {
      return <Lock className="w-4 h-4 text-plum-500" />;
    }
    if (fileInfo) {
      switch (fileInfo.category) {
        case 'image':
          return <ImageIcon className="w-4 h-4 text-plum-500" />;
        case 'video':
          return <VideoIcon className="w-4 h-4 text-plum-500" />;
        case 'audio':
          return <MusicIcon className="w-4 h-4 text-plum-500" />;
        case 'text':
          return <FileText className="w-4 h-4 text-plum-500" />;
        default:
          return <FileIcon className="w-4 h-4 text-plum-500" />;
      }
    }
    return <FileText className="w-4 h-4 text-plum-500" />;
  };

  // Grid view for images/videos with thumbnails
  if (viewMode === 'grid') {
    const isImage = fileInfo?.category === 'image';
    const isVideo = fileInfo?.category === 'video';

    return (
      <Link href={`/app/items/${item.id}`} className="block">
        <Card className="group overflow-hidden border-champagne-200 p-0 transition-all hover:border-primary-300 hover:shadow-md">
          {/* Thumbnail */}
          <div className="relative aspect-square w-full overflow-hidden bg-champagne-100">
            {isImage || isVideo ? (
              <ThumbnailImage itemId={item.id} itemName={item.name} isVideo={isVideo} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getIcon()}
              </div>
            )}
            {isVideo && (
              <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                Video
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-3">
            <h3 className="truncate text-sm font-medium text-plum-900 group-hover:text-primary-700">
              {item.name}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-plum-500">{formatFileSize(item.size)}</p>
              <p className="text-xs text-plum-400">{formatDate(item.updatedAt)}</p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // List view (default)
  return (
    <Link href={`/app/items/${item.id}`} className="block">
      <Card className="group border-champagne-200 p-0 transition-all hover:border-primary-300">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-champagne-100 text-plum-600 group-hover:bg-primary-100 group-hover:text-primary-700">
              {getIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium text-plum-900">{item.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-plum-500">{fileDescription}</p>
                <span className="hidden sm:inline text-xs text-plum-400">•</span>
                <span className="hidden sm:inline text-xs text-plum-500">{formatFileSize(item.size)}</span>
                <span className="hidden md:inline text-xs text-plum-400">•</span>
                <span className="hidden md:inline text-xs text-plum-500">{formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-plum-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
        </div>
      </Card>
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Password/card/secure_note fields
  const [passwordName, setPasswordName] = useState('');
  const [passwordUrl, setPasswordUrl] = useState('');
  const [passwordUsername, setPasswordUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordNotes, setPasswordNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [secureNoteContent, setSecureNoteContent] = useState('');

  // Clear error when file changes or type changes
  React.useEffect(() => {
    setUploadError(null);
  }, [selectedFiles, type]);

  // Clear error and reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUploadError(null);
      setSelectedFiles([]);
      setCurrentFileIndex(0);
      setPasswordName('');
      setPasswordUrl('');
      setPasswordUsername('');
      setPassword('');
      setPasswordNotes('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setSecureNoteContent('');
      setShowPassword(false);
    }
  }, [isOpen]);

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

      // Check if adding these new videos would exceed the limit
      // For each new video, check if we can upload it given the running total
      if (newVideoCount > 0) {
        for (let i = 0; i < newVideoCount; i++) {
          if (!canUploadVideo(tier, currentVideoCount + i)) {
            const upgradeMsg = UPGRADE_MESSAGES.video_limit;
            setUploadError(upgradeMsg.message);
            return;
          }
        }
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

  const generateRandomPassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let newPassword = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
    setShowPassword(true);
  };

  const handleAddPassword = async () => {
    if (!passwordName.trim() || !password.trim()) {
      showToast('Please enter a name and password', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();

      // Encrypt password
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const passwordIv = generateIV();
      const passwordEncryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: passwordIv.buffer as ArrayBuffer },
        itemKey,
        passwordBytes.buffer as ArrayBuffer
      );

      // Encrypt notes if present
      let notesEncrypted, notesIV;
      if (passwordNotes) {
        const notesBytes = encoder.encode(passwordNotes);
        const notesIv = generateIV();
        const notesEncryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: notesIv.buffer as ArrayBuffer },
          itemKey,
          notesBytes.buffer as ArrayBuffer
        );
        notesEncrypted = bytesToHex(new Uint8Array(notesEncryptedBuffer));
        notesIV = bytesToHex(notesIv);
      }

      // Create item in database
      await addItem({
        type: 'password',
        name: passwordName,
        size: new Uint8Array(passwordEncryptedBuffer).length,
        itemKeySalt: '',
        url: passwordUrl || undefined,
        username: passwordUsername || undefined,
        passwordEncrypted: bytesToHex(new Uint8Array(passwordEncryptedBuffer)),
        passwordIV: bytesToHex(passwordIv),
        notesEncrypted,
        notesIV,
      }, itemKey);

      showToast('Password added successfully', 'success');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add password', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCard = async () => {
    if (!passwordName.trim() || !cardNumber.trim()) {
      showToast('Please enter a name and card number', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encoder = new TextEncoder();

      // Encrypt card number
      const cardBytes = encoder.encode(cardNumber);
      const cardIv = generateIV();
      const cardEncryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: cardIv.buffer as ArrayBuffer },
        itemKey,
        cardBytes.buffer as ArrayBuffer
      );

      // Encrypt expiry if present
      let cardExpiryEncrypted;
      if (cardExpiry) {
        const expiryBytes = encoder.encode(cardExpiry);
        const expiryIv = generateIV();
        const expiryEncryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: expiryIv.buffer as ArrayBuffer },
          itemKey,
          expiryBytes.buffer as ArrayBuffer
        );
        cardExpiryEncrypted = bytesToHex(new Uint8Array(expiryEncryptedBuffer));
      }

      // Encrypt CVV if present
      let cardCVVEncrypted, cardCVVIV;
      if (cardCVV) {
        const cvvBytes = encoder.encode(cardCVV);
        const cvvIv = generateIV();
        const cvvEncryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: cvvIv.buffer as ArrayBuffer },
          itemKey,
          cvvBytes.buffer as ArrayBuffer
        );
        cardCVVEncrypted = bytesToHex(new Uint8Array(cvvEncryptedBuffer));
        cardCVVIV = bytesToHex(cvvIv);
      }

      // Encrypt notes if present
      let notesEncrypted, notesIV;
      if (passwordNotes) {
        const notesBytes = encoder.encode(passwordNotes);
        const notesIv = generateIV();
        const notesEncryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: notesIv.buffer as ArrayBuffer },
          itemKey,
          notesBytes.buffer as ArrayBuffer
        );
        notesEncrypted = bytesToHex(new Uint8Array(notesEncryptedBuffer));
        notesIV = bytesToHex(notesIv);
      }

      await addItem({
        type: 'card',
        name: passwordName,
        size: new Uint8Array(cardEncryptedBuffer).length,
        itemKeySalt: '',
        username: passwordUsername || undefined,
        cardNumberEncrypted: bytesToHex(new Uint8Array(cardEncryptedBuffer)),
        cardExpiryEncrypted,
        cardCVVEncrypted,
        cardCVVIV,
        notesEncrypted,
        notesIV,
      }, itemKey);

      showToast('Card added successfully', 'success');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add card', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSecureNote = async () => {
    if (!passwordName.trim() || !secureNoteContent.trim()) {
      showToast('Please enter a name and content', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const { generateItemKey } = await import('@/lib/crypto');
      const itemKey = await generateItemKey();
      const encoder = new TextEncoder();

      // Encrypt secure note content
      const noteBytes = encoder.encode(secureNoteContent);
      const noteIv = generateIV();
      const noteEncryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: noteIv.buffer as ArrayBuffer },
        itemKey,
        noteBytes.buffer as ArrayBuffer
      );

      await addItem({
        type: 'secure_note',
        name: passwordName,
        size: new Uint8Array(noteEncryptedBuffer).length,
        itemKeySalt: '',
        notesEncrypted: bytesToHex(new Uint8Array(noteEncryptedBuffer)),
        notesIV: bytesToHex(noteIv),
      }, itemKey);

      showToast('Secure note added successfully', 'success');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add secure note', 'error');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (type === 'password') {
      handleAddPassword();
    } else if (type === 'card') {
      handleAddCard();
    } else if (type === 'secure_note') {
      handleAddSecureNote();
    } else {
      handleAddFile();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item" size="lg">
      <div className="space-y-6">
        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTypeChange('file')}
            className={`group relative p-4 rounded-xl border-2 transition-all ${
              type === 'file'
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                : 'border-champagne-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all ${
                type === 'file'
                  ? 'bg-primary-100'
                  : 'bg-champagne-100 group-hover:bg-primary-50'
              }`}>
                <FileText className={`w-5 h-5 ${type === 'file' ? 'text-primary-600' : 'text-plum-500 group-hover:text-primary-500'}`} />
              </div>
              <span className={`text-sm font-semibold ${type === 'file' ? 'text-primary-900' : 'text-plum-900'}`}>
                File Upload
              </span>
              <span className="text-xs text-plum-600 mt-0.5">Photos, documents & more</span>
            </div>
          </button>
          <button
            onClick={() => onTypeChange('password')}
            className={`group relative p-4 rounded-xl border-2 transition-all ${
              type === 'password'
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                : 'border-champagne-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all ${
                type === 'password'
                  ? 'bg-primary-100'
                  : 'bg-champagne-100 group-hover:bg-primary-50'
              }`}>
                <Key className={`w-5 h-5 ${type === 'password' ? 'text-primary-600' : 'text-plum-500 group-hover:text-primary-500'}`} />
              </div>
              <span className={`text-sm font-semibold ${type === 'password' ? 'text-primary-900' : 'text-plum-900'}`}>
                Password
              </span>
              <span className="text-xs text-plum-600 mt-0.5">Login credentials</span>
            </div>
          </button>
          <button
            onClick={() => onTypeChange('card')}
            className={`group relative p-4 rounded-xl border-2 transition-all ${
              type === 'card'
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                : 'border-champagne-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all ${
                type === 'card'
                  ? 'bg-primary-100'
                  : 'bg-champagne-100 group-hover:bg-primary-50'
              }`}>
                <CreditCard className={`w-5 h-5 ${type === 'card' ? 'text-primary-600' : 'text-plum-500 group-hover:text-primary-500'}`} />
              </div>
              <span className={`text-sm font-semibold ${type === 'card' ? 'text-primary-900' : 'text-plum-900'}`}>
                Credit Card
              </span>
              <span className="text-xs text-plum-600 mt-0.5">Payment information</span>
            </div>
          </button>
          <button
            onClick={() => onTypeChange('secure_note')}
            className={`group relative p-4 rounded-xl border-2 transition-all ${
              type === 'secure_note'
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                : 'border-champagne-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all ${
                type === 'secure_note'
                  ? 'bg-primary-100'
                  : 'bg-champagne-100 group-hover:bg-primary-50'
              }`}>
                <Lock className={`w-5 h-5 ${type === 'secure_note' ? 'text-primary-600' : 'text-plum-500 group-hover:text-primary-500'}`} />
              </div>
              <span className={`text-sm font-semibold ${type === 'secure_note' ? 'text-primary-900' : 'text-plum-900'}`}>
                Secure Note
              </span>
              <span className="text-xs text-plum-600 mt-0.5">Encrypted text</span>
            </div>
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
                <p className="text-sm font-medium text-warm-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                {selectedFiles.map((file, index) => (
                  <p key={index} className="text-xs text-warm-600">
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

        {/* Password Input */}
        {type === 'password' && (
          <div className="space-y-4">
            <Input
              label="Name"
              value={passwordName}
              onChange={(e) => setPasswordName(e.target.value)}
              placeholder="e.g., Gmail, Bank Account"
              disabled={isUploading}
            />
            <Input
              label="Website URL"
              value={passwordUrl}
              onChange={(e) => setPasswordUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isUploading}
            />
            <Input
              label="Username/Email"
              value={passwordUsername}
              onChange={(e) => setPasswordUsername(e.target.value)}
              placeholder="user@example.com"
              disabled={isUploading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-warm-900"
                  disabled={isUploading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors"
                    title="Generate password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={passwordNotes}
                onChange={(e) => setPasswordNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-plum-900"
                rows={3}
                placeholder="Additional notes..."
                disabled={isUploading}
              />
            </div>
          </div>
        )}

        {/* Card Input */}
        {type === 'card' && (
          <div className="space-y-4">
            <Input
              label="Card Name"
              value={passwordName}
              onChange={(e) => setPasswordName(e.target.value)}
              placeholder="e.g., Visa, Chase Sapphire"
              disabled={isUploading}
            />
            <Input
              label="Cardholder Name"
              value={passwordUsername}
              onChange={(e) => setPasswordUsername(e.target.value)}
              placeholder="John Doe"
              disabled={isUploading}
            />
            <Input
              label="Card Number *"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              disabled={isUploading}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
                disabled={isUploading}
              />
              <Input
                label="CVV"
                value={cardCVV}
                onChange={(e) => setCardCVV(e.target.value)}
                placeholder="123"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={passwordNotes}
                onChange={(e) => setPasswordNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-plum-900"
                rows={3}
                placeholder="Additional notes..."
                disabled={isUploading}
              />
            </div>
          </div>
        )}

        {/* Secure Note Input */}
        {type === 'secure_note' && (
          <div className="space-y-4">
            <Input
              label="Note Name"
              value={passwordName}
              onChange={(e) => setPasswordName(e.target.value)}
              placeholder="e.g., Recovery Codes, PIN"
              disabled={isUploading}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                value={secureNoteContent}
                onChange={(e) => setSecureNoteContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-plum-900"
                rows={8}
                placeholder="Enter your secure note content..."
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
              <p className="text-sm text-warm-700">
                Uploading file {currentFileIndex + 1} of {selectedFiles.length}: {selectedFiles[currentFileIndex]?.name}
              </p>
            )}
            <Progress
              value={uploadProgress}
              label={selectedFiles.length > 1 ? "Encrypting and uploading..." : "Encrypting and uploading..."}
              color="primary"
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
              : type === 'password'
              ? 'Add Password'
              : type === 'card'
              ? 'Add Card'
              : 'Add Secure Note'}
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
