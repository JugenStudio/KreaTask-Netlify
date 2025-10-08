"use client";

import { StatsCard } from "@/components/dashboard/stats-card";
import { TaskTable } from "@/components/dashboard/task-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tasks, users } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";
import { CheckCircle, CircleDot, Loader } from "lucide-react";

export default function DashboardPage() {
  const currentUser = users[0];
  const { t } = useLanguage();

  const stats = {
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    inReview: tasks.filter(t => t.status === 'In Review').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('dashboard.welcome', { name: currentUser.name.split(' ')[0] })}</h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Tasks In Progress" value={stats.inProgress} icon={Loader} />
        <StatsCard title="Tasks for Review" value={stats.inReview} icon={CircleDot} />
        <StatsCard title="Tasks Completed" value={stats.completed} icon={CheckCircle} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskTable tasks={tasks.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}
