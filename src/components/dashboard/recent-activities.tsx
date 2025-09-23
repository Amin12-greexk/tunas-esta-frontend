'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LogIn, LogOut, Clock } from 'lucide-react';

export type RecentActivity = {
  id: number;
  karyawan: string;
  action: 'masuk' | 'pulang';
  timestamp: string;
};

interface RecentActivitiesProps {
  activities: RecentActivity[];
  isLoading?: boolean;
}

// Helper function untuk format waktu yang lebih readable
function formatActivityTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Baru saja' : `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivities({ activities, isLoading = false }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4 animate-spin" />
              <span className="text-sm">Memuat aktivitas...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <CalendarDays className="h-8 w-8 mb-2" />
              <p className="text-sm">Belum ada aktivitas hari ini</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activities.map((activity, index) => (
                <li
                  key={`${activity.id}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.action === 'masuk'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {activity.action === 'masuk' ? (
                        <LogIn className="h-4 w-4" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.karyawan}</p>
                      <p className="text-xs text-gray-500">{formatActivityTime(activity.timestamp)}</p>
                    </div>
                  </div>
                  <Badge
                    variant={activity.action === 'masuk' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      activity.action === 'masuk'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {activity.action === 'masuk' ? 'Masuk' : 'Pulang'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
