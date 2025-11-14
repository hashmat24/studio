'use client';

import { useState } from 'react';
import type { RealTimePersonalizedAdviceOutput } from '@/ai/flows/real-time-personalized-advice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Sprout, ShoppingCart, Loader2, ThumbsUp, ThumbsDown, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export type AdvisoryItem = {
  id: keyof RealTimePersonalizedAdviceOutput;
  title: string;
  icon: React.ElementType;
  advice: string;
  completed: boolean;
  feedback: 'good' | 'bad' | null;
};

type RealTimeAdvisoryProps = {
  advisoryItems: AdvisoryItem[] | null;
  setAdvisoryItems: (items: AdvisoryItem[] | null) => void;
  onRefresh: () => void;
};


export default function RealTimeAdvisory({ advisoryItems, setAdvisoryItems, onRefresh }: RealTimeAdvisoryProps) {
  const { t } = useTranslation();
  const [harvestAlert, setHarvestAlert] = useState<AdvisoryItem | null>(null);
  const { toast } = useToast();

  const handleComplete = (id: keyof RealTimePersonalizedAdviceOutput) => {
    const newAdvisory = advisoryItems && advisoryItems.map(item => item.id === id ? { ...item, completed: true } : item);
    setAdvisoryItems(newAdvisory);
    if(harvestAlert?.id === id) setHarvestAlert(h => h ? {...h, completed: true} : null);
    toast({ title: t('taskCompleted'), description: t('taskCompletedDesc') });
  };
  
  const handleFeedback = (id: keyof RealTimePersonalizedAdviceOutput, feedback: 'good' | 'bad') => {
    const newAdvisory = advisoryItems && advisoryItems.map(item => item.id === id ? { ...item, feedback } : item);
    setAdvisoryItems(newAdvisory);
    if(harvestAlert?.id === id) setHarvestAlert(h => h ? {...h, feedback} : null);
    toast({ title: t('feedbackReceived'), description: t('feedbackReceivedDesc') });
  };

  const getHarvestAlert = () => {
    // In a real app, this would be a separate, persistent alert.
    // For now, we just create a dummy one.
    setHarvestAlert({
        id: 'harvestAlert',
        title: t('harvestAlert'),
        icon: ShoppingCart,
        advice: t('harvestAlertSample'),
        completed: false,
        feedback: null
    })
  }


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{t('realTimeAdvisory')}</CardTitle>
            <CardDescription>{t('realTimeAdvisoryDesc')}</CardDescription>
          </div>
          <Button onClick={onRefresh}>
            {advisoryItems ? t('refreshAdvice') : t('getAdvice')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!advisoryItems ? (
             <div className="text-center py-10 text-muted-foreground bg-secondary/50 rounded-lg">
                <Info className="mx-auto h-8 w-8 mb-2"/>
                <p className="font-semibold">
                    {t('readyForTasks')}
                </p>
                <p className="text-sm">
                    {t('getAdvicePrompt')}
                </p>
            </div>
        ): (
          <div className="space-y-4">
            {advisoryItems.map((item) => (
              <Card key={item.id} className={`transition-all ${item.completed ? 'bg-primary/10 border-primary/20' : 'bg-card'}`}>
                <CardHeader className="flex flex-row items-start space-x-4 pb-2">
                  <div className="p-2 bg-secondary rounded-md">
                     <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">{item.title}</CardTitle>
                    <CardDescription className="pt-1">{item.advice}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-2">
                    <div>
                        {!item.completed && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <span>{t('helpful')}</span>
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.feedback === 'good' ? 'text-primary bg-primary/10' : ''}`} onClick={() => handleFeedback(item.id, 'good')}><ThumbsUp className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.feedback === 'bad' ? 'text-destructive bg-destructive/10' : ''}`} onClick={() => handleFeedback(item.id, 'bad')}><ThumbsDown className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </div>
                    {item.completed ? (
                      <div className="flex items-center text-primary font-semibold">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {t('completed')}
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handleComplete(item.id)}>{t('markAsComplete')}</Button>
                    )}
                </CardFooter>
              </Card>
            ))}

            {harvestAlert && (
                 <Card key={harvestAlert.id} className={`transition-all ${harvestAlert.completed ? 'bg-accent/10 border-accent/20' : 'bg-card border-accent'}`}>
                 <CardHeader className="flex flex-row items-start space-x-4 pb-2">
                   <div className="p-2 bg-secondary rounded-md">
                      <harvestAlert.icon className="h-6 w-6 text-accent" />
                   </div>
                   <div>
                     <CardTitle className="text-lg font-headline text-accent">{harvestAlert.title}</CardTitle>
                     <CardDescription className="pt-1">{harvestAlert.advice}</CardDescription>
                   </div>
                 </CardHeader>
                 <CardFooter className="flex justify-between items-center pt-2">
                     <div>
                         {!harvestAlert.completed && (
                             <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                 <span>{t('helpful')}</span>
                                 <Button variant="ghost" size="icon" className={`h-8 w-8 ${harvestAlert.feedback === 'good' ? 'text-primary bg-primary/10' : ''}`} onClick={() => handleFeedback(harvestAlert.id, 'good')}><ThumbsUp className="h-4 w-4" /></Button>
                                 <Button variant="ghost" size="icon" className={`h-8 w-8 ${harvestAlert.feedback === 'bad' ? 'text-destructive bg-destructive/10' : ''}`} onClick={() => handleFeedback(harvestAlert.id, 'bad')}><ThumbsDown className="h-4 w-4" /></Button>
                             </div>
                         )}
                     </div>
                     {harvestAlert.completed ? (
                       <div className="flex items-center text-accent font-semibold">
                         <CheckCircle className="mr-2 h-5 w-5" />
                         {t('completed')}
                       </div>
                     ) : (
                       <Button size="sm" variant="outline" onClick={() => handleComplete(harvestAlert.id)}>{t('markAsComplete')}</Button>
                     )}
                 </CardFooter>
               </Card>
            )}

            {!harvestAlert && <Button variant="secondary" onClick={getHarvestAlert} className="w-full">{t('getHarvestAlert')}</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
