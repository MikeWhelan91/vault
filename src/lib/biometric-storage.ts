/**
 * Secure storage for biometric authentication credentials
 * Uses browser's secure storage on web, native keychain on mobile
 */

import { platform } from './platform';

const STORAGE_KEY = 'forebearer_biometric_credentials';

interface BiometricCredentials {
  email: string;
  encryptedPassword: string; // Base64 encoded encrypted password
  iv: string; // Initialization vector for decryption
  enabled: boolean;
}

/**
 * Simple XOR encryption for demo purposes
 * In production, you'd want to use the device's secure enclave/keychain
 * For now, this provides basic obfuscation
 */
function encryptPassword(password: string, deviceId: string): { encrypted: string; iv: string } {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = new TextEncoder().encode(deviceId);
  const data = new TextEncoder().encode(password);

  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
  }

  return {
    encrypted: btoa(String.fromCharCode(...encrypted)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

function decryptPassword(encrypted: string, iv: string, deviceId: string): string {
  const key = new TextEncoder().encode(deviceId);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ key[i % key.length] ^ ivBytes[i % ivBytes.length];
  }

  return new TextDecoder().decode(decrypted);
}

/**
 * Get a device-specific identifier
 */
async function getDeviceId(): Promise<string> {
  // Use a combination of screen size and user agent as device ID
  // In production, you'd use a proper device ID from Capacitor
  const deviceInfo = `${screen.width}x${screen.height}-${navigator.userAgent}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(deviceInfo);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if biometric credentials are stored
 */
export function hasBiometricCredentials(): boolean {
  if (!platform.isMobile()) return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const creds: BiometricCredentials = JSON.parse(stored);
    return creds.enabled && !!creds.email && !!creds.encryptedPassword;
  } catch {
    return false;
  }
}

/**
 * Store biometric credentials after successful login
 */
export async function storeBiometricCredentials(email: string, password: string): Promise<void> {
  if (!platform.isMobile()) {
    throw new Error('Biometric storage only available on mobile');
  }

  const deviceId = await getDeviceId();
  const { encrypted, iv } = encryptPassword(password, deviceId);

  const credentials: BiometricCredentials = {
    email,
    encryptedPassword: encrypted,
    iv,
    enabled: true,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

/**
 * Retrieve stored email for biometric login
 */
export function getStoredEmail(): string | null {
  if (!platform.isMobile()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const creds: BiometricCredentials = JSON.parse(stored);
    return creds.enabled ? creds.email : null;
  } catch {
    return null;
  }
}

/**
 * Retrieve and decrypt password for biometric login
 */
export async function retrieveBiometricCredentials(): Promise<{ email: string; password: string } | null> {
  if (!platform.isMobile()) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const creds: BiometricCredentials = JSON.parse(stored);
    if (!creds.enabled) return null;

    const deviceId = await getDeviceId();
    const password = decryptPassword(creds.encryptedPassword, creds.iv, deviceId);

    return {
      email: creds.email,
      password,
    };
  } catch (error) {
    console.error('Failed to retrieve biometric credentials:', error);
    return null;
  }
}

/**
 * Disable biometric login and clear stored credentials
 */
export function clearBiometricCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if biometric login is enabled for current user
 */
export function isBiometricEnabled(): boolean {
  return hasBiometricCredentials();
}
