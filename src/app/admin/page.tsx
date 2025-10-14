'use client';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2 } from 'lucide-react';
import SystemStatus from './components/system-status';
import UserManagement from './components/user-management';
import AiPerformance from './components/ai-performance';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">{t('verifyingAccess')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
          {t('adminMaintenanceDashboard')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('adminDashboardDesc')}
        </p>
      </div>

      <div className="space-y-8">
        <SystemStatus />
        <AiPerformance />
        <UserManagement />
      </div>
    </div>
  );
}
