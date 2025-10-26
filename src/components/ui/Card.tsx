import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = false, onClick, style }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-champagne-300 bg-white/90 p-4 sm:p-6 shadow-sm
        backdrop-blur supports-[backdrop-filter]:bg-white/75 overflow-hidden w-full
        ${hover ? 'hover-lift cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
