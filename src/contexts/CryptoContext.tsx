'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  deriveMasterKey,
  generateDataKey,
  generateSalt,
  generateIV,
  wrapKey,
  unwrapKey,
  bytesToHex,
  hexToBytes,
  generateItemKey,
} from '@/lib/crypto';
import type { VaultMetadata, VaultItem } from '@/types';

interface CryptoSession {
  masterKey: CryptoKey | null;
  dataKey: CryptoKey | null;
  userId: string;
  dbUserId: string; // Database user ID
  unlocked: boolean;
}

interface CryptoContextType {
  session: CryptoSession;
  metadata: VaultMetadata | null;
  isUnlocked: boolean;
  unlock: (password: string, email: string) => Promise<void>;
  signup: (password: string, email: string, name?: string) => Promise<void>;
  lock: () => void;
  getItemKey: (itemId: string) => Promise<CryptoKey>;
  getExtractableItemKey: (itemId: string) => Promise<CryptoKey>;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>, itemKey: CryptoKey, mimeType?: string) => Promise<VaultItem>;
  removeItem: (itemId: string) => Promise<void>;
  updateMetadata: (updates: Partial<VaultMetadata>) => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: React.ReactNode }) {

  const [session, setSession] = useState<CryptoSession>({
    masterKey: null,
    dataKey: null,
    userId: '',
    dbUserId: '',
    unlocked: false,
  });

  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);

  // Restore session from sessionStorage on mount
  React.useEffect(() => {
    const storedSession = sessionStorage.getItem('vault_session_active');
    if (storedSession === 'true') {
      // Session was active, but we can't restore crypto keys from storage
      // User will need to unlock again, but we can prevent immediate logout
      const userId = sessionStorage.getItem('vault_user_id');
      const dbUserId = sessionStorage.getItem('vault_db_user_id');
      if (userId && dbUserId) {
        // Don't set unlocked to true since we don't have keys
        // Just preserve the userId so we know someone was logged in
      }
    }
  }, []);

  /**
   * Unlock vault with password (login)
   */
  const unlock = useCallback(
    async (password: string, email: string) => {
      try {
        // First attempt to fetch user data (without creating account)
        // We need to send some crypto data to match the API signature, but it won't be used
        const tempSalt = generateSalt();
        const tempMasterKey = await deriveMasterKey(password, tempSalt);
        const tempDataKey = await generateDataKey();
        const tempIV = generateIV();
        const tempWrappedKey = await wrapKey(tempDataKey, tempMasterKey, tempIV);

        // Call API to unlock existing user
        const response = await fetch('/api/auth/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            dataKeySalt: bytesToHex(tempSalt),
            wrappedDataKey: bytesToHex(tempWrappedKey),
            wrappedDataKeyIV: bytesToHex(tempIV),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to unlock vault');
        }

        const data = await response.json();

        // Existing user - unwrap their stored data key
        const storedSalt = hexToBytes(data.user.dataKeySalt);
        const storedWrappedKey = hexToBytes(data.user.wrappedDataKey);
        const storedIV = hexToBytes(data.user.wrappedDataKeyIV);

        // Re-derive master key with stored salt
        const userMasterKey = await deriveMasterKey(password, storedSalt);

        let dataKey: CryptoKey;
        try {
          dataKey = await unwrapKey(storedWrappedKey, userMasterKey, storedIV, [
            'encrypt',
            'decrypt',
            'wrapKey',
            'unwrapKey',
          ]);
        } catch (error) {
          throw new Error('Invalid password');
        }

        // Set up session
        setSession({
          masterKey: userMasterKey,
          dataKey,
          userId: email,
          dbUserId: data.user.id,
          unlocked: true,
        });

        // Persist session markers to sessionStorage
        sessionStorage.setItem('vault_session_active', 'true');
        sessionStorage.setItem('vault_user_id', email);
        sessionStorage.setItem('vault_db_user_id', data.user.id);

        // Set metadata from API response
        setMetadata({
          userId: email,
          userName: data.user.name || '',
          dataKeySalt: data.user.dataKeySalt,
          items: data.items.map((item: any) => ({
            id: item.id,
            type: item.type,
            name: item.name,
            size: parseInt(item.size),
            version: item.version,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            itemKeySalt: item.itemKeySalt,
          })),
          totalSize: parseInt(data.user.totalSize),
          storageLimit: parseInt(data.user.storageLimit),
          tier: data.user.tier || 'free',
          gracePeriodEndsAt: data.user.gracePeriodEndsAt || null,
        });

        // Store wrapped item keys in memory (for quick access)
        if (data.items) {
          console.log(`[Unlock] Loading ${data.items.length} item keys from database`);
          for (const item of data.items) {
            if (item.wrappedItemKey && item.wrappedItemKeyIV) {
              console.log('[Unlock] Caching item key:', {
                itemId: item.id,
                itemName: item.name,
                wrappedKeyPreview: item.wrappedItemKey.slice(0, 32) + '...',
                ivPreview: item.wrappedItemKeyIV
              });

              sessionStorage.setItem(
                `vault_item_key_${item.id}`,
                JSON.stringify({
                  wrapped: item.wrappedItemKey,
                  iv: item.wrappedItemKeyIV,
                })
              );
            }
          }
        }

        // Success - vault unlocked
      } catch (error) {
        console.error('Unlock failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Sign up (create new account)
   */
  const signup = useCallback(
    async (password: string, email: string, name?: string) => {
      try {
        // Generate crypto keys for new account
        const dataKeySalt = generateSalt();
        const masterKey = await deriveMasterKey(password, dataKeySalt);
        const dataKey = await generateDataKey();
        const iv = generateIV();
        const wrappedDataKey = await wrapKey(dataKey, masterKey, iv);

        // Call API to create account
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || undefined,
            dataKeySalt: bytesToHex(dataKeySalt),
            wrappedDataKey: bytesToHex(wrappedDataKey),
            wrappedDataKeyIV: bytesToHex(iv),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create account');
        }

        const data = await response.json();

        // Set up session with the newly created keys
        setSession({
          masterKey,
          dataKey,
          userId: email,
          dbUserId: data.user.id,
          unlocked: true,
        });

        // Persist session markers to sessionStorage
        sessionStorage.setItem('vault_session_active', 'true');
        sessionStorage.setItem('vault_user_id', email);
        sessionStorage.setItem('vault_db_user_id', data.user.id);

        // Set metadata from API response
        setMetadata({
          userId: email,
          userName: data.user.name || '',
          dataKeySalt: data.user.dataKeySalt,
          items: [],
          totalSize: parseInt(data.user.totalSize),
          storageLimit: parseInt(data.user.storageLimit),
          tier: data.user.tier || 'free',
          gracePeriodEndsAt: data.user.gracePeriodEndsAt || null,
        });

        // Success - account created and vault unlocked
      } catch (error) {
        console.error('Signup failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Lock vault (clear in-memory keys)
   */
  const lock = useCallback(() => {
    setSession({
      masterKey: null,
      dataKey: null,
      userId: '',
      dbUserId: '',
      unlocked: false,
    });
    setMetadata(null);

    // Clear only vault-related sessionStorage items
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('vault_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }, []);

  /**
   * Get or generate item key
   */
  const getItemKey = useCallback(
    async (itemId: string): Promise<CryptoKey> => {
      if (!session.dataKey) {
        throw new Error('Vault is locked');
      }

      // Check sessionStorage first
      const stored = sessionStorage.getItem(`vault_item_key_${itemId}`);

      console.log('[GetItemKey] Retrieving key for item:', {
        itemId,
        hasStoredKey: !!stored,
        storedKeyPreview: stored ? JSON.parse(stored).wrapped.slice(0, 32) + '...' : 'none'
      });

      if (stored) {
        const { wrapped, iv } = JSON.parse(stored);
        const wrappedKey = hexToBytes(wrapped);
        const ivBytes = hexToBytes(iv);

        console.log('[GetItemKey] Using stored key from sessionStorage');
        return unwrapKey(wrappedKey, session.dataKey, ivBytes, ['encrypt', 'decrypt']);
      } else {
        // Generate new item key (will be stored when item is created)
        console.log('[GetItemKey] No stored key found, generating new key');
        return generateItemKey();
      }
    },
    [session.dataKey]
  );

  /**
   * Get an extractable item key (for bundle creation/key wrapping)
   */
  const getExtractableItemKey = useCallback(
    async (itemId: string): Promise<CryptoKey> => {
      if (!session.dataKey || !session.dbUserId) {
        throw new Error('Vault is locked');
      }

      // Check sessionStorage first
      const stored = sessionStorage.getItem(`vault_item_key_${itemId}`);

      if (stored) {
        const { wrapped, iv } = JSON.parse(stored);
        const wrappedKey = hexToBytes(wrapped);
        const ivBytes = hexToBytes(iv);

        // Return an extractable key that can be wrapped with bundle key
        return unwrapKey(wrappedKey, session.dataKey, ivBytes, ['encrypt', 'decrypt'], true);
      }

      // If not in sessionStorage, fetch from database
      // This happens when creating a bundle with items from a previous session
      const response = await fetch(`/api/items/${itemId}?userId=${session.dbUserId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item key for item ${itemId}`);
      }

      const data = await response.json();
      if (!data.item.wrappedItemKey || !data.item.wrappedItemKeyIV) {
        throw new Error(`Item ${itemId} is missing wrapped key data`);
      }

      // Unwrap the item key from the database
      const wrappedKey = hexToBytes(data.item.wrappedItemKey);
      const ivBytes = hexToBytes(data.item.wrappedItemKeyIV);

      // Cache it in sessionStorage for future use
      sessionStorage.setItem(
        `vault_item_key_${itemId}`,
        JSON.stringify({
          wrapped: data.item.wrappedItemKey,
          iv: data.item.wrappedItemKeyIV,
        })
      );

      // Return an extractable key that can be wrapped with bundle key
      return unwrapKey(wrappedKey, session.dataKey, ivBytes, ['encrypt', 'decrypt'], true);
    },
    [session.dataKey, session.dbUserId]
  );

  /**
   * Add new item to vault
   */
  const addItem = useCallback(
    async (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>, itemKey: CryptoKey, mimeType?: string): Promise<VaultItem> => {
      if (!session.dataKey || !session.dbUserId) {
        throw new Error('Vault is locked');
      }

      // Wrap the provided item key
      const itemKeySalt = generateSalt();
      const iv = generateIV();
      const wrappedItemKey = await wrapKey(itemKey, session.dataKey, iv);

      // Call API to create item
      // The server will generate the correct r2Key using the item ID
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          type: item.type,
          name: item.name,
          size: item.size,
          r2Key: 'placeholder', // Server will replace with correct key
          itemKeySalt: bytesToHex(itemKeySalt),
          wrappedItemKey: bytesToHex(wrappedItemKey),
          wrappedItemKeyIV: bytesToHex(iv),
          mimeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Handle quota/limit errors with user-friendly messages
        if (errorData?.code === 'QUOTA_EXCEEDED') {
          throw new Error(errorData.error);
        } else if (errorData?.code === 'STORAGE_LIMIT_EXCEEDED') {
          throw new Error(errorData.error);
        } else if (errorData?.code === 'FILE_TOO_LARGE') {
          throw new Error(errorData.error);
        }

        throw new Error(errorData?.error || 'Failed to create item');
      }

      const data = await response.json();

      const newItem: VaultItem = {
        id: data.item.id,
        type: data.item.type,
        name: data.item.name,
        size: parseInt(data.item.size),
        version: data.item.version,
        createdAt: data.item.createdAt,
        updatedAt: data.item.updatedAt,
        itemKeySalt: data.item.itemKeySalt,
      };

      // Update metadata
      setMetadata((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, newItem],
          totalSize: parseInt(data.totalSize),
        };
      });

      // Store wrapped key in session
      const wrappedKeyHex = bytesToHex(wrappedItemKey);
      const ivHex = bytesToHex(iv);

      console.log('[AddItem] Storing wrapped key for new item:', {
        itemId: newItem.id,
        wrappedKeyPreview: wrappedKeyHex.slice(0, 32) + '...',
        wrappedKeyLength: wrappedItemKey.length,
        ivPreview: ivHex
      });

      sessionStorage.setItem(
        `vault_item_key_${newItem.id}`,
        JSON.stringify({
          wrapped: wrappedKeyHex,
          iv: ivHex,
        })
      );

      return newItem;
    },
    [session.dataKey, session.dbUserId, session.userId]
  );

  /**
   * Remove item from vault
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!session.dbUserId) {
        throw new Error('Vault is locked');
      }

      // Call API to delete item
      const response = await fetch(`/api/items/${itemId}?userId=${session.dbUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Update metadata
      setMetadata((prev) => {
        if (!prev) return prev;

        const item = prev.items.find((i) => i.id === itemId);
        const sizeToRemove = item?.size || 0;

        return {
          ...prev,
          items: prev.items.filter((i) => i.id !== itemId),
          totalSize: prev.totalSize - sizeToRemove,
        };
      });

      // Clean up session storage
      sessionStorage.removeItem(`vault_item_key_${itemId}`);
    },
    [session.dbUserId]
  );

  /**
   * Update vault metadata
   */
  const updateMetadata = useCallback((updates: Partial<VaultMetadata>) => {
    setMetadata((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const value: CryptoContextType = {
    session,
    metadata,
    isUnlocked: session.unlocked,
    unlock,
    signup,
    lock,
    getItemKey,
    getExtractableItemKey,
    addItem,
    removeItem,
    updateMetadata,
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within CryptoProvider');
  }
  return context;
}
