
"use client";

import { UserTable } from "@/components/settings/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/lib/data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { useCurrentUser } from "@/app/(app)/layout";

export default function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const { t } = useLanguage();


  if (!currentUser) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('settings.description')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl md:text-2xl">{t("settings.user_management.title")}</CardTitle>
          <CardDescription>
            {t("settings.user_management.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <UserTable initialUsers={users} currentUser={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}
