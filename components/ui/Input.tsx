'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, error, helperText, value, defaultValue, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

    const inputId = id || 'input-' + label.toLowerCase().replace(/\s+/g, '-');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const isFloating = isFocused || hasValue || Boolean(value);

    return (
      <div className="relative w-full">
        <div
          className={cn(
            'relative flex flex-col justify-end h-14 bg-white rounded-lg border transition-all duration-200 px-4 pt-4 pb-1.5',
            error
              ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20'
              : isFocused
              ? 'border-accent shadow-sm ring-2 ring-accent/15'
              : 'border-black/10 hover:border-black/25',
            className
          )}
        >
          {/* Floating Label */}
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 pointer-events-none transition-all duration-200 font-medium select-none origin-left',
              isFloating
                ? 'top-2 text-[11px] uppercase tracking-wider text-secondary'
                : 'top-4 text-sm text-secondary'
            )}
          >
            {label}
          </label>

          <input
            id={inputId}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full bg-transparent text-sm text-foreground placeholder-transparent focus:outline-none"
            {...props}
          />
        </div>

        {error && <p className="mt-1.5 text-xs text-destructive font-medium pl-1">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-secondary pl-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
