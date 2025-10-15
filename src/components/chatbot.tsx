
"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, X, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getKreaBotResponse } from '@/app/actions';
import { useTaskData } from '@/hooks/use-task-data';
import Image from 'next/image';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const quickStartPrompts = [
    "Siapa karyawan terbaik bulan ini?",
    "Tugas apa saja yang akan jatuh tempo minggu ini?",
    "Berikan saya laporan status harian",
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { allTasks, users, isLoading: isTaskDataLoading } = useTaskData();


  const handleSendMessage = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const messageText = query || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const { response, error } = await getKreaBotResponse(messageText, allTasks, users);
    
    const botMessage: Message = {
      sender: 'bot',
      text: error || response || "Maaf, saya tidak yakin bagaimana harus merespons.",
    };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };
  
  const handleQuickStartClick = (prompt: string) => {
    // We create a synthetic event object because handleSendMessage expects it
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSendMessage(syntheticEvent, prompt);
  };


  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const initialBotMessage: Message = {
    sender: 'bot',
    text: "Halo! Saya KreaBot. Tanyakan apa saja tentang tugas, progres tim, atau gunakan salah satu pertanyaan di bawah untuk memulai!",
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialBotMessage]);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      <Button
        className={cn(
          "fixed bottom-24 right-4 h-10 w-10 rounded-full shadow-lg z-50 text-white transition-all active:scale-95 bg-gradient-to-br from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90",
           "md:bottom-8 md:right-6"
        )}
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed bottom-36 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-card shadow-2xl border transition-all duration-300 ease-in-out md:bottom-20 md:right-6",
          "h-[70vh] max-h-[600px]",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-headline font-semibold">KreaBot</h2>
                        <p className="text-xs text-muted-foreground -mt-1">Asisten Cerdas KreaTask</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="absolute top-2 right-2 h-8 w-8">
                    <X className="h-5 w-5" />
                </Button>
            </header>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.sender === 'user' && 'justify-end')}>
                    {message.sender === 'bot' && (
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                    )}
                    <div className={cn("max-w-xs rounded-lg p-3 text-sm", 
                        message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div className="bg-secondary rounded-lg p-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
                 {messages.length <= 1 && (
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Quick Start</h3>
                        </div>
                        <div className="space-y-2">
                            {quickStartPrompts.map((prompt) => (
                                <Button 
                                    key={prompt}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start h-auto py-2 text-wrap"
                                    onClick={() => handleQuickStartClick(prompt)}
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                 )}
            </ScrollArea>
            <div className="p-4 border-t bg-background rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Tanya KreaBot..."
                        className="flex-1 pr-10"
                        disabled={isLoading || isTaskDataLoading}
                    />
                    <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7" disabled={isLoading || isTaskDataLoading || !inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
}
