// @ts-nocheck
/**
 * Zero-knowledge cryptography utilities using WebCrypto API
 *
 * Security model:
 * - Master Key: derived from user passphrase using PBKDF2 (TODO: upgrade to Argon2id)
 * - Data Key: random 256-bit AES key, encrypted with Master Key
 * - Item Keys: random 256-bit AES keys per item, encrypted with Data Key
 * - All encryption uses AES-GCM with 96-bit IVs
 */

import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

const MASTER_KEY_ITERATIONS = 100_000; // TODO: Replace with Argon2id
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16; // 128 bits

/**
 * Generate a random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a random IV for AES-GCM
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive master key from passphrase using PBKDF2-SHA256
 * TODO: Replace with Argon2id for better resistance to GPU attacks
 */
export async function deriveMasterKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const passphraseBytes = new TextEncoder().encode(passphrase);

  // Use @noble/hashes PBKDF2 for better compatibility
  const keyMaterial = pbkdf2(sha256, passphraseBytes, salt, {
    c: MASTER_KEY_ITERATIONS,
    dkLen: KEY_LENGTH,
  });

  // Import as CryptoKey
  return crypto.subtle.importKey(
    'raw',
    keyMaterial.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

/**
 * Generate a random data key (AES-256)
 */
export async function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable for wrapping
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

/**
 * Generate a random item key (AES-256)
 */
export async function generateItemKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable for wrapping
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive a bundle key from a release token
 * This allows trustees to decrypt items using only the release token
 */
export async function deriveBundleKey(releaseToken: string): Promise<CryptoKey> {
  const tokenBytes = new TextEncoder().encode(releaseToken);

  // Use a fixed salt for bundle keys (derived from token itself)
  // This makes the bundle key deterministic from the token
  const salt = sha256(tokenBytes).slice(0, SALT_LENGTH);

  // Derive key using PBKDF2
  const keyMaterial = pbkdf2(sha256, tokenBytes, salt, {
    c: MASTER_KEY_ITERATIONS,
    dkLen: KEY_LENGTH,
  });

  // Import as CryptoKey
  return crypto.subtle.importKey(
    'raw',
    keyMaterial.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Wrap (encrypt) a key with another key
 */
export async function wrapKey(
  keyToWrap: CryptoKey,
  wrappingKey: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  const wrapped = await crypto.subtle.wrapKey(
    'raw',
    keyToWrap,
    wrappingKey,
    { name: 'AES-GCM', iv }
  );
  return new Uint8Array(wrapped);
}

/**
 * Unwrap (decrypt) a wrapped key
 */
export async function unwrapKey(
  wrappedKey: Uint8Array,
  unwrappingKey: CryptoKey,
  iv: Uint8Array,
  keyUsages: KeyUsage[] = ['encrypt', 'decrypt'],
  extractable: boolean = false
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    unwrappingKey,
    { name: 'AES-GCM', iv },
    { name: 'AES-GCM', length: 256 },
    extractable,
    keyUsages
  );
}

/**
 * Encrypt data with AES-GCM
 * Returns: salt(16) || iv(12) || ciphertext (includes auth tag)
 */
export async function encryptData(
  data: Uint8Array,
  key: CryptoKey,
  salt?: Uint8Array
): Promise<Uint8Array> {
  const usedSalt = salt || generateSalt();
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Concatenate: salt || iv || ciphertext
  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  result.set(usedSalt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return result;
}

/**
 * Decrypt data with AES-GCM
 * Input format: salt(16) || iv(12) || ciphertext
 */
export async function decryptData(
  encryptedData: Uint8Array,
  key: CryptoKey
): Promise<Uint8Array> {
  if (encryptedData.length < SALT_LENGTH + IV_LENGTH) {
    throw new Error('Invalid encrypted data: too short');
  }

  // Extract components
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encryptedData.slice(SALT_LENGTH + IV_LENGTH);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new Uint8Array(plaintext);
  } catch (error) {
    throw new Error('Decryption failed: invalid key or corrupted data');
  }
}

/**
 * Encrypt a file or note content
 */
export async function encryptFile(
  content: Uint8Array | string,
  itemKey: CryptoKey
): Promise<Uint8Array> {
  const data = typeof content === 'string'
    ? new TextEncoder().encode(content)
    : content;

  return encryptData(data, itemKey);
}

/**
 * Decrypt a file or note content
 */
export async function decryptFile(
  encryptedContent: Uint8Array,
  itemKey: CryptoKey
): Promise<Uint8Array> {
  return decryptData(encryptedContent, itemKey);
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Hash data with SHA-256 (for checksums, not security-critical)
 */
export function hashData(data: Uint8Array): Uint8Array {
  return sha256(data);
}

/**
 * Generate a random item ID
 */
export function generateItemId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(bytes);
}

/**
 * Validate passphrase strength
 */
export function validatePassphrase(passphrase: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (passphrase.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[a-z]/.test(passphrase)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[A-Z]/.test(passphrase)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/[0-9]/.test(passphrase)) {
    errors.push('Password must contain numbers');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
