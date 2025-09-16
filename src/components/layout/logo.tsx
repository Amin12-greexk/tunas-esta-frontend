// src/components/layout/logo.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logoColors = {
    default: 'tunas-gradient',
    white: 'bg-white',
    dark: 'bg-gray-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('flex items-center gap-3', className)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'rounded-xl flex items-center justify-center text-white font-bold',
          sizeClasses[size],
          logoColors[variant]
        )}
      >
        <span className={cn('font-display', textSizeClasses[size])}>
          T
        </span>
      </motion.div>
      
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <span className={cn(
            'font-display font-bold leading-none',
            variant === 'white' ? 'text-white' : 'text-gray-900 dark:text-white',
            textSizeClasses[size]
          )}>
            Tunas Esta
          </span>
          <span className={cn(
            'text-xs font-medium leading-none',
            variant === 'white' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
          )}>
            Indonesia
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
