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
        group relative rounded-2xl border border-graphite-200/70 bg-white/90 p-6 shadow-[0_18px_36px_-28px_rgba(51,55,61,0.55)]
        backdrop-blur-sm transition-all duration-300 dark:border-graphite-700/60 dark:bg-graphite-900/70
        ${
          hover
            ? 'hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-40px_rgba(51,55,61,0.6)] cursor-pointer'
            : 'hover:shadow-[0_24px_50px_-38px_rgba(51,55,61,0.35)]'
        }
        ${className}
      `}
      onClick={onClick}
    >
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/40 via-transparent to-teal-50/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-graphite-800/40 dark:to-primary-900/30" />
    </div>
  );
}
