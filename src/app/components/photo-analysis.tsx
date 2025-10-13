'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { smartPhotoAnalysisForCropHealth, type SmartPhotoAnalysisForCropHealthOutput } from '@/ai/flows/smart-photo-analysis-for-crop-health';
import { chat } from '@/ai/flows/chatbot-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Loader2, Bug, ShieldCheck, Microscope, Send, MessageSquare } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartPhotoAnalysisForCropHealthOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const placeholderImage = PlaceHolderImages.find(p => p.id === 'crop-analysis-leaf');

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
      toast({ variant: 'destructive', title: 'No Image', description: 'Please select an image to analyze.' });
      return;
    }
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    setParentAnalysisResult(null);
    setMessages([]);
    setIsDialogOpen(true);

    try {
      const result = await smartPhotoAnalysisForCropHealth({ photoDataUri: selectedImage });
      setAnalysisResult(result);
      setParentAnalysisResult(result);
      
      const initialBotMessage: Message = {
          role: 'bot',
          text: `Here is the analysis of your crop:\n\n**Health Assessment:** ${result.healthAssessment}\n**Pest/Disease:** ${result.pestOrDisease}\n**Recommendations:** ${result.treatmentRecommendations}\n\nFeel free to ask me any follow-up questions!`
      };
      setMessages([initialBotMessage]);

    } catch (error) {
      console.error('Failed to analyze photo:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the photo. Please try again.',
      });
      setIsDialogOpen(false);
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
      const result = await chat({ message: `${analysisContext} User's question: ${input}` });
      const botMessage: Message = { role: 'bot', text: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        variant: 'destructive',
        title: 'Chatbot Error',
        description: 'Failed to get a response. Please try again.',
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

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Smart Photo Analysis</CardTitle>
        <CardDescription>Upload a crop image for instant health assessment and advice.</CardDescription>
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
        <Button onClick={handleAnalyzeClick} disabled={!selectedImage || loadingAnalysis} className="w-full mt-2">
          {loadingAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze Crop Health
        </Button>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <Microscope className="h-6 w-6 text-primary"/>
              Crop Analysis Chat
            </DialogTitle>
            <DialogDescription>Review your analysis and ask the AI assistant for more details.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 border rounded-md my-4">
            <div className="space-y-4">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4">Analyzing...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Your analysis results will appear here.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'bot' && (
                        <div className="bg-primary text-primary-foreground p-2 rounded-full">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-card border'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))
              )}
               {loadingChat && (
                    <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="rounded-lg px-4 py-2 max-w-[80%] bg-card border flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>

          <CardFooter className="mt-auto p-0 pt-4">
            <div className="w-full flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loadingAnalysis || loadingChat || messages.length === 0}
              />
              <Button onClick={handleSendMessage} disabled={loadingAnalysis || loadingChat || !input.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
