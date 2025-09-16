'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime, getInitials } from '@/lib/utils';
import { Activity } from '@/types/dashboard';
import { 
  Clock, 
  UserPlus, 
  CreditCard, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Info,
  Calendar
} from 'lucide-react';

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'attendance':
        return Calendar;
      case 'payroll':
        return CreditCard;
      case 'employee':
        return UserPlus;
      case 'system':
        return Settings;
      default:
        return Info;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'attendance':
        return 'bg-tunas-blue-100 text-tunas-blue-600 dark:bg-tunas-blue-900 dark:text-tunas-blue-400';
      case 'payroll':
        return 'bg-tunas-green-100 text-tunas-green-600 dark:bg-tunas-green-900 dark:text-tunas-green-400';
      case 'employee':
        return 'bg-tunas-yellow-100 text-tunas-yellow-600 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-400';
      case 'system':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>