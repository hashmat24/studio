'use client';

import { useState } from 'react';
import { getRealTimePersonalizedAdvice, type RealTimePersonalizedAdviceOutput } from '@/ai/flows/real-time-personalized-advice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Sprout, ShoppingCart, Loader2, ThumbsUp, ThumbsDown, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FarmerProfileData } from '@/app/page';

export type AdvisoryItem = {
  id: keyof RealTimePersonalizedAdviceOutput;
  title: string;
  icon: React.ElementType;
  advice: string;
  completed: boolean;
  feedback: 'good' | 'bad' | null;
};

type RealTimeAdvisoryProps = {
  setAdvisoryItems: (items: AdvisoryItem[] | null) => void;
  farmerProfile: FarmerProfileData | null;
};


export default function RealTimeAdvisory({ setAdvisoryItems, farmerProfile }: RealTimeAdvisoryProps) {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryItem[] | null>(null);
  const { toast } = useToast();

  const updateParentState = (items: AdvisoryItem[] | null) => {
    setAdvisory(items);
    setAdvisoryItems(items);
  }

  const fetchAdvice = async () => {
    if (!farmerProfile) {
        toast({
            variant: 'destructive',
            title: 'Profile Incomplete',
            description: 'Please fill out your farm profile to get personalized advice.',
        });
        return;
    }
    
    setLoading(true);
    updateParentState(null);
    try {
      const result = await getRealTimePersonalizedAdvice({
        location: farmerProfile.location,
        cropType: farmerProfile.cropType,
        area: farmerProfile.area,
        farmingMethods: farmerProfile.farmingMethods,
        // These can be dynamic later
        weatherConditions: 'Sunny, 32°C, Humidity 45%',
        soilHealthCardData: 'pH: 6.8, N: High, P: Medium, K: High',
        agriStackData: 'Standard regional data applied.',
      });

      const newAdvisory: AdvisoryItem[] = [
        { id: 'irrigationAdvice', title: 'Irrigation Advice', icon: Droplets, advice: result.irrigationAdvice, completed: false, feedback: null },
        { id: 'fertilizerTimingAdvice', title: 'Fertilizer Timing', icon: Sprout, advice: result.fertilizerTimingAdvice, completed: false, feedback: null },
        { id: 'harvestAlert', title: 'Harvest Alert', icon: ShoppingCart, advice: result.harvestAlert, completed: false, feedback: null },
      ];
      updateParentState(newAdvisory);
    } catch (error) {
      console.error('Failed to get advice:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch real-time advisory. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (id: keyof RealTimePersonalizedAdviceOutput) => {
    const newAdvisory = advisory && advisory.map(item => item.id === id ? { ...item, completed: true } : item);
    updateParentState(newAdvisory);
    toast({ title: 'Task Completed!', description: 'Great job staying on top of your farm tasks.' });
  };
  
  const handleFeedback = (id: keyof RealTimePersonalizedAdviceOutput, feedback: 'good' | 'bad') => {
    const newAdvisory = advisory && advisory.map(item => item.id === id ? { ...item, feedback } : item);
    updateParentState(newAdvisory);
    toast({ title: 'Feedback Received', description: 'Thank you for helping us improve!' });
  };


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">Real-time Advisory</CardTitle>
            <CardDescription>Your personalized "Today's Actions" list.</CardDescription>
          </div>
          <Button onClick={fetchAdvice} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {advisory ? 'Refresh Advice' : 'Get Advice'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating personalized advice...</p>
          </div>
        )}
        {!loading && !advisory && (
             <div className="text-center py-10 text-muted-foreground bg-secondary/50 rounded-lg">
                <Info className="mx-auto h-8 w-8 mb-2"/>
                <p className="font-semibold">
                    {farmerProfile ? 'Ready for your daily tasks?' : 'Complete Your Profile'}
                </p>
                <p className="text-sm">
                    {farmerProfile ? 'Click "Get Advice" to generate your personalized action plan.' : 'Fill out the "My Farm Profile" card to receive AI-powered advice.'}
                </p>
            </div>
        )}
        {advisory && (
          <div className="space-y-4">
            {advisory.map((item) => (
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
                                <span>Helpful?</span>
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.feedback === 'good' ? 'text-primary bg-primary/10' : ''}`} onClick={() => handleFeedback(item.id, 'good')}><ThumbsUp className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${item.feedback === 'bad' ? 'text-destructive bg-destructive/10' : ''}`} onClick={() => handleFeedback(item.id, 'bad')}><ThumbsDown className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </div>
                    {item.completed ? (
                      <div className="flex items-center text-primary font-semibold">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Completed
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => handleComplete(item.id)}>Mark as Complete</Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
