'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { decryptFile, deriveBundleKey, unwrapKey, hexToBytes } from '@/lib/crypto';

interface ReleaseData {
  bundle: {
    name: string;
    createdAt: string;
    bundleNoteEncrypted: string | null;
    bundleNoteIV: string | null;
  };
  user: {
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    type: 'file' | 'note';
    size: string;
    r2Key: string;
    bundleWrappedKey: string | null;
    bundleWrappedKeyIV: string | null;
  }>;
}

export default function ReleasePage() {
  const params = useParams();
  const token = params.token as string;

  const [release, setRelease] = useState<ReleaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const response = await fetch(`/api/release/${token}`);

        if (!response.ok) {
          throw new Error('Release not found');
        }

        const data = await response.json();
        setRelease(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load release');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelease();
  }, [token]);

  const handleDownload = async (item: ReleaseData['items'][0]) => {
    setDownloadingItem(item.id);

    try {
      // Check if we have the wrapped keys needed for decryption
      if (!item.bundleWrappedKey || !item.bundleWrappedKeyIV) {
        throw new Error('Decryption keys not available for this item');
      }

      // Download encrypted data from R2 via API
      const API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://vault-api.yourdomain.workers.dev';
      const response = await fetch(`${API_BASE_URL}/r2/${item.r2Key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const encryptedData = await response.arrayBuffer();

      // Decrypt the file using the release token
      // 1. Derive bundle key from release token
      const bundleKey = await deriveBundleKey(token);

      // 2. Unwrap the item key using the bundle key
      const wrappedKeyBytes = hexToBytes(item.bundleWrappedKey);
      const ivBytes = hexToBytes(item.bundleWrappedKeyIV);
      const itemKey = await unwrapKey(wrappedKeyBytes, bundleKey, ivBytes);

      // 3. Decrypt the file content with the item key
      const decryptedData = await decryptFile(new Uint8Array(encryptedData), itemKey);

      // 4. Download the decrypted file
      const blob = new Blob([new Uint8Array(decryptedData)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name; // Original filename, no .encrypted extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Failed to download item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloadingItem(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!release) return;

    setDownloadingAll(true);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Derive bundle key from token
      const bundleKey = await deriveBundleKey(token);

      // Decrypt and add the bundle note
      if (release.bundle.bundleNoteEncrypted && release.bundle.bundleNoteIV) {
        try {
          const noteEncryptedBytes = hexToBytes(release.bundle.bundleNoteEncrypted);
          const noteIVBytes = hexToBytes(release.bundle.bundleNoteIV);

          const noteDecrypted = await crypto.subtle.decrypt(
            // @ts-expect-error - TypeScript has issues with ArrayBuffer vs SharedArrayBuffer in crypto.subtle
            { name: 'AES-GCM', iv: noteIVBytes },
            bundleKey,
            noteEncryptedBytes
          );

          const noteText = new TextDecoder().decode(noteDecrypted);
          zip.file('README.txt', noteText);
        } catch (err) {
          console.error('Failed to decrypt note:', err);
          alert('Failed to decrypt the message from your loved one. The bundle may be corrupted.');
          setDownloadingAll(false);
          return;
        }
      }

      // Download and decrypt all items
      const API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://vault-api.yourdomain.workers.dev';

      for (const item of release.items) {
        try {
          if (!item.bundleWrappedKey || !item.bundleWrappedKeyIV) {
            console.error(`Skipping ${item.name}: missing encryption keys`);
            continue;
          }

          // Download encrypted data
          const response = await fetch(`${API_BASE_URL}/r2/${item.r2Key}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/octet-stream' },
            mode: 'cors',
          });

          if (!response.ok) {
            console.error(`Failed to download ${item.name}`);
            continue;
          }

          const encryptedData = await response.arrayBuffer();

          // Unwrap item key with bundle key
          const wrappedKeyBytes = hexToBytes(item.bundleWrappedKey);
          const ivBytes = hexToBytes(item.bundleWrappedKeyIV);
          const itemKey = await unwrapKey(wrappedKeyBytes, bundleKey, ivBytes);

          // Decrypt the file
          const decryptedData = await decryptFile(new Uint8Array(encryptedData), itemKey);

          // Add to zip
          zip.file(item.name, decryptedData);
        } catch (err) {
          console.error(`Failed to process ${item.name}:`, err);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${release.bundle.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download all failed:', err);
      alert(`Failed to create ZIP file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card>
          <p className="text-graphite-900">Loading...</p>
        </Card>
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-graphite-900 mb-4">
              Release Not Found
            </h1>
            <p className="text-graphite-600">
              {error || 'This release link is invalid or has expired.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="border-b border-graphite-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-graphite-900">Forebearer</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Info Card */}
        <Card className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-graphite-900 mb-2">
              You&apos;ve Received Memories
            </h1>
            <p className="text-lg text-graphite-600">
              From <strong>{release.user.email}</strong>
            </p>
          </div>

          <div className="bg-primary-50 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-graphite-600">Release Name</p>
                <p className="font-semibold text-graphite-900">{release.bundle.name}</p>
              </div>
              <div>
                <p className="text-sm text-graphite-600">Items</p>
                <p className="font-semibold text-graphite-900">
                  {release.items.length} {release.items.length === 1 ? 'memory' : 'memories'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Items List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-graphite-900">
              Shared Memories
            </h2>
            <Button
              onClick={handleDownloadAll}
              isLoading={downloadingAll}
              disabled={downloadingAll || release.items.length === 0}
            >
              📦 Download All as ZIP
            </Button>
          </div>

          <div className="space-y-3">
            {release.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-graphite-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.type === 'file' ? '📄' : '📝'}
                  </span>
                  <div>
                    <p className="font-medium text-graphite-900">{item.name}</p>
                    <p className="text-sm text-graphite-600">
                      {item.type === 'file' ? 'File' : 'Note'} • {formatFileSize(parseInt(item.size))}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(item)}
                  isLoading={downloadingItem === item.id}
                  size="sm"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Info Notice */}
        <Card className="mt-8 bg-primary-50 border-primary-200">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900 mb-1">
                About These Memories
              </h3>
              <p className="text-sm text-primary-800">
                These files were shared with you by {release.user.email}. Files are automatically
                decrypted when downloaded using zero-knowledge encryption. You can access this page anytime.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-graphite-200 py-12 bg-white mt-12">
        <div className="container mx-auto px-6 text-center text-graphite-600">
          <p className="text-sm">Forebearer - Share what matters</p>
        </div>
      </footer>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
