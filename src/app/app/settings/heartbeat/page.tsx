'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import type { HeartbeatSettings } from '@/types';

export default function HeartbeatSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<HeartbeatSettings>({
    enabled: false,
    cadenceDays: 30,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('heartbeat_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load heartbeat settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    setIsLoading(true);

    try {
      // Validate
      if (settings.cadenceDays < 1 || settings.cadenceDays > 365) {
        showToast('Cadence must be between 1 and 365 days', 'error');
        return;
      }

      // Save to localStorage (in production, this would sync with backend)
      localStorage.setItem('heartbeat_settings', JSON.stringify(settings));

      showToast('Heartbeat settings saved', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeartbeat = () => {
    const now = new Date().toISOString();
    const nextHeartbeat = new Date(Date.now() + settings.cadenceDays * 24 * 60 * 60 * 1000).toISOString();

    const updatedSettings = {
      ...settings,
      lastHeartbeat: now,
      nextHeartbeat,
    };

    setSettings(updatedSettings);
    localStorage.setItem('heartbeat_settings', JSON.stringify(updatedSettings));

    showToast('Heartbeat recorded successfully', 'success');
  };

  const getHeartbeatStatus = () => {
    if (!settings.enabled) {
      return { color: 'gray', message: 'Heartbeat monitoring is disabled' };
    }

    if (!settings.lastHeartbeat) {
      return { color: 'yellow', message: 'No heartbeat recorded yet' };
    }

    const nextHeartbeat = new Date(settings.nextHeartbeat!);
    const now = new Date();
    const daysUntil = Math.ceil((nextHeartbeat.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (daysUntil < 0) {
      return { color: 'red', message: `Heartbeat overdue by ${Math.abs(daysUntil)} days` };
    }

    if (daysUntil <= 7) {
      return { color: 'yellow', message: `Next heartbeat due in ${daysUntil} days` };
    }

    return { color: 'green', message: `Next heartbeat due in ${daysUntil} days` };
  };

  const status = getHeartbeatStatus();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          💓 Heartbeat Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure automated monitoring to trigger releases if you fail to check in
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Status
          </h2>
          <span
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${status.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
              ${status.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
              ${status.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
            `}
          >
            {status.message}
          </span>
        </div>

        {settings.lastHeartbeat && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Last heartbeat:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(settings.lastHeartbeat).toLocaleString()}
              </span>
            </div>
            {settings.nextHeartbeat && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Next heartbeat due:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(settings.nextHeartbeat).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {settings.enabled && (
          <Button onClick={handleHeartbeat} className="w-full">
            Send Heartbeat
          </Button>
        )}
      </Card>

      {/* Configuration */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Configuration
        </h2>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Heartbeat Monitoring
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Require regular check-ins to prevent automatic releases
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${settings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Cadence */}
          <Input
            type="number"
            label="Check-in Cadence (days)"
            value={settings.cadenceDays}
            onChange={(e) => setSettings({ ...settings, cadenceDays: parseInt(e.target.value) || 1 })}
            helperText="How often you need to send a heartbeat"
            min={1}
            max={365}
            disabled={!settings.enabled}
          />

          {/* Save Button */}
          <Button onClick={handleSave} isLoading={isLoading} className="w-full">
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How It Works
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            <strong>1. Enable monitoring:</strong> Turn on heartbeat monitoring and set your check-in cadence.
          </p>
          <p>
            <strong>2. Regular check-ins:</strong> Come back and click &quot;Send Heartbeat&quot; before the deadline.
          </p>
          <p>
            <strong>3. Automatic trigger:</strong> If you miss a heartbeat, any release bundles configured with heartbeat mode will be automatically sent to your trustees.
          </p>
        </div>
      </Card>

      {/* Warning Card */}
      {settings.enabled && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Important Reminder
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Make sure to set reminders to check in regularly. Missing a heartbeat will trigger
                release of sensitive information to your designated trustees.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
