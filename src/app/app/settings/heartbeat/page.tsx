'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { useCrypto } from '@/contexts/CryptoContext';

interface HeartbeatData {
  enabled: boolean;
  cadenceDays: number;
  lastHeartbeat?: string;
  nextHeartbeat?: string;
}

export default function HeartbeatSettingsPage() {
  const { showToast } = useToast();
  const { session } = useCrypto();
  const [heartbeat, setHeartbeat] = useState<HeartbeatData>({
    enabled: false,
    cadenceDays: 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch heartbeat settings on mount
  useEffect(() => {
    const fetchHeartbeat = async () => {
      try {
        const response = await fetch(`/api/heartbeat?userId=${session.dbUserId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.heartbeat) {
            setHeartbeat(data.heartbeat);
          }
        }
      } catch (error) {
        console.error('Failed to fetch heartbeat:', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (session.dbUserId) {
      fetchHeartbeat();
    }
  }, [session.dbUserId]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validate
      if (heartbeat.cadenceDays < 1 || heartbeat.cadenceDays > 365) {
        showToast('Check-in frequency must be between 1 and 365 days', 'error');
        return;
      }

      const response = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          enabled: heartbeat.enabled,
          cadenceDays: heartbeat.cadenceDays,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setHeartbeat(data.heartbeat);

      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.dbUserId,
          recordHeartbeat: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record check-in');
      }

      const data = await response.json();
      setHeartbeat(data.heartbeat);

      showToast('Check-in recorded successfully!', 'success');
    } catch (error) {
      console.error('Check-in error:', error);
      showToast('Failed to record check-in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatus = () => {
    if (!heartbeat.enabled) {
      return { color: 'gray', message: 'Check-ins not enabled' };
    }

    if (!heartbeat.lastHeartbeat) {
      return { color: 'yellow', message: 'No check-ins yet' };
    }

    const nextCheckIn = new Date(heartbeat.nextHeartbeat!);
    const now = new Date();
    const daysUntil = Math.ceil((nextCheckIn.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (daysUntil < 0) {
      return { color: 'red', message: `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}` };
    }

    if (daysUntil === 0) {
      return { color: 'yellow', message: 'Check in needed today' };
    }

    if (daysUntil <= 3) {
      return { color: 'yellow', message: `Check in needed in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}` };
    }

    return { color: 'green', message: `All good for ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}` };
  };

  const status = getStatus();

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-graphite-900">
          Check-In Settings
        </h1>
        <p className="text-graphite-600 mt-1">
          Set up regular check-ins so your memories are shared if something happens
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-graphite-900">
            Status
          </h2>
          <span
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${status.color === 'green' ? 'bg-green-100 text-green-800' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${status.color === 'red' ? 'bg-red-100 text-red-800' : ''}
              ${status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
            `}
          >
            {status.message}
          </span>
        </div>

        {heartbeat.lastHeartbeat && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-graphite-600">Last check-in:</span>
              <span className="font-medium text-graphite-900">
                {new Date(heartbeat.lastHeartbeat).toLocaleDateString()}
              </span>
            </div>
            {heartbeat.nextHeartbeat && (
              <div className="flex justify-between text-sm">
                <span className="text-graphite-600">Next check-in by:</span>
                <span className="font-medium text-graphite-900">
                  {new Date(heartbeat.nextHeartbeat).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {heartbeat.enabled && (
          <Button onClick={handleCheckIn} isLoading={isLoading} className="w-full">
            Check In Now
          </Button>
        )}
      </Card>

      {/* Configuration */}
      <Card>
        <h2 className="text-xl font-semibold text-graphite-900 mb-4">
          Configuration
        </h2>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Check-Ins
              </label>
              <p className="text-sm text-graphite-500">
                You&apos;ll need to check in regularly to keep your releases on hold
              </p>
            </div>
            <button
              onClick={() => setHeartbeat({ ...heartbeat, enabled: !heartbeat.enabled })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500
                ${heartbeat.enabled ? 'bg-primary-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${heartbeat.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Cadence */}
          <Input
            type="number"
            label="How often should you check in? (days)"
            value={heartbeat.cadenceDays}
            onChange={(e) => setHeartbeat({ ...heartbeat, cadenceDays: parseInt(e.target.value) || 1 })}
            helperText="If you don't check in for this long, your releases will be triggered"
            min={1}
            max={365}
            disabled={!heartbeat.enabled}
          />

          {/* Save Button */}
          <Button onClick={handleSave} isLoading={isLoading} className="w-full">
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary-50 border-primary-200">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          How Check-Ins Work
        </h3>
        <div className="space-y-2 text-sm text-primary-800">
          <p>
            <strong>1. Turn it on:</strong> Enable check-ins and choose how often you want to check in (e.g., every 30 days).
          </p>
          <p>
            <strong>2. Check in regularly:</strong> Come back before your deadline and click &quot;Check In Now&quot;.
          </p>
          <p>
            <strong>3. Automatic sharing:</strong> If you don&apos;t check in on time, your memories will automatically be sent to the people you&apos;ve chosen.
          </p>
        </div>
      </Card>

      {/* Warning Card */}
      {heartbeat.enabled && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                Set a reminder!
              </h3>
              <p className="text-sm text-yellow-800">
                We recommend setting a calendar reminder to check in. Missing your check-in will trigger your releases.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
