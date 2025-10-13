'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, CloudRain, AlertTriangle, Droplets, Sprout, ShoppingCart } from 'lucide-react';
import type { AdvisoryItem } from './real-time-advisory';
import type { SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { useEffect, useState } from 'react';

type HealthStatus = 'Good' | 'Attention' | 'Problem';

const HealthIndicator = ({ status, title, icon: Icon, description }: { status: HealthStatus, title: string, icon: React.ElementType, description: string }) => {
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
    <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${statusClasses[status]}`}>
      <Icon className={`h-8 w-8 mb-2 ${iconClasses[status]}`} />
      <p className="font-semibold font-headline text-lg">{title}</p>
      <p className="text-sm text-center">{description}</p>
    </div>
  );
};

type HealthDashboardProps = {
  advisoryItems: AdvisoryItem[] | null;
  analysisResult: SmartPhotoAnalysisForCropHealthOutput | null;
};

export default function HealthDashboard({ advisoryItems, analysisResult }: HealthDashboardProps) {
  const [overallHealth, setOverallHealth] = useState<HealthStatus>('Good');

  useEffect(() => {
    let health: HealthStatus = 'Good';
    if (analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A') {
      health = 'Problem';
    } else if (advisoryItems?.some(item => !item.completed)) {
      health = 'Attention';
    }
    setOverallHealth(health);
  }, [advisoryItems, analysisResult]);


  const overallHealthInfo = {
    Good: {
      bgColor: 'bg-primary',
      textColor: 'text-primary-foreground',
      message: 'Excellent!',
      description: 'Your crops are healthy and thriving.'
    },
    Attention: {
      bgColor: 'bg-accent',
      textColor: 'text-accent-foreground',
      message: 'Attention',
      description: 'Some areas need your attention. Check advisories below.'
    },
    Problem: {
      bgColor: 'bg-destructive',
      textColor: 'text-destructive-foreground',
      message: 'Problem Detected',
      description: 'Immediate action is required. Review critical alerts.'
    }
  }

  const currentHealth = overallHealthInfo[overallHealth];

  const getIndicatorStatus = (item: AdvisoryItem): HealthStatus => {
    if (item.completed) return 'Good';
    return 'Attention';
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Visual Health Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 rounded-lg ${currentHealth.bgColor} ${currentHealth.textColor} text-center mb-6`}>
            <h3 className="font-headline text-2xl font-bold">{currentHealth.message}</h3>
            <p>{currentHealth.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthIndicator status={analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A' ? 'Problem' : 'Good'} title="Pest Alert" icon={AlertTriangle} description={analysisResult?.pestOrDisease && analysisResult.pestOrDisease !== 'N/A' ? analysisResult.pestOrDisease : 'No pests detected.'} />
          {advisoryItems ? (
            <>
              {advisoryItems.find(i => i.id === 'irrigationAdvice') && <HealthIndicator status={getIndicatorStatus(advisoryItems.find(i => i.id === 'irrigationAdvice')!)} title="Irrigation" icon={Droplets} description={advisoryItems.find(i => i.id === 'irrigationAdvice')?.advice || ''} />}
              {advisoryItems.find(i => i.id === 'fertilizerTimingAdvice') && <HealthIndicator status={getIndicatorStatus(advisoryItems.find(i => i.id === 'fertilizerTimingAdvice')!)} title="Fertilizer" icon={Sprout} description={advisoryItems.find(i => i.id === 'fertilizerTimingAdvice')?.advice || ''} />}
            </>
          ) : (
            <>
              <HealthIndicator status="Good" title="Soil Moisture" icon={Sun} description="Optimal levels detected." />
              <HealthIndicator status="Attention" title="Weather" icon={CloudRain} description="Light rain expected tomorrow." />
            </>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
