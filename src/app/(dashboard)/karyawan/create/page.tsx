// src/app/(dashboard)/karyawan/create/page.tsx
'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { KaryawanForm } from '@/components/forms/karyawan-form';
import { ProtectedRoute } from '@/components/common/protected-route';

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
          description="Lengkapi formulir untuk menambahkan karyawan baru"
          breadcrumbs={breadcrumbs}
          showBackButton
        />
        
        <KaryawanForm mode="create" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}