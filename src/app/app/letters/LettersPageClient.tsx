'use client';

import React, { useState, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Mail, Calendar, Plus, Trash2, Crown } from 'lucide-react';
import Link from 'next/link';
import type { TierName } from '@/lib/pricing';

interface ScheduledLetter {
  id: string;
  title: string;
  recipient: string;
  recipientName?: string;
  scheduleType: string;
  scheduleDate: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

export default function LettersPageClient() {
  const { metadata, session } = useCrypto();
  const { showToast } = useToast();
  const [letters, setLetters] = useState<ScheduledLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [scheduleType, setScheduleType] = useState<'date' | 'birthday' | 'anniversary' | 'yearly'>('date');
  const [scheduleDate, setScheduleDate] = useState('');
  const [yearlyMonth, setYearlyMonth] = useState(1);
  const [yearlyDay, setYearlyDay] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const tier = (metadata?.tier as TierName) || 'free';
  const isPaidUser = tier !== 'free';

  useEffect(() => {
    if (session.dbUserId && isPaidUser) {
      fetchLetters();
    } else {
      setIsLoading(false);
    }
  }, [session.dbUserId, isPaidUser]);

  const fetchLetters = async () => {
    try {
      const response = await fetch(`/api/letters?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setLetters(data.letters || []);
      }
    } catch (error) {
      console.error('Failed to fetch letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLetter = async () => {
    if (!title.trim() || !recipient.trim() || !letterContent.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (scheduleType === 'date' && !scheduleDate) {
      showToast('Please select a date', 'error');
      return;
    }

    setIsCreating(true);
    try {
      // Determine schedule date
      let finalScheduleDate: string;
      if (scheduleType === 'date') {
        finalScheduleDate = new Date(scheduleDate).toISOString();
      } else if (scheduleType === 'yearly') {
        const now = new Date();
        const year = now.getFullYear();
        finalScheduleDate = new Date(year, yearlyMonth - 1, yearlyDay).toISOString();
      } else {
        finalScheduleDate = new Date().toISOString();
      }

      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          title,
          recipient,
          recipientName: recipientName || null,
          scheduleType,
          scheduleDate: finalScheduleDate,
          yearlyMonth: scheduleType === 'yearly' ? yearlyMonth : null,
          yearlyDay: scheduleType === 'yearly' ? yearlyDay : null,
          letterContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create letter');
      }

      showToast('Letter scheduled successfully', 'success');
      await fetchLetters();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create letter', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled letter?')) return;

    try {
      const response = await fetch(`/api/letters/${letterId}?userId=${session.dbUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete letter');
      }

      showToast('Letter deleted successfully', 'success');
      await fetchLetters();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete letter', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setRecipient('');
    setRecipientName('');
    setLetterContent('');
    setScheduleType('date');
    setScheduleDate('');
    setYearlyMonth(1);
    setYearlyDay(1);
  };

  if (!isPaidUser) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                <Mail className="h-4 w-4" />
                Letter Scheduler
              </span>
              <h1 className="text-3xl font-semibold text-graphite-900">Schedule letters for the future</h1>
              <p className="mt-2 text-sm text-graphite-600">
                Write letters to be delivered on birthdays, anniversaries, or any special date.
              </p>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-amber-300 bg-amber-100 text-amber-600">
              <Crown className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-graphite-900">Plus Feature</h2>
            <p className="mt-2 max-w-sm text-sm text-graphite-600">
              Letter scheduling is a Plus-exclusive feature. Upgrade to schedule letters to loved ones for future dates.
            </p>
            <Link href="/app/pricing" className="mt-6">
              <Button size="lg">Upgrade to Plus</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-graphite-200 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <Mail className="h-4 w-4" />
              Letter Scheduler
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-graphite-900">Your scheduled letters</h1>
              <p className="mt-2 text-sm text-graphite-600">
                Write letters to be delivered on birthdays, anniversaries, or any special date.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-4 w-4" />
            <span className="ml-2">Schedule new letter</span>
          </Button>
        </div>
      </section>

      {letters.length === 0 ? (
        <Card className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-graphite-200 bg-graphite-50 text-primary-600">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-graphite-900">No scheduled letters yet</h2>
            <p className="mt-2 max-w-sm text-sm text-graphite-600">
              Create your first scheduled letter to send heartfelt messages on future dates.
            </p>
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="mt-6">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Schedule your first letter</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {letters.map((letter) => (
            <Card key={letter.id} className="rounded-3xl border border-graphite-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-graphite-900">{letter.title}</h3>
                      {letter.sent ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Sent
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-graphite-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-graphite-400" />
                        To: {letter.recipientName || letter.recipient}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-graphite-400" />
                        {letter.sent
                          ? `Sent ${new Date(letter.sentAt!).toLocaleDateString()}`
                          : `Scheduled for ${new Date(letter.scheduleDate).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>
                </div>
                {!letter.sent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLetter(letter.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Schedule a Letter"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Letter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Birthday wishes for Sarah"
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Recipient Email"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="sarah@example.com"
              required
            />
            <Input
              label="Recipient Name (optional)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Sarah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              When should this be sent?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="date"
                  checked={scheduleType === 'date'}
                  onChange={() => setScheduleType('date')}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-graphite-900">Specific date</span>
              </label>
              {scheduleType === 'date' && (
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="ml-6"
                />
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="yearly"
                  checked={scheduleType === 'yearly'}
                  onChange={() => setScheduleType('yearly')}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-graphite-900">Yearly (birthday/anniversary)</span>
              </label>
              {scheduleType === 'yearly' && (
                <div className="ml-6 flex gap-2">
                  <Input
                    type="number"
                    label="Month"
                    value={yearlyMonth}
                    onChange={(e) => setYearlyMonth(parseInt(e.target.value) || 1)}
                    min={1}
                    max={12}
                  />
                  <Input
                    type="number"
                    label="Day"
                    value={yearlyDay}
                    onChange={(e) => setYearlyDay(parseInt(e.target.value) || 1)}
                    min={1}
                    max={31}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letter Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-graphite-900"
              rows={10}
              placeholder="Write your letter here..."
              required
            />
            <p className="text-xs text-graphite-500 mt-1">
              This letter will be sent via email on the scheduled date
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLetter} isLoading={isCreating}>
              Schedule Letter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
