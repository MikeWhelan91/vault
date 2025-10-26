'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import {
  generateItemKey,
  generateIV,
  generateSalt,
  wrapKey,
  bytesToHex,
} from '@/lib/crypto';
import {
  Key,
  CreditCard,
  FileText,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';

interface Password {
  id: string;
  name: string;
  category: string;
  url?: string;
  username?: string;
  favorite: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  passwordEncrypted: string;
  passwordIV: string;
  notesEncrypted?: string;
  notesIV?: string;
  cardNumberEncrypted?: string;
  cardExpiryEncrypted?: string;
  cardCVVEncrypted?: string;
  cardCVVIV?: string;
  passwordKeySalt: string;
  wrappedPasswordKey: string;
  wrappedPasswordKeyIV: string;
}

interface PasswordEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPassword?: Password | null;
}

const CATEGORIES = [
  { id: 'login', name: 'Login', icon: Key },
  { id: 'card', name: 'Credit Card', icon: CreditCard },
  { id: 'secure_note', name: 'Secure Note', icon: FileText },
  { id: 'other', name: 'Other', icon: Lock },
];

export function PasswordEditor({
  isOpen,
  onClose,
  onSuccess,
  editingPassword,
}: PasswordEditorProps) {
  const { session } = useCrypto();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('login');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [favorite, setFavorite] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: 'None', color: 'bg-graphite-200' });

  useEffect(() => {
    if (editingPassword) {
      setName(editingPassword.name);
      setCategory(editingPassword.category);
      setUrl(editingPassword.url || '');
      setUsername(editingPassword.username || '');
      setFavorite(editingPassword.favorite);
      // Note: We don't decrypt existing password for security
      // User must re-enter if they want to change it
    } else {
      resetForm();
    }
  }, [editingPassword, isOpen]);

  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: 'None', color: 'bg-graphite-200' });
    }
  }, [password]);

  const resetForm = () => {
    setName('');
    setCategory('login');
    setUrl('');
    setUsername('');
    setPassword('');
    setNotes('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setFavorite(false);
  };

  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-blue-500' };
    return { score, label: 'Very Strong', color: 'bg-green-500' };
  };

  const generateRandomPassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let newPassword = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (!password && !editingPassword) {
      showToast('Please enter a password', 'error');
      return;
    }

    if (!session.masterKey) {
      showToast('Master key not available', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Encrypt password (required for new, optional for edit)
      let passwordEncrypted, passwordIV, passwordKeySalt, wrappedPasswordKey, wrappedPasswordKeyIV;

      if (password) {
        // Generate a unique key for this password entry
        const passwordKey = await generateItemKey();
        const salt = generateSalt();
        const iv = generateIV();
        const wrapIV = generateIV();

        // Encrypt the password with the password key
        const encoder = new TextEncoder();
        const passwordBytes = encoder.encode(password);
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
          passwordKey,
          passwordBytes.buffer as ArrayBuffer
        );

        // Wrap the password key with the master key
        const wrapped = await wrapKey(passwordKey, session.masterKey!, wrapIV);

        passwordEncrypted = bytesToHex(new Uint8Array(encryptedBuffer));
        passwordIV = bytesToHex(iv);
        passwordKeySalt = bytesToHex(salt);
        wrappedPasswordKey = bytesToHex(wrapped);
        wrappedPasswordKeyIV = bytesToHex(wrapIV);
      }

      // Encrypt notes if present (reuse same key as password)
      let notesEncrypted, notesIV;
      if (notes && password) {
        // Generate a unique key for notes
        const notesKey = await generateItemKey();
        const notesIv = generateIV();

        const encoder = new TextEncoder();
        const notesBytes = encoder.encode(notes);
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: notesIv.buffer as ArrayBuffer },
          notesKey,
          notesBytes.buffer as ArrayBuffer
        );

        notesEncrypted = bytesToHex(new Uint8Array(encryptedBuffer));
        notesIV = bytesToHex(notesIv);
      }

      // Encrypt card details if category is 'card'
      let cardNumberEncrypted, cardExpiryEncrypted, cardCVVEncrypted, cardCVVIV;
      if (category === 'card') {
        if (cardNumber) {
          const cardKey = await generateItemKey();
          const cardIv = generateIV();
          const encoder = new TextEncoder();
          const cardBytes = encoder.encode(cardNumber);
          const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: cardIv.buffer as ArrayBuffer },
            cardKey,
            cardBytes.buffer as ArrayBuffer
          );
          cardNumberEncrypted = bytesToHex(new Uint8Array(encryptedBuffer));
        }
        if (cardExpiry) {
          const expiryKey = await generateItemKey();
          const expiryIv = generateIV();
          const encoder = new TextEncoder();
          const expiryBytes = encoder.encode(cardExpiry);
          const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: expiryIv.buffer as ArrayBuffer },
            expiryKey,
            expiryBytes.buffer as ArrayBuffer
          );
          cardExpiryEncrypted = bytesToHex(new Uint8Array(encryptedBuffer));
        }
        if (cardCVV) {
          const cvvKey = await generateItemKey();
          const cvvIv = generateIV();
          const encoder = new TextEncoder();
          const cvvBytes = encoder.encode(cardCVV);
          const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: cvvIv.buffer as ArrayBuffer },
            cvvKey,
            cvvBytes.buffer as ArrayBuffer
          );
          cardCVVEncrypted = bytesToHex(new Uint8Array(encryptedBuffer));
          cardCVVIV = bytesToHex(cvvIv);
        }
      }

      const payload: any = {
        name,
        category,
        url: url || undefined,
        username: username || undefined,
        favorite,
      };

      // Add encrypted fields only if they exist
      if (password) {
        payload.passwordEncrypted = passwordEncrypted;
        payload.passwordIV = passwordIV;
        payload.passwordKeySalt = passwordKeySalt;
        payload.wrappedPasswordKey = wrappedPasswordKey;
        payload.wrappedPasswordKeyIV = wrappedPasswordKeyIV;
      }

      if (notes) {
        payload.notesEncrypted = notesEncrypted;
        payload.notesIV = notesIV;
      }

      if (category === 'card') {
        if (cardNumber) payload.cardNumberEncrypted = cardNumberEncrypted;
        if (cardExpiry) payload.cardExpiryEncrypted = cardExpiryEncrypted;
        if (cardCVV) {
          payload.cardCVVEncrypted = cardCVVEncrypted;
          payload.cardCVVIV = cardCVVIV;
        }
      }

      if (editingPassword) {
        // Update existing password
        const response = await fetch(`/api/passwords/${editingPassword.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to update password');
        }

        showToast('Password updated successfully', 'success');
      } else {
        // Create new password
        payload.userId = session.dbUserId;

        const response = await fetch('/api/passwords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to create password');
        }

        showToast('Password created successfully', 'success');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Password save error:', error);
      showToast('Failed to save password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingPassword ? 'Edit Password' : 'Add Password'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                    ${
                      category === cat.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-graphite-200 bg-white text-graphite-600 hover:border-graphite-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Gmail, Bank of America"
            className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Login Fields */}
        {(category === 'login' || category === 'other') && (
          <>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {/* Card Fields */}
        {category === 'card' && (
          <>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardCVV}
                  onChange={e => setCardCVV(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {/* Password Field */}
        {category !== 'secure_note' && (
          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1">
              Password {!editingPassword && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={editingPassword ? 'Leave blank to keep current password' : 'Enter password'}
                className="w-full px-4 py-2 pr-24 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required={!editingPassword}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 hover:bg-graphite-100 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-graphite-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-graphite-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="p-1.5 hover:bg-graphite-100 rounded-lg transition-colors"
                  title="Generate password"
                >
                  <RefreshCw className="w-4 h-4 text-graphite-500" />
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-graphite-600">Password Strength</span>
                  <span className={`font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-graphite-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-graphite-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any additional notes here..."
            rows={3}
            className="w-full px-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favorite"
            checked={favorite}
            onChange={e => setFavorite(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-graphite-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="favorite" className="text-sm text-graphite-700">
            Mark as favorite
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-graphite-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : editingPassword ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
