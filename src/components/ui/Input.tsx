import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-plum-800 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-2.5 border rounded-lg
              bg-white text-plum-900
              focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
              disabled:bg-champagne-100 disabled:cursor-not-allowed
              transition-all duration-200
              placeholder:text-plum-500
              ${error ? 'border-primary-600' : 'border-champagne-300'}
              ${isPasswordField ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-600 hover:text-primary-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-primary-700">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-plum-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
