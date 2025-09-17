'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, LogIn, LogOut } from 'lucide-react';

type Activity = {
  id: number;
  karyawan: string;
  action: 'masuk' | 'pulang';
  timestamp: string;
};

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4">
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  {activity.action === 'masuk' ? (
                    <LogIn className="h-5 w-5 text-green-600" />
                  ) : (
                    <LogOut className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{activity.karyawan}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <CalendarDays className="h-4 w-4 text-gray-400" />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
