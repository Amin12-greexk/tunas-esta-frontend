// src/app/(dashboard)/fingerprint/device/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { 
  Fingerprint,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Database,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DeviceStatus {
  isConnected: boolean;
  deviceSN: string;
  deviceIP: string;
  firmwareVersion: string;
  userCount: number;
  recordCount: number;
  lastSync: string;
}

export default function FingerprintDevicePage() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isConnected: true,
    deviceSN: 'FP2024001',
    deviceIP: '192.168.1.100',
    firmwareVersion: 'v2.1.5',
    userCount: 142,
    recordCount: 15234,
    lastSync: '2024-01-15 14:30:00',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 30, // minutes
    deleteAfterSync: false,
    maxRetries: 3,
  });

  useEffect(() => {
    checkDeviceStatus();
    const interval = setInterval(checkDeviceStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkDeviceStatus = async () => {
    try {
      // Simulate API call
      // const response = await apiClient.getDeviceStatus();
      // setDeviceStatus(response.data);
    } catch (error) {
      console.error('Error checking device status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeviceStatus(prev => ({ ...prev, isConnected: true }));
      toast({
        title: 'Berhasil',
        description: 'Terhubung ke perangkat fingerprint',
      });
    } catch (error) {
      setError('Gagal menghubungkan ke perangkat');
      toast({
        title: 'Error',
        description: 'Gagal menghubungkan ke perangkat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    try {
      setIsSyncing(true);
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDeviceStatus(prev => ({
        ...prev,
        userCount: 145,
        lastSync: new Date().toISOString(),
      }));
      
      toast({
        title: 'Sinkronisasi Berhasil',
        description: '145 pengguna berhasil disinkronkan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal melakukan sinkronisasi',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportAttendance = async () => {
    try {
      setIsImporting(true);
      
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast({
        title: 'Import Berhasil',
        description: '523 data absensi berhasil diimport',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengimport data absensi',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Fingerprint' },
    { label: 'Device Control' },
  ];

  return (
    <ProtectedRoute roles={['it_dev', 'hr']}>
      <DashboardLayout>
        <PageHeader
          title="Fingerprint Device Control"
          description="Kelola dan monitor perangkat fingerprint"
          breadcrumbs={breadcrumbs}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Device Status */}
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${deviceStatus.isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Fingerprint className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Device Status</CardTitle>
                    <CardDescription>
                      {deviceStatus.deviceSN} - {deviceStatus.deviceIP}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {deviceStatus.isConnected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                  
                  <Button
                    variant={deviceStatus.isConnected ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleConnect}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : deviceStatus.isConnected ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconnect
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1"
                >
                  <p className="text-sm text-gray-500">Firmware Version</p>
                  <p className="text-lg font-semibold">{deviceStatus.firmwareVersion}</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-lg font-semibold">{deviceStatus.userCount}</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-1"
                >
                  <p className="text-sm text-gray-500">Total Records</p>
                  <p className="text-lg font-semibold">{deviceStatus.recordCount.toLocaleString()}</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-1"
                >
                  <p className="text-sm text-gray-500">Last Sync</p>
                  <p className="text-lg font-semibold">
                    {new Date(deviceStatus.lastSync).toLocaleString('id-ID')}
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sync Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Sinkronkan data antara perangkat dan sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleSyncUsers}
                  disabled={!deviceStatus.isConnected || isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Syncing users...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Sync All Users
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleImportAttendance}
                  disabled={!deviceStatus.isConnected || isImporting}
                >
                  {isImporting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Importing attendance...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Attendance Data
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={!deviceStatus.isConnected}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Auto-sync enabled</span>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Every 30 min
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Device Actions
              </CardTitle>
              <CardDescription>
                Kontrol dan pengaturan perangkat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={!deviceStatus.isConnected}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Live Logs
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={!deviceStatus.isConnected}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Sync Device Time
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={!deviceStatus.isConnected}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear Device Data
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="destructive"
                  disabled={!deviceStatus.isConnected}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Device
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Device Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '14:30:00', action: 'Auto-sync completed', status: 'success', detail: '145 users synced' },
                { time: '14:00:00', action: 'Attendance import', status: 'success', detail: '523 records imported' },
                { time: '13:30:00', action: 'Auto-sync completed', status: 'success', detail: '145 users synced' },
                { time: '13:15:23', action: 'Connection lost', status: 'error', detail: 'Network timeout' },
                { time: '13:00:00', action: 'Auto-sync completed', status: 'success', detail: '145 users synced' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.detail}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}