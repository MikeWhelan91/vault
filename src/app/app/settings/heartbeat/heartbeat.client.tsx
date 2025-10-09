'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import type { HeartbeatSettings } from '@/types';

export default function HeartbeatClient() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<HeartbeatSettings>({
    enabled: false,
    cadenceDays: 30,
  });
  const [isLoading, setIsLoading] = useState(false);

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
      if (settings.cadenceDays < 1 || settings.cadenceDays > 365) {
        showToast('Cadence must be between 1 and 365 days', 'error');
        return;
      }

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

  const status = getHeartbeatStatus(settings);

  return (
    <div className="space-y-12">
      <section className="gradient-panel relative overflow-hidden p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-graphite-500">
              Continuity signal
            </span>
            <h1 className="text-4xl font-light tracking-tight text-graphite-900 dark:text-ivory-50">
              Keep your vault heartbeat alive
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-graphite-600 dark:text-graphite-300">
              Automate gentle reminders to confirm you&apos;re still in control. If heartbeats stop, your release bundles can automatically escalate.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-6" onClick={handleHeartbeat} disabled={!settings.enabled}>
                Send heartbeat now
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-6"
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              >
                {settings.enabled ? 'Pause monitoring' : 'Enable monitoring'}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/50 bg-white/80 px-6 py-5 text-sm shadow-sm backdrop-blur dark:border-graphite-700/70 dark:bg-graphite-900/70">
              <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">Status</p>
              <p className="mt-3 text-2xl font-light text-graphite-900 dark:text-ivory-50">{status.message}</p>
              <p className="text-xs text-graphite-500 dark:text-graphite-300">
                {settings.enabled ? 'Monitoring is active and trustees will be notified if you miss your cadence.' : 'Monitoring is off. Releases won\'t trigger from missed heartbeats.'}
              </p>
            </div>
            <div className="placeholder-box h-32 w-full border border-graphite-200/60 dark:border-graphite-700/60" aria-hidden />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Heartbeat cadence</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Define how often Unlatches should expect your confirmation.
            </p>
          </header>

          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-graphite-200/70 bg-white/70 px-5 py-4 text-sm dark:border-graphite-600 dark:bg-graphite-900/60">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-graphite-400">Monitoring</p>
                <p className="text-sm font-medium text-graphite-900 dark:text-ivory-50">
                  {settings.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border border-transparent transition ${
                  settings.enabled ? 'bg-graphite-900' : 'bg-graphite-200'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Input
              type="number"
              label="Check-in cadence (days)"
              value={settings.cadenceDays}
              onChange={(e) => setSettings({ ...settings, cadenceDays: parseInt(e.target.value) || 1 })}
              helperText="Number of days between required heartbeats"
              min={1}
              max={365}
              disabled={!settings.enabled}
            />

            <Button className="rounded-full px-6" onClick={handleSave} isLoading={isLoading}>
              Save cadence
            </Button>
          </div>
        </Card>

        <Card className="space-y-5">
          <header>
            <h2 className="text-xl font-semibold text-graphite-900 dark:text-ivory-50">Timeline</h2>
            <p className="text-sm text-graphite-500 dark:text-graphite-300">
              Track your last check-in and when the next one is due.
            </p>
          </header>

          <div className="space-y-4 rounded-2xl border border-graphite-200/70 bg-white/70 p-5 text-sm dark:border-graphite-600 dark:bg-graphite-900/60">
            <TimelineRow label="Last heartbeat" value={settings.lastHeartbeat ? new Date(settings.lastHeartbeat).toLocaleString() : 'Not recorded yet'} />
            <TimelineRow label="Next heartbeat" value={settings.nextHeartbeat ? new Date(settings.nextHeartbeat).toLocaleString() : 'Pending'} />
            <TimelineRow
              label="Cadence"
              value={`${settings.cadenceDays} day${settings.cadenceDays === 1 ? '' : 's'}`}
            />
          </div>
        </Card>
      </section>

      <Card className="space-y-3 border border-amber-200/70 bg-amber-50/80 p-6 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100">
        <h3 className="text-base font-semibold">How heartbeats secure trustees</h3>
        <p>
          Heartbeats confirm you&apos;re still present. If reminders go unanswered, your release bundles can automatically unlock for the trusted contacts you choose.
        </p>
      </Card>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.35em] text-graphite-400">{label}</span>
      <span className="text-sm font-medium text-graphite-900 dark:text-ivory-50">{value}</span>
    </div>
  );
}

function getHeartbeatStatus(settings: HeartbeatSettings) {
  if (!settings.enabled) {
    return { tone: 'muted', message: 'Monitoring disabled' };
  }

  if (!settings.lastHeartbeat) {
    return { tone: 'pending', message: 'Awaiting first heartbeat' };
  }

  const nextHeartbeat = settings.nextHeartbeat ? new Date(settings.nextHeartbeat) : undefined;
  const now = new Date();
  const daysUntil = nextHeartbeat ? Math.ceil((nextHeartbeat.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : undefined;

  if (daysUntil !== undefined && daysUntil < 0) {
    return { tone: 'alert', message: `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}` };
  }

  if (daysUntil !== undefined && daysUntil <= 7) {
    return { tone: 'warning', message: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}` };
  }

  return { tone: 'ready', message: `Next check-in in ${daysUntil ?? settings.cadenceDays} days` };
}
