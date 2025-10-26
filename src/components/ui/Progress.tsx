import React from 'react';

export interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'warning' | 'danger';
}

export function Progress({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colors = {
    primary: 'bg-primary-600',
    accent: 'bg-accent-600',
    warning: 'bg-primary-500',
    danger: 'bg-primary-700',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-plum-800">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-plum-600">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-champagne-200 rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} ${colors[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
