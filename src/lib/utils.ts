// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, parseISO, isValid } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ------------ helpers tanggal/jam yang robust ------------
function parseDateLike(input: string | Date): Date | null {
  if (input instanceof Date) return isValid(input) ? input : null;
  if (!input) return null;

  const s = String(input).trim();
  // 1) ISO langsung
  if (s.includes("T")) {
    const dIso = parseISO(s.replace(" ", "T"));
    if (isValid(dIso)) return dIso;
  }

  // 2) "YYYY-MM-DD HH:mm[:ss]"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const withT = s.replace(" ", "T");
    const normalized = withT.length === 16 ? withT + ":00" : withT; // kalau HH:mm → tambah :ss
    const d = parseISO(normalized);
    if (isValid(d)) return d;

    // cadangan parse ketat
    const d2 = parse(s, "yyyy-MM-dd HH:mm:ss", new Date());
    if (isValid(d2)) return d2;
  }

  // 3) Hanya jam "HH:mm" / "HH:mm:ss"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const fmt = s.length <= 5 ? "HH:mm" : "HH:mm:ss";
    const d = parse(s, fmt, new Date());
    if (isValid(d)) return d;
  }

  // 4) Hanya tanggal "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parse(s, "yyyy-MM-dd", new Date());
    if (isValid(d)) return d;
  }

  // 5) Coba parseISO terakhir (kalau ada format lain yang valid)
  try {
    const d = parseISO(s);
    if (isValid(d)) return d;
  } catch {}

  return null;
}

export function formatDate(
  date: string | Date,
  formatStr: string = "dd MMMM yyyy"
): string {
  const d = parseDateLike(date);
  if (!d) return "-";
  return format(d, formatStr, { locale: localeId });
}

export function formatTime(
  time?: string | Date | null,
  withSeconds = false
): string {
  if (!time) return "-";
  const d = parseDateLike(time);
  if (!d) return "-";
  return format(d, withSeconds ? "HH:mm:ss" : "HH:mm");
}

export function formatDateTime(datetime: string | Date): string {
  const d = parseDateLike(datetime);
  if (!d) return "-";
  return format(d, "dd MMM yyyy, HH:mm", { locale: localeId });
}
// ----------------------------------------------------------

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Hadir:
      "bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200",
    Terlambat:
      "bg-tunas-yellow-100 text-tunas-yellow-800 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-200",
    Izin:
      "bg-tunas-blue-100 text-tunas-blue-800 dark:bg-tunas-blue-900 dark:text-tunas-blue-200",
    Cuti:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Alpha: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Libur: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    Aktif:
      "bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200",
    Resign: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    colors[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  );
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}
