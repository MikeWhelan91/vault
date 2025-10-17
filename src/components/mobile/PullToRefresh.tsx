'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { useIsNativeApp } from '@/lib/platform';
import { haptics } from '@/lib/mobile';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const isNativeApp = useIsNativeApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    if (!isNativeApp) return;

    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if at the top of the page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        touchStartY.current = startY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      // Only pull down
      if (diff > 0 && window.scrollY === 0) {
        // Prevent default scroll
        e.preventDefault();

        // Apply resistance (gets harder to pull the further you go)
        const resistance = Math.min(diff / 2, MAX_PULL);
        setPullDistance(resistance);

        if (resistance >= PULL_THRESHOLD && !shouldRefresh) {
          setShouldRefresh(true);
          haptics.light();
        } else if (resistance < PULL_THRESHOLD && shouldRefresh) {
          setShouldRefresh(false);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      isPulling = false;

      if (shouldRefresh && !isRefreshing) {
        setIsRefreshing(true);
        await haptics.medium();

        try {
          await onRefresh();
          await haptics.success();
        } catch (error) {
          console.error('Refresh failed:', error);
          await haptics.error();
        }

        setIsRefreshing(false);
      }

      setPullDistance(0);
      setShouldRefresh(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isNativeApp, isRefreshing, shouldRefresh, onRefresh]);

  if (!isNativeApp) {
    return <>{children}</>;
  }

  const rotation = Math.min((pullDistance / PULL_THRESHOLD) * 360, 360);
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          top: `${-40 + pullDistance}px`,
          opacity,
        }}
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg
              className="h-5 w-5 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? PULL_THRESHOLD : pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
