'use client';
import { useState, useEffect } from 'react';

export default function DashboardHeader() {
  const [date, setDate] = useState('');

  useEffect(() => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDate(currentDate);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
          Welcome back, Farmer!
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
