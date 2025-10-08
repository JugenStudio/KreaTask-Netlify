"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Task, User } from '@/lib/types';
import { getKreaBotResponse } from '@/app/actions';
import { useLanguage } from '@/providers/language-provider';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  tasks: Task[];
  users: User[];
}

export function Chatbot({ tasks, users }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Leaderboard data calculation
    const userScores = users.map(user => {
      const completedTasks = tasks.filter(task => 
        task.status === 'Completed' && task.assignees.some(a => a.id === user.id)
      ).length;
      // Simple scoring: 10 points per completed task
      const score = completedTasks * 10;
      return {
        userId: user.id,
        name: user.name,
        score,
        completedTasks,
      };
    }).sort((a, b) => b.score - a.score);


    const { response, error } = await getKreaBotResponse(inputValue, tasks, users, userScores);
    
    const botMessage: Message = {
      sender: 'bot',
      text: error || response || "I'm not sure how to respond to that.",
    };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
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
    text: "Hello! I'm KreaBot, your project assistant. How can I help you today? You can ask me about task statuses, deadlines, or even for a productivity tip!",
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialBotMessage]);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-8 w-8" />
      </Button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-full max-w-sm rounded-xl bg-card shadow-2xl border transition-all duration-300 ease-in-out",
          isExpanded ? "h-[600px]" : "h-[450px]",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-primary" />
                    <h2 className="text-lg font-headline font-semibold">KreaBot Assistant</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </header>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.sender === 'user' && 'justify-end')}>
                    {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
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
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary rounded-lg p-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask KreaBot..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
}
