'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Download, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Printer
} from 'lucide-react';
import Cookies from 'js-cookie';

// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

interface DetailGaji {
  detail_gaji_id: number;
  jenis_komponen: 'Pendapatan' | 'Potongan';
  deskripsi: string;
  jumlah: number;
}

interface SlipGaji {
  gaji_id: number;
  karyawan_id: number;
  periode: string;
  periode_label: string;
  tipe_periode: string;
  periode_mulai: string;
  periode_selesai: string;
  gaji_final: number;
  tanggal_pembayaran: string | null;
  karyawan: {
    karyawan_id: number;
    nik: string;
    nama_lengkap: string;
    email: string;
    departemenSaatIni: {
      nama_departemen: string;
    };
    jabatanSaatIni: {
      nama_jabatan: string;
    };
  };
  detailGaji: DetailGaji[];
}

export default function SlipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slipId = params?.slip_id;
  
  const [slipData, setSlipData] = useState<SlipGaji | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slipId) {
      loadSlipData();
    }
  }, [slipId]);

  const getApiHeaders = () => {
    const token = Cookies.get('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const loadSlipData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/payroll/slip/${slipId}`, {
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SlipGaji = await response.json();
      setSlipData(data);
    } catch (error) {
      console.error('Error loading slip data:', error);
      setError(error instanceof Error ? error.message : 'Gagal memuat data slip gaji');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!slipData) return;

    try {
      setIsDownloading(true);
      
      // Create PDF content using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup diblokir. Silakan izinkan popup untuk download PDF.');
      }

      const pdfContent = generatePDFContent(slipData);
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mendownload PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFContent = (slip: SlipGaji): string => {
    const pendapatan = slip.detailGaji.filter(d => d.jenis_komponen === 'Pendapatan');
    const potongan = slip.detailGaji.filter(d => d.jenis_komponen === 'Potongan');
    const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPotongan = potongan.reduce((sum, item) => sum + item.jumlah, 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Slip Gaji - ${slip.karyawan.nama_lengkap}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                font-size: 12px;
                line-height: 1.4;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .company-name { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 5px;
            }
            .slip-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin-top: 10px;
            }
            .employee-info { 
                margin-bottom: 20px; 
                background: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
            }
            .info-row { 
                display: flex; 
                margin-bottom: 8px; 
            }
            .info-label { 
                width: 150px; 
                font-weight: bold; 
            }
            .info-value { 
                flex: 1; 
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 20px; 
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
            }
            th { 
                background-color: #f5f5f5; 
                font-weight: bold; 
            }
            .amount { 
                text-align: right; 
            }
            .total-row { 
                background-color: #f0f0f0; 
                font-weight: bold; 
            }
            .final-total { 
                background-color: #e8f5e8; 
                font-weight: bold; 
                font-size: 14px;
            }
            .footer { 
                margin-top: 30px; 
                text-align: right; 
            }
            .signature { 
                margin-top: 50px; 
                text-align: right; 
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">PT. TUNASESTA</div>
            <div>Jl. Alamat Perusahaan, Kota</div>
            <div class="slip-title">SLIP GAJI KARYAWAN</div>
        </div>

        <div class="employee-info">
            <div class="info-row">
                <div class="info-label">NIK:</div>
                <div class="info-value">${slip.karyawan.nik}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Nama:</div>
                <div class="info-value">${slip.karyawan.nama_lengkap}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departemen:</div>
                <div class="info-value">${slip.karyawan.departemenSaatIni.nama_departemen}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Jabatan:</div>
                <div class="info-value">${slip.karyawan.jabatanSaatIni.nama_jabatan}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Periode:</div>
                <div class="info-value">${slip.periode_label}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tanggal Pembayaran:</div>
                <div class="info-value">${slip.tanggal_pembayaran ? formatDate(slip.tanggal_pembayaran, 'dd MMMM yyyy') : 'Belum dibayar'}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 60%">Keterangan</th>
                    <th style="width: 40%">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                <tr class="total-row">
                    <td colspan="2"><strong>PENDAPATAN</strong></td>
                </tr>
                ${pendapatan.map(item => `
                <tr>
                    <td>${item.deskripsi}</td>
                    <td class="amount">${formatCurrency(item.jumlah)}</td>
                </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total Pendapatan</strong></td>
                    <td class="amount"><strong>${formatCurrency(totalPendapatan)}</strong></td>
                </tr>
                
                ${potongan.length > 0 ? `
                <tr class="total-row">
                    <td colspan="2"><strong>POTONGAN</strong></td>
                </tr>
                ${potongan.map(item => `
                <tr>
                    <td>${item.deskripsi}</td>
                    <td class="amount">${formatCurrency(item.jumlah)}</td>
                </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total Potongan</strong></td>
                    <td class="amount"><strong>${formatCurrency(totalPotongan)}</strong></td>
                </tr>
                ` : ''}
                
                <tr class="final-total">
                    <td><strong>GAJI BERSIH</strong></td>
                    <td class="amount"><strong>${formatCurrency(slip.gaji_final)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p>Slip gaji ini dicetak pada: ${formatDate(new Date().toISOString(), 'dd MMMM yyyy HH:mm')}</p>
        </div>

        <div class="signature">
            <p>Mengetahui,</p>
            <br><br><br>
            <p>_________________________</p>
            <p>HRD</p>
        </div>
    </body>
    </html>
    `;
  };

  const calculateTotals = () => {
    if (!slipData) return { totalPendapatan: 0, totalPotongan: 0 };
    
    const pendapatan = slipData.detailGaji.filter(d => d.jenis_komponen === 'Pendapatan');
    const potongan = slipData.detailGaji.filter(d => d.jenis_komponen === 'Potongan');
    
    return {
      totalPendapatan: pendapatan.reduce((sum, item) => sum + item.jumlah, 0),
      totalPotongan: potongan.reduce((sum, item) => sum + item.jumlah, 0)
    };
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian', href: '/payroll' },
    { label: `Slip #${slipId}` },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute permission="process-payroll">
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !slipData) {
    return (
      <ProtectedRoute permission="process-payroll">
        <DashboardLayout>
          <PageHeader
            title={`Detail Slip Gaji #${slipId}`}
            description="Halaman detail slip gaji"
            breadcrumbs={breadcrumbs}
            showBackButton
          />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Slip gaji tidak ditemukan'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={loadSlipData} 
            className="mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Coba Lagi'}
          </Button>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { totalPendapatan, totalPotongan } = calculateTotals();
  const pendapatanItems = slipData.detailGaji.filter(d => d.jenis_komponen === 'Pendapatan');
  const potonganItems = slipData.detailGaji.filter(d => d.jenis_komponen === 'Potongan');

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title={`Detail Slip Gaji #${slipId}`}
          description={`Slip gaji untuk ${slipData.karyawan.nama_lengkap}`}
          breadcrumbs={breadcrumbs}
          showBackButton
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                disabled={isDownloading}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={downloadPDF}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          }
        />

        <div className="grid gap-6">
          {/* Informasi Karyawan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">NIK:</span>
                    <p className="font-medium">{slipData.karyawan.nik}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nama Lengkap:</span>
                    <p className="font-medium">{slipData.karyawan.nama_lengkap}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{slipData.karyawan.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Departemen:</span>
                    <p className="font-medium">{slipData.karyawan.departemenSaatIni.nama_departemen}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Jabatan:</span>
                    <p className="font-medium">{slipData.karyawan.jabatanSaatIni.nama_jabatan}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Periode Gaji:</span>
                    <p className="font-medium">{slipData.periode_label}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Gaji */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pendapatan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CreditCard className="h-5 w-5" />
                  Pendapatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendapatanItems.map((item) => (
                    <div key={item.detail_gaji_id} className="flex justify-between">
                      <span>{item.deskripsi}</span>
                      <span className="font-medium">{formatCurrency(item.jumlah)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Total Pendapatan</span>
                    <span>{formatCurrency(totalPendapatan)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Potongan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <CreditCard className="h-5 w-5" />
                  Potongan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {potonganItems.length > 0 ? (
                    <>
                      {potonganItems.map((item) => (
                        <div key={item.detail_gaji_id} className="flex justify-between">
                          <span>{item.deskripsi}</span>
                          <span className="font-medium">{formatCurrency(item.jumlah)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-bold text-red-600">
                        <span>Total Potongan</span>
                        <span>{formatCurrency(totalPotongan)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Tidak ada potongan</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gaji Bersih */}
          <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Gaji Bersih
                </h3>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(slipData.gaji_final)}
                </p>
                <div className="mt-4 flex justify-center">
                  <Badge variant={slipData.tanggal_pembayaran ? 'default' : 'secondary'}>
                    {slipData.tanggal_pembayaran 
                      ? `Dibayar: ${formatDate(slipData.tanggal_pembayaran, 'dd MMM yyyy')}`
                      : 'Belum Dibayar'
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Tambahan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Periode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm text-gray-500">Tipe Periode:</span>
                  <p className="font-medium capitalize">{slipData.tipe_periode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tanggal Mulai:</span>
                  <p className="font-medium">{formatDate(slipData.periode_mulai, 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tanggal Selesai:</span>
                  <p className="font-medium">{formatDate(slipData.periode_selesai, 'dd MMM yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}