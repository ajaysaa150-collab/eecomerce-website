'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-colors duration-200 cursor-pointer select-none rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-foreground text-white hover:bg-black active:bg-neutral-900 group',
      secondary: 'bg-cream text-foreground hover:bg-neutral-200 active:bg-neutral-300',
      outline: 'border border-black/15 text-foreground bg-transparent hover:bg-black/5 active:bg-black/10',
      ghost: 'text-foreground bg-transparent hover:bg-black/5 active:bg-black/10',
      destructive: 'bg-destructive text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'text-xs h-9 px-3 gap-1.5 uppercase tracking-label font-semibold',
      md: 'text-sm h-11 px-5 gap-2',
      lg: 'text-base h-13 px-7 gap-2.5 font-medium',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* Shimmer sweep effect on hover for primary CTAs */}
        {variant === 'primary' && !disabled && !isLoading && (
          <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shimmer-sweep" />
        )}

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        <span className="truncate">{children}</span>

        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
