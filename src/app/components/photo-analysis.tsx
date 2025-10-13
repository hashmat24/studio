'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { smartPhotoAnalysisForCropHealth, type SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, Loader2, Bug, ShieldCheck, Microscope } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartPhotoAnalysisForCropHealthOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'crop-analysis-leaf');

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setSelectedImage(dataUri);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedImage) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please select an image to analyze.' });
      return;
    }
    setLoading(true);
    setAnalysisResult(null);
    setIsDialogOpen(true);

    try {
      const result = await smartPhotoAnalysisForCropHealth({ photoDataUri: selectedImage });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze photo:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the photo. Please try again.',
      });
      setIsDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseSample = () => {
    if (placeholderImage) {
      setSelectedImage(placeholderImage.imageUrl);
      setAnalysisResult(null);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Smart Photo Analysis</CardTitle>
        <CardDescription>Upload a crop image for instant health assessment.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
          {selectedImage ? (
            <Image src={selectedImage} alt="Selected crop" fill style={{ objectFit: 'cover' }} />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <Camera className="h-12 w-12" />
              <p>Image preview</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Camera className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
          <Button variant="secondary" onClick={handleUseSample}>Use Sample</Button>
        </div>
        <Button onClick={handleAnalyzeClick} disabled={!selectedImage || loading} className="w-full mt-2">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze Crop Health
        </Button>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Analysis Result</DialogTitle>
            <DialogDescription>Here's the health assessment for your crop.</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Analyzing...</p>
            </div>
          ) : analysisResult ? (
            <div className="grid gap-4 py-4">
              <div className="flex items-start space-x-4">
                <Microscope className="h-6 w-6 mt-1 text-primary"/>
                <div>
                  <h4 className="font-semibold font-headline">Health Assessment</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.healthAssessment}</p>
                </div>
              </div>
               <div className="flex items-start space-x-4">
                <Bug className="h-6 w-6 mt-1 text-destructive"/>
                <div>
                  <h4 className="font-semibold font-headline">Pest/Disease</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.pestOrDisease}</p>
                </div>
              </div>
               <div className="flex items-start space-x-4">
                <ShieldCheck className="h-6 w-6 mt-1 text-primary"/>
                <div>
                  <h4 className="font-semibold font-headline">Treatment Recommendations</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.treatmentRecommendations}</p>
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-10"><p className="text-muted-foreground">No result to display.</p></div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
