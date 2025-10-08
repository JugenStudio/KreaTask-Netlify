
"use client";

import { TaskForm } from "@/components/submit/task-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";

export default function SubmitPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">{t('submit.title')}</h1>
        <p className="text-muted-foreground">{t('submit.description')}</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
