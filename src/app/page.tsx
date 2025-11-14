'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard-header';
import HealthDashboard from '@/app/components/health-dashboard';
import RealTimeAdvisory, { AdvisoryItem } from '@/app/components/real-time-advisory';
import PhotoAnalysis from '@/app/components/photo-analysis';
import MarketPrices from '@/app/components/market-prices';
import { SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import CropProfile from './components/crop-profile';
import { doc } from 'firebase/firestore';

export type FarmerProfileData = {
    cropType: string;
    farmingMethods: string;
    area: number;
    location: string;
};


export default function Home() {
    const [advisoryItems, setAdvisoryItems] = useState<AdvisoryItem[] | null>(null);
    const [analysisResult, setAnalysisResult] = useState<SmartPhotoAnalysisForCropHealthOutput | null>(null);
    const [refreshAdvisory, setRefreshAdvisory] = useState(0);
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const farmerProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, `farmer_profiles/${user.uid}`);
      }, [firestore, user]);
    
    const { data: farmerProfile, isLoading: isProfileLoading } = useDoc<FarmerProfileData>(farmerProfileRef);

    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login');
      }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user || isProfileLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <DashboardHeader user={user} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthDashboard 
            advisoryItems={advisoryItems}
            setAdvisoryItems={setAdvisoryItems}
            analysisResult={analysisResult} 
            farmerProfile={farmerProfile}
            refreshAdvisory={refreshAdvisory}
          />
          <RealTimeAdvisory 
            advisoryItems={advisoryItems} 
            setAdvisoryItems={setAdvisoryItems} 
            onRefresh={() => setRefreshAdvisory(c => c + 1)}
          />
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
