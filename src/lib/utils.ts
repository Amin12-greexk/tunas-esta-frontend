// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { id as localeId } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: localeId });
}

export function formatTime(time: string): string {
  return format(parseISO(`1970-01-01T${time}`), 'HH:mm');
}

export function formatDateTime(datetime: string): string {
  return format(parseISO(datetime), 'dd MMM yyyy, HH:mm', { locale: localeId });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Hadir': 'bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200',
    'Terlambat': 'bg-tunas-yellow-100 text-tunas-yellow-800 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-200',
    'Izin': 'bg-tunas-blue-100 text-tunas-blue-800 dark:bg-tunas-blue-900 dark:text-tunas-blue-200',
    'Cuti': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Alpha': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Libur': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Aktif': 'bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200',
    'Resign': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}