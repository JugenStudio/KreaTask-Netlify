"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LineChart, BookOpen } from "lucide-react";
import { leaderboardData } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { useLanguage } from "@/providers/language-provider";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressChart } from "@/components/leaderboard/progress-chart";

export default function LeaderboardPage() {
  const { t } = useLanguage();

  const totalTasks = leaderboardData.reduce((sum, user) => sum + user.tasksCompleted, 0);
  const avgScore = Math.round(leaderboardData.reduce((sum, user) => sum + user.score, 0) / leaderboardData.length);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3 text-card-foreground">
            <LineChart className="h-10 w-10 text-primary" />
            {t('leaderboard.title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('leaderboard.description')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatsCard title="Total Tasks Completed" value={totalTasks} icon={BookOpen} color="yellow" />
        <StatsCard title="Average Score" value={avgScore} icon={Trophy} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-none border-none">
                <CardHeader>
                    <CardTitle className="font-headline">{t('leaderboard.top_performers')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeaderboardTable leaderboardData={leaderboardData} />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card className="rounded-2xl shadow-none border-none h-full">
                <CardHeader>
                    <CardTitle className="font-headline">Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                   <ProgressChart />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
