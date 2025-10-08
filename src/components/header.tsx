
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  User as UserIcon,
  Settings,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Languages,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationCenter } from "@/components/notifications/notification-center";

type Theme = "light" | "dark" | "system";

export function Header() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { locale, t, setLocale } = useLanguage();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const selectedRole = sessionStorage.getItem("selectedRole") as UserRole | null;
    if (selectedRole) {
      const user = users.find((u) => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]); // Default to Direktur Utama
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme: "light" | "dark";
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      effectiveTheme = theme;
    }
    
    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!currentUser) {
    return (
       <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
        <Skeleton className="h-8 w-48" />
        <div className="ml-auto">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
      {/* Search bar */}
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("header.search_placeholder")}
          className="w-full rounded-lg bg-secondary/50 pl-8 md:w-[200px] lg:w-[320px] text-foreground placeholder:text-muted-foreground border-none"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        
        {/* Notification Center */}
        <NotificationCenter currentUser={currentUser} />
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 border-border bg-popover backdrop-blur-xl"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                    {currentUser.name}
                    </p>
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">{currentUser.role}</Badge>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t("header.profile")}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("header.settings")}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Language Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-border bg-popover backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setLocale("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale("id")}>
                    Bahasa Indonesia
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {/* Theme Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="border-border bg-popover backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/signin">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("header.logout")}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
