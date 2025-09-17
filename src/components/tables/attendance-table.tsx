'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Attendance {
  id: number;
  karyawan: string;
  masuk: string;
  pulang: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
}

interface AttendanceTableProps {
  data: Attendance[];
}

export default function AttendanceTable({ data }: AttendanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kehadiran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.karyawan}</TableCell>
                  <TableCell>
                    {new Date(row.masuk).toLocaleTimeString('id-ID')}
                  </TableCell>
                  <TableCell>
                    {row.pulang
                      ? new Date(row.pulang).toLocaleTimeString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          row.status === 'Hadir'
                            ? 'bg-green-100 text-green-700'
                            : row.status === 'Izin'
                            ? 'bg-yellow-100 text-yellow-700'
                            : row.status === 'Sakit'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
