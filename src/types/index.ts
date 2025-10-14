// Core data types for the vault application

export type ItemType = 'file' | 'note';

export type FileCategory = 'video' | 'image' | 'document' | 'audio' | 'other';

export type UserTier = 'free' | 'plus';

export type ReleaseMode = 'time-lock' | 'heartbeat';

export interface VaultItem {
  id: string;
  type: ItemType;
  name: string;
  size: number; // bytes (encrypted size)
  createdAt: string; // ISO timestamp
  updatedAt: string;
  version: number;
  // Metadata stored client-side (in memory or indexedDB)
  itemKeySalt: string; // hex-encoded salt for item key derivation
}

export interface VaultMetadata {
  userId: string;
  userName: string;
  dataKeySalt: string; // hex-encoded salt for data key
  items: VaultItem[];
  totalSize: number; // total bytes used
  storageLimit: number; // bytes allowed
  tier: UserTier;
}

export interface ReleaseBundle {
  id: string;
  name: string;
  mode: ReleaseMode;
  items: string[]; // item IDs
  createdAt: string;

  // Time-lock specific
  releaseDate?: string; // ISO timestamp

  // Heartbeat specific
  heartbeatCadence?: number; // days between heartbeats
  lastHeartbeat?: string; // ISO timestamp

  // Recipients
  trustees: Trustee[];

  // Release token (generated server-side when conditions met)
  releaseToken?: string;
}

export interface Trustee {
  id: string;
  email: string;
  name?: string;
}

export interface HeartbeatSettings {
  enabled: boolean;
  cadenceDays: number;
  lastHeartbeat?: string;
  nextHeartbeat?: string;
}

// Client-side encrypted blob format
export interface EncryptedBlob {
  version: number; // format version
  salt: Uint8Array; // 16 bytes
  iv: Uint8Array; // 12 bytes for AES-GCM
  ciphertext: Uint8Array;
  authTag?: Uint8Array; // included in ciphertext for AES-GCM
}

// Upload/download types
export interface UploadProgress {
  itemId: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: string;
}

// API response types
export interface R2ListResponse {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

export interface R2UploadResponse {
  key: string;
  size: number;
  etag: string;
}

// Session types
export interface CryptoSession {
  masterKey: CryptoKey; // derived from passphrase
  dataKey: CryptoKey; // random, wrapped with master key
  userId: string;
  unlocked: boolean;
}

// Unlock page types
export interface UnlockRequest {
  token: string;
  passphrase: string;
}

export interface UnlockResponse {
  success: boolean;
  bundleId: string;
  items: VaultItem[];
  wrappedDataKey: string; // encrypted data key for recipient
}
