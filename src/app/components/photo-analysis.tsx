'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { smartPhotoAnalysisForCropHealth, type SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { chat } from '@/ai/flows/chatbot-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Loader2, Bug, ShieldCheck, Microscope, Send, MessageSquare, User, Video, CircleDot, ArrowLeft } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type PhotoAnalysisProps = {
  setAnalysisResult: (result: SmartPhotoAnalysisForCropHealthOutput | null) => void;
};

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function PhotoAnalysis({ setAnalysisResult: setParentAnalysisResult }: PhotoAnalysisProps) {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartPhotoAnalysisForCropHealthOutput | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'crop-analysis-leaf');

  useEffect(() => {
    // Stop video stream when camera dialog is closed
    if (!isCameraDialogOpen && videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  }, [isCameraDialogOpen]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setSelectedImage(dataUri);
      setAnalysisResult(null);
      setParentAnalysisResult(null);
      setMessages([]);
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!selectedImage) {
      toast({ variant: 'destructive', title: t('noImage'), description: t('noImageDesc') });
      return;
    }
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    setParentAnalysisResult(null);
    setMessages([]);
    setIsAnalysisDialogOpen(true);

    try {
      const result = await smartPhotoAnalysisForCropHealth({ 
        photoDataUri: selectedImage,
        language: i18n.language,
      });
      setAnalysisResult(result);
      setParentAnalysisResult(result);
      
      const initialBotMessage: Message = {
          role: 'bot',
          text: `${t('analysisResultText')}\n\n**${t('healthAssessment')}:** ${result.healthAssessment}\n**${t('pestOrDisease')}:** ${result.pestOrDisease}\n**${t('treatmentRecommendations')}:** ${result.treatmentRecommendations}\n\n${t('followUpQuestionPrompt')}`
      };
      setMessages([initialBotMessage]);

    } catch (error) {
      console.error('Failed to analyze photo:', error);
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: t('analysisFailedDesc'),
      });
      setIsAnalysisDialogOpen(false);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoadingChat(true);

    try {
      // We can provide context from the analysis to the chatbot
      const analysisContext = analysisResult ? `The user is asking about a crop with the following analysis: Health is ${analysisResult.healthAssessment}, Pest/Disease found is ${analysisResult.pestOrDisease}.` : '';
      const result = await chat({ 
        message: `${analysisContext} User's question: ${input}`,
        language: i18n.language,
      });
      const botMessage: Message = { role: 'bot', text: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        variant: 'destructive',
        title: t('chatbotError'),
        description: t('chatbotErrorDesc'),
      });
    } finally {
      setLoadingChat(false);
    }
  };
  
  const handleUseSample = () => {
    if (placeholderImage) {
      setSelectedImage(placeholderImage.imageUrl);
      setAnalysisResult(null);
      setParentAnalysisResult(null);
      setMessages([]);
    }
  };

  const openCamera = async () => {
    setIsCameraDialogOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: t('cameraAccessDeniedTitle'),
                description: t('cameraAccessDeniedDesc'),
            });
        }
    } else {
        setHasCameraPermission(false);
    }
  }

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUri);
      }
      setIsCameraDialogOpen(false);
    }
  };

  return (
    <>
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('smartPhotoAnalysis')}</CardTitle>
        <CardDescription>{t('smartPhotoAnalysisDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
          {selectedImage ? (
            <Image src={selectedImage} alt="Selected crop" fill style={{ objectFit: 'cover' }} />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <Camera className="h-12 w-12" />
              <p>{t('imagePreview')}</p>
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
            <Camera className="mr-2 h-4 w-4" /> {t('uploadPhoto')}
          </Button>
          <Button variant="outline" onClick={openCamera}>
            <Video className="mr-2 h-4 w-4" /> {t('takePicture')}
          </Button>
        </div>
        <Button onClick={handleUseSample} variant="secondary" className="w-full mt-2">{t('useSample')}</Button>
        <Button onClick={handleAnalyzeClick} disabled={!selectedImage || loadingAnalysis} className="w-full mt-2">
          {loadingAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('analyzeCropHealth')}
        </Button>
      </CardContent>

      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <Microscope className="h-6 w-6 text-primary"/>
              {t('cropAnalysisChat')}
            </DialogTitle>
            <DialogDescription>{t('cropAnalysisChatDesc')}</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6">
            <div className="px-6 py-4 space-y-6">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4">{t('analyzing')}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>{t('analysisResultsAppearHere')}</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' && 'justify-end'
                    )}
                  >
                     {message.role === 'bot' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback>
                                <MessageSquare className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                     )}
                    <div
                      className={cn(
                        'rounded-lg px-4 py-3 max-w-[85%] whitespace-pre-wrap shadow-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-card border rounded-bl-none'
                      )}
                    >
                      {message.text}
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground">
                            <AvatarFallback>
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                     )}
                  </div>
                ))
              )}
               {loadingChat && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback>
                                <MessageSquare className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-3 max-w-[85%] bg-card border flex items-center shadow-sm">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>

          <CardFooter className="mt-auto p-0 pt-4 border-t flex-col items-stretch gap-4">
            <div className="w-full flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('askFollowUpQuestion')}
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loadingAnalysis || loadingChat || messages.length === 0}
              />
              <Button onClick={handleSendMessage} disabled={loadingAnalysis || loadingChat || !input.trim()} size="icon">
                <Send className="h-5 w-5" />
                <span className="sr-only">{t('send')}</span>
              </Button>
            </div>
            <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </Card>

    <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <Video className="h-6 w-6 text-primary"/>
              {t('takePictureTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('takePictureDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className='my-4'>
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
            {hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>{t('cameraAccessRequiredTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('cameraAccessRequiredDesc')}
                  </AlertDescription>
                </Alert>
            )}
          </div>
          <Button onClick={handleCapture} disabled={!hasCameraPermission}>
            <CircleDot className="mr-2 h-4 w-4" /> {t('capturePhoto')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
