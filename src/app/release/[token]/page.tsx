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
    expiresAt: string;
    bundleNoteEncrypted: string | null;
    bundleNoteIV: string | null;
  };
  user: {
    name: string;
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
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const response = await fetch(`/api/release/${token}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 410) {
            // Bundle expired
            throw new Error(errorData.message || 'This release has expired and is no longer accessible.');
          }

          throw new Error(errorData.error || 'Release not found');
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
      <div className="container mx-auto px-4 py-8 max-w-4xl sm:px-6 sm:py-12">
        {/* Info Card */}
        <Card className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-graphite-900 mb-2 sm:text-3xl">
              You&apos;ve Received Memories
            </h1>
            <p className="text-base text-graphite-600 break-words sm:text-lg">
              From <strong className="break-words">{release.user.name}</strong> (<span className="break-all">{release.user.email}</span>)
            </p>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-graphite-600">Release Name</p>
                <p className="font-semibold text-graphite-900 break-words">{release.bundle.name}</p>
              </div>
              <div>
                <p className="text-sm text-graphite-600">Items</p>
                <p className="font-semibold text-graphite-900">
                  {release.items.length} {release.items.length === 1 ? 'memory' : 'memories'}
                </p>
              </div>
            </div>
          </div>

          {/* Expiration Notice */}
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-900">Access expires in 24 hours</p>
                <p className="text-xs text-orange-800 mt-1">
                  This release will be accessible until {new Date(release.bundle.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Items List */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-graphite-900 mb-2">
              Shared Memories
            </h2>
            <p className="text-sm text-graphite-600">
              {release.items.length} {release.items.length === 1 ? 'item' : 'items'} ready to download
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {release.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-graphite-50 rounded-lg sm:p-4"
              >
                <span className="text-xl flex-shrink-0 sm:text-2xl">
                  {item.type === 'file' ? '📄' : '📝'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-graphite-900 break-words">{item.name}</p>
                  <p className="text-sm text-graphite-600">
                    {item.type === 'file' ? 'File' : 'Note'} • {formatFileSize(parseInt(item.size))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleDownloadAll}
            isLoading={downloadingAll}
            disabled={downloadingAll || release.items.length === 0}
            className="w-full"
            size="lg"
          >
            📦 Download All as ZIP
          </Button>
        </Card>

        {/* Info Notice */}
        <Card className="mt-8 bg-primary-50 border-primary-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-primary-900 mb-1 sm:text-lg">
                About These Memories
              </h3>
              <p className="text-sm text-primary-800 break-words">
                These files were shared with you by {release.user.name} (<span className="break-all">{release.user.email}</span>). Files are automatically
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
