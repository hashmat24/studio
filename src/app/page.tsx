'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard-header';
import HealthDashboard from '@/app/components/health-dashboard';
import RealTimeAdvisory, { AdvisoryItem } from '@/app/components/real-time-advisory';
import PhotoAnalysis from '@/app/components/photo-analysis';
import MarketPrices from '@/app/components/market-prices';
import { SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import CropProfile from './components/crop-profile';

export default function Home() {
    const [advisoryItems, setAdvisoryItems] = useState<AdvisoryItem[] | null>(null);
    const [analysisResult, setAnalysisResult] = useState<SmartPhotoAnalysisForCropHealthOutput | null>(null);
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <DashboardHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthDashboard advisoryItems={advisoryItems} analysisResult={analysisResult} />
          <RealTimeAdvisory setAdvisoryItems={setAdvisoryItems} />
        </div>
        <div className="space-y-6">
          <CropProfile />
          <PhotoAnalysis setAnalysisResult={setAnalysisResult} />
          <MarketPrices />
        </div>
      </div>
    </div>
  );
}
