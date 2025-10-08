"use client";

import { TaskCard } from "@/components/dashboard/task-card";
import { TopPerformerCard } from "@/components/dashboard/top-performer-card";
import { tasks, users, leaderboardData } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";

export default function DashboardPage() {
  const currentUser = users[0];
  const { t } = useLanguage();
  const topPerformer = leaderboardData[0];

  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').slice(0, 2);
  const inReviewTasks = tasks.filter(t => t.status === 'In Review').slice(0, 2);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-headline text-card-foreground">
          {t('dashboard.welcome', { name: currentUser.name.split(' ')[0] })}
        </h1>
        <p className="text-muted-foreground text-lg">{t('dashboard.description')}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {inProgressTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {inReviewTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
        <div className="lg:col-span-1">
            <TopPerformerCard performer={topPerformer} />
        </div>
      </div>
    </div>
  );
}
