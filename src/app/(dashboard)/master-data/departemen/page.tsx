// src/app/(dashboard)/master-data/departemen/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Departemen } from '@/types/master-data';
import { 
  Plus, 
  Edit, 
  Trash, 
  Building2,
  Users,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DepartemenPage() {
  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartemen, setSelectedDepartemen] = useState<Departemen | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nama_departemen: '',
    menggunakan_shift: false,
  });

  useEffect(() => {
    loadDepartemen();
  }, []);

  const loadDepartemen = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data for now
      const mockData: Departemen[] = [
        {
          departemen_id: 1,
          nama_departemen: 'Produksi',
          menggunakan_shift: true,
          karyawan_count: 85,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          departemen_id: 2,
          nama_departemen: 'Human Resources',
          menggunakan_shift: false,
          karyawan_count: 8,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          departemen_id: 3,
          nama_departemen: 'Finance',
          menggunakan_shift: false,
          karyawan_count: 12,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          departemen_id: 4,
          nama_departemen: 'Quality Control',
          menggunakan_shift: true,
          karyawan_count: 15,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      
      setDepartemen(mockData);
    } catch (error) {
      console.error('Error loading departemen:', error);
      setError('Gagal memuat data departemen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedDepartemen) {
        // await apiClient.updateDepartemen(selectedDepartemen.departemen_id, formData);
        toast({
          title: 'Berhasil',
          description: 'Departemen berhasil diperbarui',
        });
      } else {
        // await apiClient.createDepartemen(formData);
        toast({
          title: 'Berhasil',
          description: 'Departemen berhasil ditambahkan',
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadDepartemen();
    } catch (error) {
      console.error('Error saving departemen:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan departemen',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (dept: Departemen) => {
    setSelectedDepartemen(dept);
    setFormData({
      nama_departemen: dept.nama_departemen,
      menggunakan_shift: dept.menggunakan_shift,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus departemen ini?')) return;
    
    try {
      // await apiClient.deleteDepartemen(id);
      setDepartemen(departemen.filter(d => d.departemen_id !== id));
      toast({
        title: 'Berhasil',
        description: 'Departemen berhasil dihapus',
      });
    } catch (error) {
      console.error('Error deleting departemen:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus departemen',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_departemen: '',
      menggunakan_shift: false,
    });
    setSelectedDepartemen(null);
    setEditMode(false);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Master Data' },
    { label: 'Departemen' },
  ];

  return (
    <ProtectedRoute permission="manage-master-data">
      <DashboardLayout>
        <PageHeader
          title="Master Data Departemen"
          description="Kelola data departemen perusahaan"
          breadcrumbs={breadcrumbs}
          action={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Departemen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? 'Edit Departemen' : 'Tambah Departemen Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    Lengkapi formulir untuk {editMode ? 'mengubah' : 'menambah'} departemen
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Departemen</Label>
                    <Input
                      id="nama"
                      value={formData.nama_departemen}
                      onChange={(e) => setFormData({ ...formData, nama_departemen: e.target.value })}
                      placeholder="Masukkan nama departemen"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shift">Menggunakan Shift</Label>
                      <p className="text-sm text-gray-500">
                        Aktifkan jika departemen menggunakan sistem shift
                      </p>
                    </div>
                    <Switch
                      id="shift"
                      checked={formData.menggunakan_shift}
                      onCheckedChange={(checked) => setFormData({ ...formData, menggunakan_shift: checked })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editMode ? 'Simpan Perubahan' : 'Tambah Departemen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-tunas-blue-100 text-tunas-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{departemen.length}</p>
                  <p className="text-sm text-gray-500">Total Departemen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-tunas-green-100 text-tunas-green-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {departemen.reduce((sum, d) => sum + (d.karyawan_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Karyawan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Daftar Departemen</h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : departemen.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Belum ada departemen</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Departemen</TableHead>
                    <TableHead>Jumlah Karyawan</TableHead>
                    <TableHead>Sistem Shift</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departemen.map((dept, index) => (
                    <motion.tr
                      key={dept.departemen_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          {dept.nama_departemen}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dept.karyawan_count || 0} orang
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dept.menggunakan_shift ? (
                          <Badge className="bg-tunas-green-100 text-tunas-green-800">Ya</Badge>
                        ) : (
                          <Badge variant="outline">Tidak</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dept)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dept.departemen_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}