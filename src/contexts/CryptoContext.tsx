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
  unlock: (passphrase: string, email: string) => Promise<void>;
  lock: () => void;
  getItemKey: (itemId: string) => Promise<CryptoKey>;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>, itemKey: CryptoKey) => Promise<VaultItem>;
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

  /**
   * Unlock vault with passphrase
   */
  const unlock = useCallback(
    async (passphrase: string, email: string) => {
      try {
        // First, derive master key and prepare wrapped data key
        const dataKeySalt = generateSalt();
        const masterKey = await deriveMasterKey(passphrase, dataKeySalt);

        // Generate data key (will be wrapped)
        const tempDataKey = await generateDataKey();
        const iv = generateIV();
        const wrappedDataKey = await wrapKey(tempDataKey, masterKey, iv);

        // Call API to create or unlock user
        const response = await fetch('/api/auth/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            dataKeySalt: bytesToHex(dataKeySalt),
            wrappedDataKey: bytesToHex(wrappedDataKey),
            wrappedDataKeyIV: bytesToHex(iv),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to unlock vault');
        }

        const data = await response.json();

        // If user exists, use their stored wrapped key
        let dataKey: CryptoKey;
        if (!data.created) {
          // Existing user - unwrap their stored data key
          const storedSalt = hexToBytes(data.user.dataKeySalt);
          const storedWrappedKey = hexToBytes(data.user.wrappedDataKey);
          const storedIV = hexToBytes(data.user.wrappedDataKeyIV);

          // Re-derive master key with stored salt
          const userMasterKey = await deriveMasterKey(passphrase, storedSalt);

          try {
            dataKey = await unwrapKey(storedWrappedKey, userMasterKey, storedIV, [
              'encrypt',
              'decrypt',
              'wrapKey',
              'unwrapKey',
            ]);
          } catch (error) {
            throw new Error('Invalid passphrase');
          }
        } else {
          // New user - use the key we just created
          dataKey = tempDataKey;
        }

        // Set up session
        setSession({
          masterKey,
          dataKey,
          userId: email,
          dbUserId: data.user.id,
          unlocked: true,
        });

        // Set metadata from API response
        setMetadata({
          userId: email,
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
        });

        // Store wrapped item keys in memory (for quick access)
        if (data.items) {
          for (const item of data.items) {
            if (item.wrappedItemKey && item.wrappedItemKeyIV) {
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
    sessionStorage.clear();
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

      if (stored) {
        const { wrapped, iv } = JSON.parse(stored);
        const wrappedKey = hexToBytes(wrapped);
        const ivBytes = hexToBytes(iv);

        return unwrapKey(wrappedKey, session.dataKey, ivBytes, ['encrypt', 'decrypt']);
      } else {
        // Generate new item key (will be stored when item is created)
        return generateItemKey();
      }
    },
    [session.dataKey]
  );

  /**
   * Add new item to vault
   */
  const addItem = useCallback(
    async (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>, itemKey: CryptoKey): Promise<VaultItem> => {
      if (!session.dataKey || !session.dbUserId) {
        throw new Error('Vault is locked');
      }

      // Wrap the provided item key
      const itemKeySalt = generateSalt();
      const iv = generateIV();
      const wrappedItemKey = await wrapKey(itemKey, session.dataKey, iv);

      // Call API to create item
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          type: item.type,
          name: item.name,
          size: item.size,
          r2Key: `${session.userId}/${crypto.randomUUID()}/1.bin`,
          itemKeySalt: bytesToHex(itemKeySalt),
          wrappedItemKey: bytesToHex(wrappedItemKey),
          wrappedItemKeyIV: bytesToHex(iv),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
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
      sessionStorage.setItem(
        `vault_item_key_${newItem.id}`,
        JSON.stringify({
          wrapped: bytesToHex(wrappedItemKey),
          iv: bytesToHex(iv),
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
