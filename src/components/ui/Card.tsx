import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-graphite-200 bg-white/90 p-6 shadow-sm transition-colors
        dark:border-graphite-700 dark:bg-graphite-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/75
        dark:supports-[backdrop-filter]:bg-graphite-900/50
        ${hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
