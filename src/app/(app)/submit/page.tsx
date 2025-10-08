
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
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]);
    }
  }, []);


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">{t('submit.title')}</h1>
        <p className="text-muted-foreground">{t('submit.description')}</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {!currentUser ? (
             <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-32 ml-auto" />
            </div>
          ) : (
            <TaskForm currentUser={currentUser} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
