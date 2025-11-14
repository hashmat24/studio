'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, CloudRain, AlertTriangle, Droplets, Sprout, Loader2 } from 'lucide-react';
import type { AdvisoryItem } from './real-time-advisory';
import type { SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRealTimePersonalizedAdvice } from '@/ai/flows/real-time-personalized-advice';
import { useToast } from '@/hooks/use-toast';
import type { FarmerProfileData } from '@/app/page';


type HealthStatus = 'Good' | 'Attention' | 'Problem';

const HealthIndicator = ({ status, title, icon: Icon, description }: { status: HealthStatus, title: string, icon: React.ElementType, description: string }) => {
  const { t } = useTranslation();
  const statusClasses = {
    Good: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500/50 dark:text-green-400',
    Attention: 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-500/50 dark:text-yellow-400',
    Problem: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500/50 dark:text-red-400',
  };
  const iconClasses = {
    Good: 'text-green-500 dark:text-green-400',
    Attention: 'text-yellow-500 dark:text-yellow-400',
    Problem: 'text-red-500 dark:text-red-400',
  }

  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${statusClasses[status]} min-h-[150px] justify-center`}>
      <Icon className={`h-8 w-8 mb-2 ${iconClasses[status]}`} />
      <p className="font-semibold font-headline text-lg text-center">{title}</p>
      <p className="text-sm text-center">{description || t('noAdviceAvailable')}</p>
    </div>
  );
};

type HealthDashboardProps = {
  advisoryItems: AdvisoryItem[] | null;
  setAdvisoryItems: (items: AdvisoryItem[] | null) => void;
  analysisResult: SmartPhotoAnalysisForCropHealthOutput | null;
  farmerProfile: FarmerProfileData | null;
  refreshAdvisory: number;
};

export default function HealthDashboard({ advisoryItems, setAdvisoryItems, analysisResult, farmerProfile, refreshAdvisory }: HealthDashboardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [overallHealth, setOverallHealth] = useState<HealthStatus>('Good');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let health: HealthStatus = 'Good';
    if (analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A') {
      health = 'Problem';
    } else if (advisoryItems?.some(item => !item.completed)) {
      health = 'Attention';
    }
    setOverallHealth(health);
  }, [advisoryItems, analysisResult]);

  useEffect(() => {
    if (refreshAdvisory > 0) {
      fetchAdvice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshAdvisory]);

  const fetchAdvice = async () => {
    if (!farmerProfile) {
        // This toast is handled by the RealTimeAdvisory component button
        return;
    }
    
    setLoading(true);
    setAdvisoryItems(null);
    try {
      const result = await getRealTimePersonalizedAdvice({
        location: farmerProfile.location,
        cropType: farmerProfile.cropType,
        area: farmerProfile.area,
        farmingMethods: farmerProfile.farmingMethods,
        language: i18n.language,
        weatherConditions: 'Sunny, 32°C, Humidity 45%',
        soilHealthCardData: 'pH: 6.8, N: High, P: Medium, K: High',
        agriStackData: 'Standard regional data applied.',
      });

      const newAdvisory: AdvisoryItem[] = [
        { id: 'irrigationAdvice', title: t('irrigation'), icon: Droplets, advice: result.irrigationAdvice, completed: false, feedback: null },
        { id: 'fertilizerTimingAdvice', title: t('fertilizer'), icon: Sprout, advice: result.fertilizerTimingAdvice, completed: false, feedback: null },
      ];
      setAdvisoryItems(newAdvisory);
    } catch (error) {
      console.error('Failed to get advice:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('fetchAdviceError'),
      });
    } finally {
      setLoading(false);
    }
  };


  const overallHealthInfo = {
    Good: {
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      message: t('healthStatusGood'),
      description: t('healthStatusGoodDesc')
    },
    Attention: {
      bgColor: 'bg-accent',
      textColor: 'text-accent-foreground',
      message: t('healthStatusAttention'),
      description: t('healthStatusAttentionDesc')
    },
    Problem: {
      bgColor: 'bg-destructive',
      textColor: 'text-destructive-foreground',
      message: t('healthStatusProblem'),
      description: t('healthStatusProblemDesc')
    }
  }

  const currentHealth = overallHealthInfo[overallHealth];

  const getIndicatorStatus = (item?: AdvisoryItem): HealthStatus => {
    if (!item) return 'Good';
    if (item.completed) return 'Good';
    return 'Attention';
  }

  const getAdviceText = (id: keyof Omit<import('@/ai/flows/real-time-personalized-advice').RealTimePersonalizedAdviceOutput, 'harvestAlert'>) => {
    return advisoryItems?.find(i => i.id === id)?.advice || '';
  }


  return (
    <Card className="shadow-md hover-shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('visualHealthDashboard')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 rounded-lg ${currentHealth.bgColor} ${currentHealth.textColor} text-center mb-6`}>
            <h3 className="font-headline text-2xl font-bold">{currentHealth.message}</h3>
            <p>{currentHealth.description}</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{t('generatingAdvice')}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthIndicator status={analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A' ? 'Problem' : 'Good'} title={t('pestAlert')} icon={AlertTriangle} description={analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A' ? analysisResult.pestOrDisease : t('noPestsDetected')} />
          <HealthIndicator status={getIndicatorStatus(advisoryItems?.find(i => i.id === 'irrigationAdvice'))} title={t('irrigation')} icon={Droplets} description={getAdviceText('irrigationAdvice')} />
          <HealthIndicator status={getIndicatorStatus(advisoryItems?.find(i => i.id === 'fertilizerTimingAdvice'))} title={t('fertilizer')} icon={Sprout} description={getAdviceText('fertilizerTimingAdvice')} />
        </div>
        )}
      </CardContent>
    </Card>
  );
}
