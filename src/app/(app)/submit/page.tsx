
"use client";

import { TaskForm } from "@/components/submit/task-form";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/app/(app)/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SubmitPage() {
  const { t } = useLanguage();
  const { currentUser } = useCurrentUser();


  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
       <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back_to_home')}
        </Link>
      </Button>
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('submit.title')}</h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('submit.description')}</p>
      </div>
      
      {!currentUser ? (
          <Card className="card-spotlight hover:border-primary/50 transition-colors">
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
