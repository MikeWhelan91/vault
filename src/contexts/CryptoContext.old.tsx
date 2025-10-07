'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
import { useToast } from './ToastContext';

interface CryptoSession {
  masterKey: CryptoKey | null;
  dataKey: CryptoKey | null;
  userId: string;
  unlocked: boolean;
}

interface CryptoContextType {
  session: CryptoSession;
  metadata: VaultMetadata | null;
  isUnlocked: boolean;
  unlock: (passphrase: string, userId?: string) => Promise<void>;
  lock: () => void;
  getItemKey: (itemId: string) => Promise<CryptoKey>;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => VaultItem;
  removeItem: (itemId: string) => void;
  updateMetadata: (updates: Partial<VaultMetadata>) => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

const STORAGE_KEY = 'vault_metadata';

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [session, setSession] = useState<CryptoSession>({
    masterKey: null,
    dataKey: null,
    userId: '',
    unlocked: false,
  });

  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);

  // Load metadata from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMetadata(parsed);
        } catch (error) {
          console.error('Failed to parse vault metadata:', error);
        }
      }
    }
  }, []);

  // Save metadata to localStorage whenever it changes
  useEffect(() => {
    if (metadata && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
    }
  }, [metadata]);

  /**
   * Unlock vault with passphrase
   */
  const unlock = useCallback(
    async (passphrase: string, userId: string = 'default-user') => {
      try {
        let vaultMeta = metadata;

        // Initialize new vault if no metadata exists
        if (!vaultMeta) {
          const dataKeySalt = generateSalt();

          vaultMeta = {
            userId,
            dataKeySalt: bytesToHex(dataKeySalt),
            items: [],
            totalSize: 0,
            storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
          };

          setMetadata(vaultMeta);
        }

        // Derive master key from passphrase
        const masterKeySalt = hexToBytes(vaultMeta.dataKeySalt);
        const masterKey = await deriveMasterKey(passphrase, masterKeySalt);

        // Generate or unwrap data key
        let dataKey: CryptoKey;

        const wrappedDataKeyHex = localStorage.getItem(`vault_wrapped_data_key_${userId}`);

        if (wrappedDataKeyHex) {
          // Unwrap existing data key
          const wrappedDataKey = hexToBytes(wrappedDataKeyHex);
          const iv = wrappedDataKey.slice(0, 12);
          const wrapped = wrappedDataKey.slice(12);

          try {
            dataKey = await unwrapKey(wrapped, masterKey, iv, [
              'encrypt',
              'decrypt',
              'wrapKey',
              'unwrapKey',
            ]);
          } catch (error) {
            throw new Error('Invalid passphrase');
          }
        } else {
          // Generate new data key and wrap it
          dataKey = await generateDataKey();
          const iv = generateIV();
          const wrappedDataKey = await wrapKey(dataKey, masterKey, iv);

          // Store wrapped key (iv + wrapped)
          const combined = new Uint8Array(12 + wrappedDataKey.length);
          combined.set(iv, 0);
          combined.set(wrappedDataKey, 12);

          localStorage.setItem(`vault_wrapped_data_key_${userId}`, bytesToHex(combined));
        }

        setSession({
          masterKey,
          dataKey,
          userId,
          unlocked: true,
        });

        showToast('Vault unlocked', 'success');
      } catch (error) {
        console.error('Unlock failed:', error);
        showToast(
          error instanceof Error ? error.message : 'Failed to unlock vault',
          'error'
        );
        throw error;
      }
    },
    [metadata, showToast]
  );

  /**
   * Lock vault (clear in-memory keys)
   */
  const lock = useCallback(() => {
    setSession({
      masterKey: null,
      dataKey: null,
      userId: '',
      unlocked: false,
    });
    showToast('Vault locked', 'info');
  }, [showToast]);

  /**
   * Get or generate item key
   */
  const getItemKey = useCallback(
    async (itemId: string): Promise<CryptoKey> => {
      if (!session.dataKey) {
        throw new Error('Vault is locked');
      }

      // Check if item key is already wrapped and stored
      const wrappedItemKeyHex = localStorage.getItem(`vault_item_key_${itemId}`);

      if (wrappedItemKeyHex) {
        // Unwrap existing item key
        const wrappedItemKey = hexToBytes(wrappedItemKeyHex);
        const iv = wrappedItemKey.slice(0, 12);
        const wrapped = wrappedItemKey.slice(12);

        return unwrapKey(wrapped, session.dataKey, iv, ['encrypt', 'decrypt']);
      } else {
        // Generate new item key
        const itemKey = await generateItemKey();
        const iv = generateIV();
        const wrappedItemKey = await wrapKey(itemKey, session.dataKey, iv);

        // Store wrapped key (iv + wrapped)
        const combined = new Uint8Array(12 + wrappedItemKey.length);
        combined.set(iv, 0);
        combined.set(wrappedItemKey, 12);

        localStorage.setItem(`vault_item_key_${itemId}`, bytesToHex(combined));

        return itemKey;
      }
    },
    [session.dataKey]
  );

  /**
   * Add new item to vault
   */
  const addItem = useCallback(
    (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>): VaultItem => {
      const now = new Date().toISOString();
      const newItem: VaultItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        version: 1,
        itemKeySalt: bytesToHex(generateSalt()),
      };

      setMetadata((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [...prev.items, newItem],
          totalSize: prev.totalSize + newItem.size,
        };
      });

      return newItem;
    },
    []
  );

  /**
   * Remove item from vault
   */
  const removeItem = useCallback((itemId: string) => {
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

    // Clean up stored item key
    localStorage.removeItem(`vault_item_key_${itemId}`);
  }, []);

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
    lock,
    getItemKey,
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
