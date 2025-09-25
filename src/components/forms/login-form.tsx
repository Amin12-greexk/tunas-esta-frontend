// src/components/forms/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Logo } from '@/components/layout/logo';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth(); // asumsi: login(credentials: { nik: string; password: string }): Promise<void>
  const [formData, setFormData] = useState({ nik: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ✅ panggil dengan 1 argumen (objek)
      await login({ nik: formData.nik, password: formData.password });
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Login gagal. Silakan periksa NIK dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tunas-blue-50 via-white to-tunas-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo size="md" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Selamat Datang
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Silakan masuk ke akun Anda
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIK */}
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input
                id="nik"
                type="text"
                placeholder="Masukkan NIK Anda"
                value={formData.nik}
                onChange={handleInputChange('nik')}
                required
                disabled={isLoading}
                className="h-12"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={isLoading}
                  className="h-12 pr-12"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 tunas-gradient text-white font-semibold hover:shadow-lg transition-shadow"
              disabled={isLoading || !formData.nik || !formData.password}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 PT. Tunas Esta Indonesia
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
