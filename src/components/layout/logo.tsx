// src/components/layout/logo.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // <-- Impor komponen Image

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'h-8 w-8', text: 'text-lg' },
    md: { container: 'h-10 w-10', text: 'text-xl' },
    lg: { container: 'h-12 w-12', text: 'text-2xl' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('flex items-center gap-3', className)}
    >
      {/* Bagian ini diganti dari div menjadi komponen Image */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={cn('relative', sizeClasses[size].container)}
      >
        <Image
          src="/logo.png" // <-- Ganti dengan nama file gambar Anda
          alt="Tunas Esta Indonesia Logo"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
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
            sizeClasses[size].text
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