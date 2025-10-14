'use client';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

type DashboardHeaderProps = {
  user: User | null;
};

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const currentDate = new Date().toLocaleDateString(i18n.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDate(currentDate);
  }, [i18n.language]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || t('farmer');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
          {t('welcomeBackUser', { name: displayName })}
        </h1>
        {date && (
          <p className="text-muted-foreground mt-1">
            {t('dashboardHeaderDesc', { date: date })}
          </p>
        )}
      </div>
    </div>
  );
}
