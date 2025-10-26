'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heart, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BundleCheckInProps {
  bundleId: string;
  bundleName: string;
  lastHeartbeat?: string;
  nextHeartbeat?: string;
  cadenceDays: number;
  onCheckInSuccess?: () => void;
}

export function BundleCheckIn({
  bundleId,
  bundleName,
  lastHeartbeat,
  nextHeartbeat,
  cadenceDays,
  onCheckInSuccess,
}: BundleCheckInProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const now = new Date();
  const deadline = nextHeartbeat ? new Date(nextHeartbeat) : null;
  const isOverdue = deadline && deadline < now;
  const hoursUntilDeadline = deadline
    ? (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    : null;
  const isUrgent = hoursUntilDeadline !== null && hoursUntilDeadline < 48; // Less than 2 days

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    setError(null);

    try {
      const response = await fetch(`/api/bundles/${bundleId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to check in');
      }

      setSuccess(true);
      // Don't reset success - keep it persistent

      // Call success callback to refresh bundle data
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Card
      className={`
        ${isOverdue ? 'border-2 border-red-400 bg-red-50' : ''}
        ${isUrgent && !isOverdue ? 'border-2 border-amber-400 bg-amber-50' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Heart className={`w-5 h-5 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-graphite-900">
                {isOverdue ? '⚠️ Check-In Overdue' : 'Heartbeat Check-In'}
              </h3>
              <p className="text-sm text-graphite-700 font-medium">&quot;{bundleName}&quot;</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-graphite-500" />
              <span className="text-graphite-700">
                {deadline ? (
                  isOverdue ? (
                    <span className="font-semibold text-red-700">
                      Overdue by {formatDistanceToNow(deadline)}
                    </span>
                  ) : (
                    <>
                      Next check-in: <span className="font-medium">{formatDistanceToNow(deadline, { addSuffix: true })}</span>
                    </>
                  )
                ) : (
                  'No deadline set'
                )}
              </span>
            </div>

            {lastHeartbeat && (
              <div className="text-graphite-600">
                Last check-in: {formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true })}
              </div>
            )}

            <div className="text-graphite-600">
              Check-in every {cadenceDays} {cadenceDays === 1 ? 'day' : 'days'}
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              Check-in successful! Timer reset.
            </div>
          )}
        </div>

        <Button
          onClick={handleCheckIn}
          isLoading={isCheckingIn}
          disabled={success}
          size="sm"
          className={`
            ${isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}
            ${isUrgent && !isOverdue ? 'bg-amber-600 hover:bg-amber-700' : ''}
            ${success ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
          `}
        >
          {success ? '✓ Checked In' : isOverdue ? '⚠️ Check In Now' : "I'm Alive"}
        </Button>
      </div>
    </Card>
  );
}
