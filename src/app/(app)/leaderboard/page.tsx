
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen, ArrowLeft, TrendingUp, Star } from "lucide-react";
import { useTaskData } from "@/hooks/use-task-data";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { useLanguage } from "@/providers/language-provider";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressChart } from "@/components/leaderboard/progress-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/app/(app)/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";


export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { allTasks, leaderboardData, isLoading: isTaskDataLoading } = useTaskData();

  const totalTasks = leaderboardData.reduce(
    (sum, user) => sum + user.tasksCompleted,
    0
  );
  const avgScore =
    leaderboardData.length > 0
      ? Math.round(
          leaderboardData.reduce((sum, user) => sum + user.score, 0) /
            leaderboardData.length
        )
      : 0;
  
  if (isUserLoading || isTaskDataLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <Skeleton className="h-10 md:h-12 w-1/2" />
        <div className="h-6 w-3/4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
          <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
          <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-xl md:rounded-2xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 rounded-xl md:rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back_to_home')}
        </Link>
      </Button>
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center justify-center md:justify-start gap-3 text-foreground">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          {t('leaderboard.title')}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {t('leaderboard.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
        <StatsCard
          title={t('leaderboard.total_tasks_completed')}
          value={totalTasks}
          icon={TrendingUp}
          href="/tasks"
          color="green"
        />
        <StatsCard 
          title={t('leaderboard.average_score')} 
          value={avgScore} 
          icon={Star} 
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <Card className="card-spotlight hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="font-headline text-xl md:text-2xl">
                {t('leaderboard.top_performers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable leaderboardData={leaderboardData} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="card-spotlight hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="font-headline text-xl md:text-2xl">{t('leaderboard.monthly_progress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart currentUser={currentUser} allTasks={allTasks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
