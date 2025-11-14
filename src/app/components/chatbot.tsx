'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chatbot-flow';
import { SparkleIcon } from './sparkle-icon';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await chat({
        message: input,
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
      setLoading(false);
    }
  };
  
  // Add an initial message when the sheet opens for the first time
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          text: t('chatbotWelcome'),
        },
      ]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
          <span className="sr-only">{t('openChat')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-xl flex items-center gap-2">
            <SparkleIcon className="h-6 w-6 text-primary" />
            {t('chatbotTitle')}
          </SheetTitle>
          <SheetDescription>
            {t('chatbotDesc')}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 my-4">
          <div className="px-6 py-4 space-y-6">
            {messages.map((message, index) => (
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
                      <SparkleIcon className="h-5 w-5" />
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
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <SparkleIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 max-w-[85%] bg-card border flex items-center shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="mt-auto p-0 pt-4 border-t">
          <div className="w-full flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askAnything')}
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading || !input.trim()} size="icon">
              <Send className="h-5 w-5" />
              <span className="sr-only">{t('send')}</span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
