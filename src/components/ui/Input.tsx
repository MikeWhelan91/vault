import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-graphite-700 dark:text-ivory-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 border rounded-lg
            bg-white text-graphite-900
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-graphite-50 disabled:cursor-not-allowed
            dark:bg-graphite-800 dark:border-graphite-600 dark:text-ivory-50
            transition-all duration-200
            placeholder:text-graphite-400 dark:placeholder:text-graphite-500
            ${error ? 'border-red-500' : 'border-graphite-300 dark:border-graphite-600'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-graphite-500 dark:text-graphite-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
