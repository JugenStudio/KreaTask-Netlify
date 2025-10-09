
"use client";

import { TaskForm } from "@/components/submit/task-form";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { users } from "@/lib/data";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmitPage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Try to get user from sessionStorage first
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // Fallback to role-based selection if not in session
      const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
      if (selectedRole) {
        const user = users.find(u => u.role === selectedRole);
        setCurrentUser(user || users[0]);
      } else {
        setCurrentUser(users[0]);
      }
    }
  }, []);


  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('submit.title')}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('submit.description')}</p>
      </div>
      
      {!currentUser ? (
          <Card>
            <CardContent className="p-4 md:p-6">
                <div className="space-y-6 md:space-y-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32 ml-auto" />
                </div>
            </CardContent>
          </Card>
      ) : (
        <TaskForm currentUser={currentUser} />
      )}
    </div>
  );
}
