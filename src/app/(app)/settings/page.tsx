
"use client";

import { UserTable } from "@/components/settings/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskData } from "@/hooks/use-task-data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { useCurrentUser } from "@/app/(app)/layout";
import { isEmployee } from "@/lib/roles";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Languages, Laptop, Moon, Sun, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";


type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const { users, isLoading, setUsers } = useTaskData();
  const { t, locale, setLocale } = useLanguage();
  const [theme, setTheme] = useState<Theme>("system");

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


  if (!currentUser || isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 md:h-12 w-1/3" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const canManageUsers = !isEmployee(currentUser.role);

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
       <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back_to_home')}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('settings.description')}</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl md:text-2xl">{t('settings.appearance.title')}</CardTitle>
            <CardDescription>{t('settings.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>{t('settings.appearance.theme_label')}</Label>
                <RadioGroup
                    defaultValue={theme}
                    onValueChange={handleThemeChange}
                    className="grid grid-cols-3 gap-4"
                >
                    <div>
                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                        <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Sun className="mb-3 h-6 w-6" />
                            {t('settings.appearance.light')}
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                        <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Moon className="mb-3 h-6 w-6" />
                            {t('settings.appearance.dark')}
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="system" id="system" className="peer sr-only" />
                        <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Laptop className="mb-3 h-6 w-6" />
                            {t('settings.appearance.system')}
                        </Label>
                    </div>
                </RadioGroup>
            </div>
             <div className="space-y-2">
                <Label htmlFor="language">{t('settings.appearance.language_label')}</Label>
                 <Select value={locale} onValueChange={(value: 'en' | 'id') => setLocale(value)}>
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Indonesia</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      {canManageUsers && (
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-xl md:text-2xl">{t("settings.user_management.title")}</CardTitle>
            <CardDescription>
                {t("settings.user_management.description")}
            </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <UserTable initialUsers={users} currentUser={currentUser} setUsers={setUsers} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
