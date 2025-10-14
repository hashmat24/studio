'use client';

import Link from 'next/link';
import { Leaf, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { Button } from '../ui/button';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './language-switcher';

export default function Header() {
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdmin();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              {t('appName')}
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              {t('farmerPortal')}
            </Link>
            <Link
              href="/admin"
              className={cn(
                'transition-colors hover:text-foreground/80',
                isAdmin ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {t('adminDashboard')}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <LanguageSwitcher />
          {isUserLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">{t('login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
