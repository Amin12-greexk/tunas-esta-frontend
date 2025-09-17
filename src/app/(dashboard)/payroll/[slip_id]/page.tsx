'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';

export default function SlipDetailPage() {
  const params = useParams();
  const slipId = params?.slip_id;

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title={`Detail Slip Gaji #${slipId}`}
          description="Halaman detail slip gaji"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Penggajian', href: '/payroll' },
            { label: `Slip #${slipId}` },
          ]}
        />

        <div className="p-6">
          <p>Ini adalah halaman detail slip gaji dengan ID: <b>{slipId}</b></p>
          <p>(Konten detail slip bisa kamu isi nanti, misalnya breakdown gaji, potongan, lembur, dsb.)</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
