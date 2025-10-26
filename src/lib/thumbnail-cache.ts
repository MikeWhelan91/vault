/**
 * IndexedDB cache for thumbnails
 * Stores generated thumbnails to avoid re-decrypting files
 */

const DB_NAME = 'forebearer-thumbnails';
const DB_VERSION = 1;
const STORE_NAME = 'thumbnails';

interface ThumbnailCache {
  itemId: string;
  dataUrl: string;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'itemId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Get thumbnail from cache
 */
export async function getThumbnailFromCache(itemId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(itemId);

      request.onsuccess = () => {
        const result = request.result as ThumbnailCache | undefined;
        resolve(result?.dataUrl || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get thumbnail from cache:', error);
    return null;
  }
}

/**
 * Save thumbnail to cache
 */
export async function saveThumbnailToCache(itemId: string, dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const cache: ThumbnailCache = {
      itemId,
      dataUrl,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cache);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save thumbnail to cache:', error);
  }
}

/**
 * Clear old cached thumbnails (older than 30 days)
 */
export async function clearOldThumbnails(): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const range = IDBKeyRange.upperBound(thirtyDaysAgo);

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear old thumbnails:', error);
  }
}

/**
 * Clear all cached thumbnails
 */
export async function clearAllThumbnails(): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear all thumbnails:', error);
  }
}
