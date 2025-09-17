// src/components/common/page-header.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  action?: React.ReactNode;
  showBackButton?: boolean;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  showBackButton = false,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href || '#'}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </motion.div>
  );
}
