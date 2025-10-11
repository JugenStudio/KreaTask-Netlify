
"use client";

import { useEffect, useState } from "react";
import { TaskCard } from "@/components/dashboard/task-card";
import { TopPerformerCard } from "@/components/dashboard/top-performer-card";
import { useTaskData } from "@/hooks/use-task-data";
import { useLanguage } from "@/providers/language-provider";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookOpen, Trophy, Clock, Star, TrendingUp, CheckCircle, Target } from "lucide-react";
import { ProgressChart } from "@/components/leaderboard/progress-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Chatbot } from "@/components/chatbot";
import type { Task, User, LeaderboardEntry } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { isEmployee, isDirector } from "@/lib/roles";
import { useCurrentUser } from "@/app/(app)/layout";
import { cn } from "@/lib/utils";


export default function DashboardPage() {
  const { currentUser } = useCurrentUser();
  const { allTasks, users, leaderboardData, isLoading: isTaskDataLoading } = useTaskData();
  const [currentUserLeaderboard, setCurrentUserLeaderboard] = useState<LeaderboardEntry | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (currentUser && leaderboardData.length > 0) {
      const leaderboardEntry = leaderboardData.find(entry => entry.id === currentUser.id);
      setCurrentUserLeaderboard(leaderboardEntry || null);
    }
  }, [currentUser, leaderboardData]);

  if (isTaskDataLoading || !currentUser || !currentUserLeaderboard) {
    return (
        <div className="space-y-6 md:space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
                <Skeleton className="h-10 md:h-12 w-1/2" />
            </h1>
            <div className="text-muted-foreground text-base md:text-lg">
                <Skeleton className="h-6 md:h-8 w-3/4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
                <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
                <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
                <Skeleton className="h-28 md:h-32 rounded-xl md:rounded-2xl" />
            </div>
        </div>
    );
  }

  const isLvl1 = isEmployee(currentUser.role);
  let visibleTasks: Task[];

  if (isLvl1) {
    // Karyawan sees only their own tasks
    visibleTasks = allTasks.filter(task => 
      task.assignees.some(assignee => assignee.id === currentUser.id)
    );
  } else {
    // Direktur & Super User see all tasks
    visibleTasks = allTasks;
  }

  // Task lists
  const todoTasks = visibleTasks.filter((t) => t.status === "To-do").slice(0, 1);
  const inProgressTasks = visibleTasks.filter((t) => t.status === "In Progress").slice(0, 1);
  const completedTasks = visibleTasks.filter((t) => t.status === "Completed").slice(0, 2);

  // Data for Director view
  const topThree = leaderboardData.slice(0, 3);
  const topPerformer = leaderboardData[0];
  const totalTasksCompletedTeam = leaderboardData.reduce(
    (sum, user) => sum + user.tasksCompleted,
    0
  );
  const totalTeamMembers = users.length;
  const avgScoreTeam =
    leaderboardData.length > 0
      ? Math.round(
          leaderboardData.reduce((sum, user) => sum + user.score, 0) /
            leaderboardData.length
        )
      : 0;
  const overdueTasksTeam = allTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "Completed"
  ).length;

  // Data for Employee view
  const myTasksCompleted = currentUserLeaderboard?.tasksCompleted || 0;
  const myScore = currentUserLeaderboard?.score || 0;
  const myOverdueTasks = visibleTasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== "Completed"
    ).length;

  const welcomeMessage = t("dashboard.welcome", { name: currentUser.name.split(" ")[0] });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            {welcomeMessage}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats Overview */}
      {isLvl1 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title={t('dashboard.my_tasks_completed')} value={myTasksCompleted} icon={CheckCircle} change="+2 dari bulan lalu" href="/tasks" color="green" />
          <StatsCard title={t('dashboard.my_score')} value={myScore} icon={Star} change="+10% dari bulan lalu" href="/leaderboard" color="yellow" />
          <StatsCard title={t('dashboard.my_rank')} value={`#${currentUserLeaderboard.rank}`} icon={Trophy} change="Naik 1 peringkat" href="/leaderboard" color="purple" />
          <StatsCard title={t('dashboard.overdue_tasks')} value={myOverdueTasks} icon={Clock} change="Tetap" href="/tasks" color="blue" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatsCard title={t('dashboard.total_tasks_completed')} value={totalTasksCompletedTeam} icon={CheckCircle} change="+5 dari bulan lalu" color="green" />
            <StatsCard title={t('dashboard.average_score')} value={avgScoreTeam} icon={Star} change="+2% dari bulan lalu" color="yellow" />
            <StatsCard title={t('dashboard.total_team_members')} value={totalTeamMembers} icon={TrendingUp} change="+1 anggota baru" color="purple" />
            <StatsCard title={t('dashboard.tasks_overdue')} value={overdueTasksTeam} icon={Clock} change="Berkurang 2" color="blue" />
        </div>
      )}
      

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {isLvl1 ? (
            <>
                {/* Employee View */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       {todoTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                       {inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                       {completedTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                       {/* If no tasks, show a placeholder */}
                       {todoTasks.length === 0 && inProgressTasks.length === 0 && completedTasks.length === 0 && (
                          <Card className="md:col-span-2 flex items-center justify-center h-48 md:h-64 card-spotlight">
                            <p className="text-muted-foreground">{t('dashboard.no_active_tasks')}</p>
                          </Card>
                       )}
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    <Card className="card-spotlight">
                        <CardHeader><CardTitle className="font-headline text-xl md:text-2xl text-foreground">{t('dashboard.my_monthly_progress')}</CardTitle></CardHeader>
                        <CardContent><ProgressChart currentUser={currentUser} /></CardContent>
                    </Card>
                </div>
            </>
        ) : (
            <>
                {/* Director View */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <Card className="card-spotlight">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl md:text-2xl text-foreground">{t('dashboard.team_leaderboard')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LeaderboardTable leaderboardData={topThree} />
                    </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    {topPerformer && <TopPerformerCard performer={topPerformer} />}
                </div>
            </>
        )}
      </div>


      {/* Additional Tasks for Director */}
      {!isLvl1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
                ))}
                {visibleTasks.filter(t => t.status === 'In Review').slice(0, 2).map((task) => (
                <TaskCard key={task.id} task={task} />
                ))}
            </div>
            </div>
            <div className="lg:col-span-1">
            <Card className="card-spotlight">
                <CardHeader>
                <CardTitle className="font-headline text-xl md:text-2xl text-foreground">
                    {t('dashboard.monthly_progress')}
                </CardTitle>
                </CardHeader>
                <CardContent>
                <ProgressChart currentUser={currentUser} />
                </CardContent>
            </Card>
            </div>
        </div>
      )}
      {currentUser && <Chatbot />}
    </div>
  );
}

    