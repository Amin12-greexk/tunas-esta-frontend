// src/app/(dashboard)/master-data/jabatan/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Jabatan } from '@/types/master-data';
import { 
  Plus, 
  Edit, 
  Trash, 
  Briefcase,
  Users,
  AlertCircle,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function JabatanPage() {
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    nama_jabatan: '',
  });

  useEffect(() => {
    loadJabatan();
  }, []);

  const loadJabatan = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data for now
      const mockData: Jabatan[] = [
        {
          jabatan_id: 1,
          nama_jabatan: 'Direktur',
          karyawan_count: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          jabatan_id: 2,
          nama_jabatan: 'Manager',
          karyawan_count: 5,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          jabatan_id: 3,
          nama_jabatan: 'Supervisor',
          karyawan_count: 12,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          jabatan_id: 4,
          nama_jabatan: 'Staff',
          karyawan_count: 45,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          jabatan_id: 5,
          nama_jabatan: 'Operator',
          karyawan_count: 78,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          jabatan_id: 6,
          nama_jabatan: 'Helper',
          karyawan_count: 15,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      
      setJabatan(mockData);
    } catch (error) {
      console.error('Error loading jabatan:', error);
      setError('Gagal memuat data jabatan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nama_jabatan.trim()) {
        toast({
          title: 'Error',
          description: 'Nama jabatan harus diisi',
          variant: 'destructive',
        });
        return;
      }

      if (editMode && selectedJabatan) {
        // await apiClient.updateJabatan(selectedJabatan.jabatan_id, formData);
        toast({
          title: 'Berhasil',
          description: 'Jabatan berhasil diperbarui',
        });
      } else {
        // await apiClient.createJabatan(formData);
        toast({
          title: 'Berhasil',
          description: 'Jabatan berhasil ditambahkan',
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadJabatan();
    } catch (error) {
      console.error('Error saving jabatan:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan jabatan',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (jab: Jabatan) => {
    setSelectedJabatan(jab);
    setFormData({
      nama_jabatan: jab.nama_jabatan,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) return;
    
    try {
      // await apiClient.deleteJabatan(id);
      setJabatan(jabatan.filter(j => j.jabatan_id !== id));
      toast({
        title: 'Berhasil',
        description: 'Jabatan berhasil dihapus',
      });
    } catch (error) {
      console.error('Error deleting jabatan:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus jabatan',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_jabatan: '',
    });
    setSelectedJabatan(null);
    setEditMode(false);
  };

  const filteredJabatan = jabatan.filter(j => 
    j.nama_jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalKaryawan = jabatan.reduce((sum, j) => sum + (j.karyawan_count || 0), 0);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Master Data' },
    { label: 'Jabatan' },
  ];

  return (
    <ProtectedRoute permission="manage-master-data">
      <DashboardLayout>
        <PageHeader
          title="Master Data Jabatan"
          description="Kelola data jabatan karyawan"
          breadcrumbs={breadcrumbs}
          action={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Jabatan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    Lengkapi formulir untuk {editMode ? 'mengubah' : 'menambah'} jabatan
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Jabatan</Label>
                    <Input
                      id="nama"
                      value={formData.nama_jabatan}
                      onChange={(e) => setFormData({ ...formData, nama_jabatan: e.target.value })}
                      placeholder="Masukkan nama jabatan"
                      autoFocus
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editMode ? 'Simpan Perubahan' : 'Tambah Jabatan'}
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

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-tunas-blue-100 text-tunas-blue-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jabatan.length}</p>
                  <p className="text-sm text-gray-500">Total Jabatan</p>
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
                  <p className="text-2xl font-bold">{totalKaryawan}</p>
                  <p className="text-sm text-gray-500">Total Karyawan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-tunas-yellow-100 text-tunas-yellow-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalKaryawan > 0 ? Math.round(totalKaryawan / jabatan.length) : 0}
                  </p>
                  <p className="text-sm text-gray-500">Rata-rata/Jabatan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Daftar Jabatan</h3>
              <Input
                placeholder="Cari jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredJabatan.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Tidak ada jabatan yang ditemukan' : 'Belum ada jabatan'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Jabatan</TableHead>
                    <TableHead>Jumlah Karyawan</TableHead>
                    <TableHead>Persentase</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJabatan.map((jab, index) => {
                    const percentage = totalKaryawan > 0 
                      ? ((jab.karyawan_count || 0) / totalKaryawan * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <motion.tr
                        key={jab.jabatan_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            {jab.nama_jabatan}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {jab.karyawan_count || 0} orang
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div 
                                className="bg-tunas-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(jab)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(jab.jabatan_id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={(jab.karyawan_count || 0) > 0}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}