// src/components/animations/loading-spinner.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'company';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

// Default spinner dengan company branding
export function LoadingSpinner({ 
  size = 'md', 
  variant = 'company',
  className = '',
  text = ''
}: LoadingSpinnerProps) {
  if (variant === 'company') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <motion.div 
          className={cn('relative', sizeClasses[size])}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Company Logo/Icon */}
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <defs>
              <linearGradient id="company-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <motion.path 
              d="M12 2L22 20H2L12 2Z" 
              fill="url(#company-gradient)" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Outer rotating ring */}
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 border-r-yellow-500"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        {text && (
          <motion.p 
            className={cn('text-gray-600 dark:text-gray-400 font-medium', textSizeClasses[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-full bg-current', sizeClasses.sm)}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn('rounded-full bg-current', sizeClasses[size], className)}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-full bg-current', sizeClasses.sm)}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        'border-2 border-gray-200 border-t-blue-500 rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}