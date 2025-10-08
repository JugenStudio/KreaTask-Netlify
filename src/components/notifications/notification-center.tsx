
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockNotifications } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Notification, User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
    currentUser: User | null;
}

export function NotificationCenter({ currentUser }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const router = useRouter();
  const { locale, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentUser) {
      const userNotifications = mockNotifications.filter(n => n.userId === currentUser.id);
      setNotifications(userNotifications);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
  }, [notifications, isSilent, unreadCount]);

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
    if (notif.link) {
        router.push(notif.link);
    }
  };


  return (
    <div className="relative inline-block" ref={containerRef}>
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

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 sm:w-96 shadow-2xl border z-50 bg-popover rounded-2xl">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-popover-foreground">{t('header.notifications')}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSilent}>
                {isSilent ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-10">
              Tidak ada notifikasi baru
            </p>
          ) : (
            <ul className="space-y-1 max-h-80 overflow-y-auto p-2">
              {notifications.map((notif) => (
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
      )}
    </div>
  );
}
