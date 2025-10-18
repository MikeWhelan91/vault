'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/95 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl border border-graphite-700 bg-graphite-800 p-8 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <WifiOff className="h-12 w-12 text-red-400" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-white">
          No Internet Connection
        </h2>
        <p className="mb-4 text-sm text-graphite-300">
          Forebearer requires an internet connection to access your encrypted vault and sync your data securely.
        </p>
        <p className="text-xs text-graphite-400">
          Please check your connection and try again.
        </p>
      </div>
    </div>
  );
}
