// src/app/not-found.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tunas-blue-50 via-white to-tunas-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >

        <h1 className="text-8xl font-bold bg-gradient-to-r from-tunas-blue-600 to-tunas-green-600 bg-clip-text text-transparent">
          404
        </h1>
        
        <p className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Halaman Tidak Ditemukan
        </p>
        
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>

        <Button asChild className="mt-8 tunas-gradient text-white font-semibold hover:shadow-lg transition-shadow">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}