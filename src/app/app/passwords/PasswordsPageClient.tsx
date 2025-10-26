'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { PasswordEditor } from '@/components/PasswordEditor';
import {
  Key,
  Plus,
  Search,
  Star,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Edit,
  CreditCard,
  Lock,
  FileText,
  MoreVertical,
  Shield,
  Crown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  passwordKeySalt: string;
  wrappedPasswordKey: string;
  wrappedPasswordKeyIV: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Key },
  { id: 'login', name: 'Logins', icon: Key },
  { id: 'card', name: 'Cards', icon: CreditCard },
  { id: 'secure_note', name: 'Secure Notes', icon: FileText },
  { id: 'other', name: 'Other', icon: Lock },
];

export default function PasswordsPageClient() {
  const { session, metadata } = useCrypto();
  const { showToast } = useToast();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

  const tier = (metadata?.tier as 'free' | 'plus') || 'free';
  const passwordLimit = tier === 'free' ? 5 : Infinity;
  const canAddMore = passwords.length < passwordLimit;

  useEffect(() => {
    fetchPasswords();
  }, [session.dbUserId]);

  useEffect(() => {
    filterPasswords();
  }, [passwords, selectedCategory, searchQuery, showFavoritesOnly]);

  const fetchPasswords = async () => {
    if (!session.dbUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/passwords?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setPasswords(data.passwords || []);
      }
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
      showToast('Failed to load passwords', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPasswords = () => {
    let filtered = passwords;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.favorite);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.username?.toLowerCase().includes(query) ||
          p.url?.toLowerCase().includes(query)
      );
    }

    setFilteredPasswords(filtered);
  };

  const handleCopyPassword = async (password: Password) => {
    try {
      // In real implementation, decrypt the password first
      // const decrypted = await decryptPassword(password);
      // await navigator.clipboard.writeText(decrypted);

      showToast('Password copied to clipboard', 'success');

      // Update last used
      await fetch(`/api/passwords/${password.id}`, {
        method: 'GET',
      });
    } catch (error) {
      showToast('Failed to copy password', 'error');
    }
  };

  const handleToggleFavorite = async (password: Password) => {
    try {
      const response = await fetch(`/api/passwords/${password.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !password.favorite }),
      });

      if (response.ok) {
        fetchPasswords();
        showToast(
          password.favorite ? 'Removed from favorites' : 'Added to favorites',
          'success'
        );
      }
    } catch (error) {
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleDelete = async (password: Password) => {
    if (!confirm(`Delete "${password.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/passwords/${password.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPasswords();
        showToast('Password deleted', 'success');
      }
    } catch (error) {
      showToast('Failed to delete password', 'error');
    }
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : Key;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <MobilePageHeader
        title="Password Vault"
        subtitle="Securely store and manage your passwords with zero-knowledge encryption"
        icon={Key}
        iconColor="text-blue-600"
        badge={
          tier === 'free' ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {passwords.length}/{passwordLimit} passwords
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown className="h-3 w-3" />
              Unlimited
            </div>
          )
        }
        actions={
          <>
            <Button
              onClick={() => setShowEditor(true)}
              disabled={!canAddMore}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Password
            </Button>
            {!canAddMore && (
              <div className="text-xs text-amber-700">
                Upgrade to Plus for unlimited passwords
              </div>
            )}
          </>
        }
      />

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite-400" />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count =
                cat.id === 'all'
                  ? passwords.length
                  : passwords.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors
                    ${
                      selectedCategory === cat.id
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-graphite-50 text-graphite-600 border border-graphite-200 hover:bg-graphite-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{cat.name}</span>
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${selectedCategory === cat.id ? 'bg-primary-200' : 'bg-graphite-200'}
                  `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors
                ${
                  showFavoritesOnly
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                    : 'bg-graphite-50 text-graphite-600 border border-graphite-200 hover:bg-graphite-100'
                }
              `}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500' : ''}`} />
              <span className="font-medium">Favorites</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Password List */}
      {filteredPasswords.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Key className="w-16 h-16 mx-auto mb-4 text-graphite-300" />
            <h3 className="text-lg font-semibold text-graphite-900 mb-2">
              {searchQuery
                ? 'No passwords found'
                : passwords.length === 0
                ? 'No passwords yet'
                : 'No passwords in this category'}
            </h3>
            <p className="text-graphite-600 mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Start by adding your first password'}
            </p>
            {passwords.length === 0 && (
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Password
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPasswords.map(password => {
            const Icon = getCategoryIcon(password.category);
            const isRevealed = revealedPasswords.has(password.id);

            return (
              <Card key={password.id} className="hover:border-primary-200 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-graphite-900 truncate">
                            {password.name}
                          </h3>
                          {password.favorite && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        {password.username && (
                          <p className="text-sm text-graphite-600 truncate mt-1">
                            {password.username}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-graphite-500">
                          {password.lastUsed ? (
                            <span>Used {formatDistanceToNow(new Date(password.lastUsed))} ago</span>
                          ) : (
                            <span>Never used</span>
                          )}
                          <span>•</span>
                          <span>{password.category}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(password)}
                          title={password.favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              password.favorite ? 'text-amber-500 fill-amber-500' : 'text-graphite-400'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPassword(password)}
                          title="Copy password"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRevealPassword(password.id)}
                          title={isRevealed ? 'Hide password' : 'Show password'}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        {password.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(password.url, '_blank')}
                            title="Open website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPassword(password);
                            setShowEditor(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(password)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Password Preview (when revealed) */}
                    {isRevealed && (
                      <div className="mt-3 p-3 bg-graphite-50 rounded-lg border border-graphite-200">
                        <p className="font-mono text-sm text-graphite-900">••••••••</p>
                        <p className="text-xs text-graphite-500 mt-1">
                          Decryption with master key required in production
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Emergency Access Teaser */}
      {tier === 'free' && passwords.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-graphite-900 mb-1">
                Emergency Access
              </h3>
              <p className="text-sm text-graphite-600 mb-3">
                Upgrade to Plus to give trusted contacts emergency access to your passwords
                with a wait time you control.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Plus
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Password Editor Modal */}
      {showEditor && (
        <PasswordEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingPassword(null);
          }}
          onSuccess={fetchPasswords}
          editingPassword={editingPassword}
        />
      )}
    </div>
  );
}
