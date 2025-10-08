"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, User as UserIcon, Settings, LogOut, Sun, Moon, Laptop, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users, notifications } from "@/lib/data";
import { Separator } from "./ui/separator";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "./ui/badge";

export function Header() {
  const currentUser = users[0];
  const { locale, t, setLocale } = useLanguage();
  const [theme, setThemeState] = React.useState<"light" | "dark" | "system">("dark")
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setThemeState(isDarkMode ? "dark" : "light")
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 w-full backdrop-blur-lg">
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('header.search_placeholder')}
          className="w-full rounded-lg bg-secondary/50 pl-8 md:w-[200px] lg:w-[320px] text-foreground placeholder:text-muted-foreground border-none"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-white/10 rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-border bg-popover backdrop-blur-xl" align="end">
             <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none font-headline text-foreground">{t('header.notifications')}</h4>
                <p className="text-sm text-muted-foreground">{t('header.unread_count', { count: unreadCount.toString() })}</p>
              </div>
              <Separator />
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                    <span className={`flex h-2 w-2 translate-y-1 rounded-full ${!notif.isRead ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <div className="grid gap-1">
                      <p className="font-medium text-popover-foreground">{notif.title[locale]}</p>
                      <p className="text-sm text-muted-foreground">{notif.description[locale]}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-popover backdrop-blur-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t('header.profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('header.settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-border bg-popover backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale("id")}>Bahasa Indonesia</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                 <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                 <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-border bg-popover backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setThemeState("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeState("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setThemeState("system")}>System</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('header.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
