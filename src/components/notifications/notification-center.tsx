
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTaskData } from "@/hooks/use-task-data";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Notification, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";


interface NotificationCenterProps {
    currentUser: User | null;
}

const db = drizzle(neon(process.env.NEXT_PUBLIC_DATABASE_URL!), { schema });

export function NotificationCenter({ currentUser }: NotificationCenterProps) {
  const { notifications, setNotifications, updateNotifications, refetchData } = useTaskData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const router = useRouter();
  const { locale, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const prevUnreadCountRef = useRef(unreadCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pre-load the audio element on component mount
    audioRef.current = new Audio('/sounds/notification.mp3');
  }, []);

  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current && !isSilent) {
        setIsAnimating(true);
        // Play sound for new notification
        audioRef.current?.play().catch(error => console.error("Audio playback failed:", error));
        const timer = setTimeout(() => setIsAnimating(false), 1000); // Animation duration
        return () => clearTimeout(timer);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, isSilent]);

  useEffect(() => {
    if (!isSilent) {
      if (unreadCount > 0) {
        document.title = `(${unreadCount}) 🔔 KreaTask`;
      } else {
        document.title = "KreaTask";
      }
    } else {
      document.title = "KreaTask";
    }
    
    return () => {
      document.title = "KreaTask";
    };
  }, [isSilent, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSilent = () => setIsSilent(!isSilent);

  const markAllAsRead = async () => {
    const unreadNotifications = userNotifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
        await updateNotifications(unreadNotifications.map(n => ({...n, read: true})));
    }
  };
  
  const clearAllNotifications = async () => {
    if (!currentUser) return;
    
    const notificationIds = userNotifications.map(n => n.id);
    if(notificationIds.length === 0) return;

    await db.delete(schema.notifications).where(
      and(
        eq(schema.notifications.userId, currentUser.id),
        inArray(schema.notifications.id, notificationIds)
      )
    );
    
    await refetchData();
    setIsOpen(false);
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
        await updateNotifications([{ ...notif, read: true }]);
    }
    setIsOpen(false);
    if (notif.link) {
        router.push(notif.link);
    }
  };


  return (
    <div className="relative inline-block" ref={containerRef}>
      <div>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-full"
        >
            {isSilent ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            {unreadCount > 0 && !isSilent && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-background">
                {unreadCount}
            </span>
            )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed top-16 right-4 sm:right-6 z-50">
          <Card className="w-80 sm:w-96 shadow-2xl border bg-popover rounded-2xl">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold text-popover-foreground">{t('header.notifications')}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSilent}>
                  {isSilent ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={markAllAsRead} disabled={unreadCount === 0}>
                  <Check className="h-4 w-4" />
                </Button>
                 <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={clearAllNotifications}
                  disabled={userNotifications.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {userNotifications.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">
                {t('header.no_notifications')}
              </p>
            ) : (
              <ul className="space-y-1 max-h-80 overflow-y-auto p-2 scroll-smooth">
                {userNotifications.map((notif) => (
                  <li
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn("p-3 rounded-lg cursor-pointer transition-colors",
                      notif.read
                        ? "hover:bg-muted/50"
                        : "bg-primary/10 hover:bg-primary/20"
                    )}
                  >
                    <p className={cn("text-sm text-popover-foreground", !notif.read && "font-semibold")}>{notif.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: locale === 'id' ? idLocale : undefined })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
