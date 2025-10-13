'use client';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';

type DashboardHeaderProps = {
  user: User | null;
};

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDate(currentDate);
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
          Welcome back, {displayName}!
        </h1>
        {date && (
          <p className="text-muted-foreground mt-1">
            Here's your farm's overview for {date}.
          </p>
        )}
      </div>
    </div>
  );
}
