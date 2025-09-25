'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

// ✅ Tambahkan ini
import { KaryawanForm } from '@/components/forms/karyawan-form';

export default function CreateKaryawanPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan', href: '/karyawan' },
    { label: 'Tambah Karyawan' },
  ];

  return (
    <ProtectedRoute permission="create-karyawan">
      <DashboardLayout>
        <PageHeader
          title="Tambah Karyawan Baru"
          description="Lengkapi formulir berikut. Kolom bertanda * wajib diisi."
          breadcrumbs={breadcrumbs}
          showBackButton
        />

        <Card className="border-none shadow-none p-0">
          <CardContent className="p-0">
            <div className="mx-4 mb-4 mt-1 flex items-start gap-3 rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground md:mx-0">
              <Info className="mt-0.5 h-4 w-4" />
              <p>
                Gunakan data resmi (KTP/HRIS). Untuk karyawan harian, isi <b>Tarif Harian</b> setelah memilih
                <b> Kategori Gaji = Harian</b>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Komponen form sekarang dikenali */}
        <KaryawanForm mode="create" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
