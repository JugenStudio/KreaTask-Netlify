
"use client";

import { UserTable } from "@/components/settings/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/lib/data";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]);
    }
  }, []);

  if (!currentUser) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
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
        <h1 className="text-3xl font-bold font-headline">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t("settings.user_management.title")}</CardTitle>
          <CardDescription>
            {t("settings.user_management.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
                <UserTable initialUsers={users} currentUser={currentUser} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
