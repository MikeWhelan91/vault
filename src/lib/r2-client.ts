// @ts-nocheck
/**
 * R2 API client for interacting with Cloudflare Worker backend
 * All requests include proper CORS headers and error handling
 */

import type {
  R2ListResponse,
  R2UploadResponse,
  UploadProgress,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://vault-api.yourdomain.workers.dev';

/**
 * Custom error class for R2 API errors
 */
export class R2Error extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'R2Error';
  }
}

/**
 * Make a request to the R2 API with proper error handling
 */
async function r2Fetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/octet-stream',
      ...options.headers,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new R2Error(
      `R2 API error: ${response.statusText}`,
      response.status,
      errorText
    );
  }

  return response;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await r2Fetch('/health');
  return response.json();
}

/**
 * List objects in R2 bucket with optional prefix
 */
export async function listObjects(
  userId: string,
  prefix?: string
): Promise<R2ListResponse> {
  const params = new URLSearchParams();
  if (prefix) params.set('prefix', `${userId}/${prefix}`);
  else params.set('prefix', `${userId}/`);

  const endpoint = `/r2/list?${params.toString()}`;
  const response = await r2Fetch(endpoint);
  return response.json();
}

/**
 * Upload encrypted data to R2
 */
export async function uploadObject(
  userId: string,
  itemId: string,
  version: number,
  encryptedData: Uint8Array,
  onProgress?: (progress: UploadProgress) => void
): Promise<R2UploadResponse> {
  const key = `${userId}/${itemId}/${version}.bin`;
  const endpoint = `/r2/${key}`;

  // Create a blob for upload
  const blob = new Blob([encryptedData], { type: 'application/octet-stream' });

  // Use XMLHttpRequest for progress tracking if callback provided
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            itemId,
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch {
            resolve({ key, size: encryptedData.length, etag: '' });
          }
        } else {
          reject(new R2Error(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new R2Error('Upload failed: network error'));
      });

      xhr.open('PUT', `${API_BASE_URL}${endpoint}`);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(blob);
    });
  }

  // Simple fetch without progress
  const response = await r2Fetch(endpoint, {
    method: 'PUT',
    body: blob,
  });

  const result = await response.json().catch(() => null);
  return result || { key, size: encryptedData.length, etag: '' };
}

/**
 * Download encrypted data from R2
 */
export async function downloadObject(
  userId: string,
  itemId: string,
  version: number = 1
): Promise<Uint8Array> {
  const key = `${userId}/${itemId}/${version}.bin`;
  const endpoint = `/r2/${key}`;

  const response = await r2Fetch(endpoint, {
    method: 'GET',
  });

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Delete an object from R2
 */
export async function deleteObject(
  userId: string,
  itemId: string,
  version: number = 1
): Promise<void> {
  const key = `${userId}/${itemId}/${version}.bin`;
  const endpoint = `/r2/${key}`;

  await r2Fetch(endpoint, {
    method: 'DELETE',
  });
}

/**
 * Get object metadata without downloading
 */
export async function getObjectMetadata(
  userId: string,
  itemId: string,
  version: number = 1
): Promise<{ size: number; etag: string }> {
  const key = `${userId}/${itemId}/${version}.bin`;
  const endpoint = `/r2/${key}`;

  const response = await r2Fetch(endpoint, {
    method: 'HEAD',
  });

  return {
    size: parseInt(response.headers.get('Content-Length') || '0', 10),
    etag: response.headers.get('ETag') || '',
  };
}

/**
 * Batch upload multiple items
 */
export async function batchUpload(
  userId: string,
  items: Array<{
    itemId: string;
    version: number;
    data: Uint8Array;
  }>,
  onProgress?: (itemId: string, progress: UploadProgress) => void
): Promise<R2UploadResponse[]> {
  const uploads = items.map((item) =>
    uploadObject(
      userId,
      item.itemId,
      item.version,
      item.data,
      onProgress ? (p) => onProgress(item.itemId, p) : undefined
    )
  );

  return Promise.all(uploads);
}

/**
 * Calculate total storage used by user
 */
export async function calculateStorageUsed(userId: string): Promise<number> {
  const response = await listObjects(userId);
  return response.objects.reduce((total, obj) => total + obj.size, 0);
}
