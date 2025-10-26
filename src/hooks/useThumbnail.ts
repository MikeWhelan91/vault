import { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { downloadObject } from '@/lib/r2-client';
import { decryptFile } from '@/lib/crypto';
import { generateImageThumbnail, generateVideoThumbnail, getMimeType } from '@/lib/thumbnails';
import { getThumbnailFromCache, saveThumbnailToCache } from '@/lib/thumbnail-cache';
import { getFileTypeInfo } from '@/lib/file-types';

interface UseThumbnailResult {
  thumbnail: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to generate and cache thumbnails for images and videos
 * Only generates thumbnail when called (lazy loading)
 */
export function useThumbnail(itemId: string, itemName: string, enabled: boolean = true): UseThumbnailResult {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getItemKey, session } = useCrypto();

  useEffect(() => {
    // Don't generate if not enabled
    if (!enabled) {
      return;
    }

    // Check if this is an image or video
    const fileInfo = getFileTypeInfo(itemName);
    const isImage = fileInfo.category === 'image';
    const isVideo = fileInfo.category === 'video';

    if (!isImage && !isVideo) {
      return;
    }

    let isCancelled = false;

    async function generateThumbnail() {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = await getThumbnailFromCache(itemId);
        if (cached && !isCancelled) {
          setThumbnail(cached);
          setIsLoading(false);
          return;
        }

        // Download and decrypt the file
        const encryptedData = await downloadObject(session.userId, itemId, 1);
        const itemKey = await getItemKey(itemId);

        if (!itemKey) {
          throw new Error('Could not get item key');
        }

        const decryptedData = await decryptFile(encryptedData, itemKey);

        if (isCancelled) return;

        // Generate thumbnail based on file type
        const mimeType = getMimeType(itemName);
        let thumbnailDataUrl: string;

        if (isImage) {
          thumbnailDataUrl = await generateImageThumbnail(decryptedData, mimeType);
        } else {
          thumbnailDataUrl = await generateVideoThumbnail(decryptedData, mimeType);
        }

        if (isCancelled) return;

        // Save to cache
        await saveThumbnailToCache(itemId, thumbnailDataUrl);

        setThumbnail(thumbnailDataUrl);
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to generate thumbnail:', err);
          setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    generateThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [itemId, itemName, enabled, getItemKey, session.userId]);

  return { thumbnail, isLoading, error };
}
