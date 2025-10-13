'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { chat, type ChatInput, type ChatOutput } from '@/ai/flows/chatbot-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await chat({ message: input });
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
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-8 w-8" />
        <span className="sr-only">Open Chatbot</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary"/>
              Krishi Mitra Chatbot
            </DialogTitle>
            <DialogDescription>
              Your AI farming assistant. Ask me anything about farming!
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 border rounded-md my-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Ask a question to start the conversation.</p>
                  <p className="text-xs">e.g., "What is the best fertilizer for grapes?"</p>
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
               {loading && (
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

          <DialogFooter className="mt-auto">
            <div className="w-full flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
              />
              <Button onClick={handleSendMessage} disabled={loading || !input.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
