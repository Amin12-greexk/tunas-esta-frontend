// src/lib/validations.ts
import { z } from "zod"

// Auth validations
export const loginSchema = z.object({
  nik: z.string()
    .min(1, "NIK harus diisi")
    .min(3, "NIK minimal 3 karakter")
    .max(20, "NIK maksimal 20 karakter"),
  password: z.string()
    .min(1, "Password harus diisi")
    .min(6, "Password minimal 6 karakter"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Karyawan validations
export const karyawanSchema = z.object({
  nik: z.string()
    .min(1, "NIK harus diisi")
    .min(3, "NIK minimal 3 karakter")
    .max(20, "NIK maksimal 20 karakter")
    .regex(/^[0-9a-zA-Z]+$/, "NIK hanya boleh mengandung huruf dan angka"),
  
  nama_lengkap: z.string()
    .min(1, "Nama lengkap harus diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(255, "Nama maksimal 255 karakter"),
  
  tempat_lahir: z.string()
    .min(1, "Tempat lahir harus diisi")
    .max(100, "Tempat lahir maksimal 100 karakter"),
  
  tanggal_lahir: z.string()
    .min(1, "Tanggal lahir harus diisi")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 17 && age <= 70;
    }, "Usia harus antara 17-70 tahun"),
  
  jenis_kelamin: z.enum(["Laki-laki", "Perempuan"], {
    required_error: "Jenis kelamin harus dipilih",
  }),
  
  alamat: z.string()
    .min(1, "Alamat harus diisi")
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  
  status_perkawinan: z.enum(["Belum Menikah", "Menikah", "Cerai"], {
    required_error: "Status perkawinan harus dipilih",
  }),
  
  nomor_telepon: z.string()
    .min(1, "Nomor telepon harus diisi")
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor telepon tidak valid"),
  
  email: z.string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter"),
  
  tanggal_masuk: z.string()
    .min(1, "Tanggal masuk harus diisi")
    .refine((date) => {
      const joinDate = new Date(date);
      const today = new Date();
      return joinDate <= today;
    }, "Tanggal masuk tidak boleh di masa depan"),
  
  kategori_gaji: z.enum(["Bulanan", "Harian", "Borongan"], {
    required_error: "Kategori gaji harus dipilih",
  }),
  
  departemen_id_saat_ini: z.number({
    required_error: "Departemen harus dipilih",
  }).min(1, "Departemen harus dipilih"),
  
  jabatan_id_saat_ini: z.number({
    required_error: "Jabatan harus dipilih",
  }).min(1, "Jabatan harus dipilih"),
  
  role_karyawan: z.enum(["produksi", "staff"], {
    required_error: "Role karyawan harus dipilih",
  }),
  
  jam_kerja_masuk: z.string().optional(),
  jam_kerja_pulang: z.string().optional(),
})

export type KaryawanFormData = z.infer<typeof karyawanSchema>

// Departemen validations
export const departemenSchema = z.object({
  nama_departemen: z.string()
    .min(1, "Nama departemen harus diisi")
    .min(2, "Nama departemen minimal 2 karakter")
    .max(100, "Nama departemen maksimal 100 karakter"),
  
  menggunakan_shift: z.boolean(),
})

export type DepartemenFormData = z.infer<typeof departemenSchema>

// Jabatan validations
export const jabatanSchema = z.object({
  nama_jabatan: z.string()
    .min(1, "Nama jabatan harus diisi")
    .min(2, "Nama jabatan minimal 2 karakter")
    .max(100, "Nama jabatan maksimal 100 karakter"),
})

export type JabatanFormData = z.infer<typeof jabatanSchema>

// Shift validations
export const shiftSchema = z.object({
  kode_shift: z.string()
    .min(1, "Kode shift harus diisi")
    .min(1, "Kode shift minimal 1 karakter")
    .max(10, "Kode shift maksimal 10 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode shift hanya boleh huruf kapital dan angka"),
  
  jam_masuk: z.string().optional(),
  jam_pulang: z.string().optional(),
  hari_berikutnya: z.boolean(),
})

export type ShiftFormData = z.infer<typeof shiftSchema>

// Setting Gaji validations
export const settingGajiSchema = z.object({
  premi_produksi: z.number()
    .min(0, "Premi produksi tidak boleh negatif")
    .max(10000000, "Premi produksi maksimal 10 juta"),
  
  premi_staff: z.number()
    .min(0, "Premi staff tidak boleh negatif")
    .max(10000000, "Premi staff maksimal 10 juta"),
  
  uang_makan_produksi_weekday: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  uang_makan_produksi_weekend_5_10: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  uang_makan_produksi_weekend_10_20: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  uang_makan_staff_weekday: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  uang_makan_staff_weekend_5_10: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  uang_makan_staff_weekend_10_20: z.number()
    .min(0, "Uang makan tidak boleh negatif")
    .max(1000000, "Uang makan maksimal 1 juta"),
  
  tarif_lembur_produksi_per_jam: z.number()
    .min(0, "Tarif lembur tidak boleh negatif")
    .max(1000000, "Tarif lembur maksimal 1 juta per jam"),
  
  tarif_lembur_staff_per_jam: z.number()
    .min(0, "Tarif lembur tidak boleh negatif")
    .max(1000000, "Tarif lembur maksimal 1 juta per jam"),
})

export type SettingGajiFormData = z.infer<typeof settingGajiSchema>

// Attendance log manual entry
export const attendanceLogSchema = z.object({
  karyawan_id: z.number({
    required_error: "Karyawan harus dipilih",
  }).min(1, "Karyawan harus dipilih"),
  
  date: z.string()
    .min(1, "Tanggal harus diisi")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return selectedDate >= oneYearAgo && selectedDate <= today;
    }, "Tanggal harus dalam rentang 1 tahun terakhir"),
  
  check_in_time: z.string()
    .min(1, "Jam masuk harus diisi")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid (HH:MM)"),
  
  check_out_time: z.string()
    .optional()
    .refine((time) => {
      if (!time) return true;
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    }, "Format jam tidak valid (HH:MM)"),
})
.refine((data) => {
  if (data.check_out_time) {
    const checkIn = new Date(`1970-01-01T${data.check_in_time}:00`);
    const checkOut = new Date(`1970-01-01T${data.check_out_time}:00`);
    return checkOut > checkIn;
  }
  return true;
}, {
  message: "Jam pulang harus setelah jam masuk",
  path: ["check_out_time"],
});

export type AttendanceLogFormData = z.infer<typeof attendanceLogSchema>

// Payroll generation
export const payrollGenerationSchema = z.object({
  karyawan_id: z.number({
    required_error: "Karyawan harus dipilih",
  }).min(1, "Karyawan harus dipilih"),
  
  periode: z.string()
    .min(1, "Periode harus diisi")
    .regex(/^\d{4}-\d{2}$/, "Format periode tidak valid (YYYY-MM)"),
})

export type PayrollGenerationFormData = z.infer<typeof payrollGenerationSchema>

// PIN Fingerprint
export const pinFingerprintSchema = z.object({
  karyawan_id: z.number({
    required_error: "Karyawan harus dipilih",
  }).min(1, "Karyawan harus dipilih"),
  
  pin: z.string()
    .min(1, "PIN harus diisi")
    .min(3, "PIN minimal 3 karakter")
    .max(20, "PIN maksimal 20 karakter")
    .regex(/^[0-9]+$/, "PIN hanya boleh berupa angka"),
})

export type PinFingerprintFormData = z.infer<typeof pinFingerprintSchema>

// Change Password
export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, "Password lama harus diisi"),
  
  new_password: z.string()
    .min(6, "Password baru minimal 6 karakter")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung huruf kecil, huruf besar, dan angka"),
  
  confirm_password: z.string()
    .min(1, "Konfirmasi password harus diisi"),
})
.refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirm_password"],
})
.refine((data) => data.current_password !== data.new_password, {
  message: "Password baru harus berbeda dari password lama",
  path: ["new_password"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Date range picker
export const dateRangeSchema = z.object({
  start_date: z.string()
    .min(1, "Tanggal mulai harus diisi"),
  
  end_date: z.string()
    .min(1, "Tanggal selesai harus diisi"),
})
.refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
  path: ["end_date"],
})
.refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 365;
}, {
  message: "Rentang tanggal maksimal 365 hari",
  path: ["end_date"],
});

export type DateRangeFormData = z.infer<typeof dateRangeSchema>

// Filter forms
export const attendanceFilterSchema = z.object({
  karyawan_id: z.number().optional(),
  departemen_id: z.number().optional(),
  status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  jenis_hari: z.enum(["weekday", "weekend", "tanggal_merah"]).optional(),
})

export type AttendanceFilterFormData = z.infer<typeof attendanceFilterSchema>

export const payrollFilterSchema = z.object({
  periode: z.string().optional(),
  departemen_id: z.number().optional(),
  tipe_periode: z.enum(["harian", "mingguan", "bulanan"]).optional(),
})

export type PayrollFilterFormData = z.infer<typeof payrollFilterSchema>