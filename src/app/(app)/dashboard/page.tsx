
"use client";

import { useEffect, useState } from "react";
import { TaskCard } from "@/components/dashboard/task-card";
import { TopPerformerCard } from "@/components/dashboard/top-performer-card";
import { allTasks, users, leaderboardData } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookOpen, Trophy, Clock, Star, TrendingUp } from "lucide-react";
import { ProgressChart } from "@/components/leaderboard/progress-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Chatbot } from "@/components/chatbot";
import type { Task, User, LeaderboardEntry } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { isEmployee, isDirector } from "@/lib/roles";
import { MyRankCard } from "@/components/dashboard/my-rank-card";


export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLeaderboard, setCurrentUserLeaderboard] = useState<LeaderboardEntry | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
    if (selectedRole) {
      const user = users.find(u => u.role === selectedRole);
      setCurrentUser(user || users[0]);
    } else {
      setCurrentUser(users[0]); // Default to Direktur Utama if no role is selected
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const leaderboardEntry = leaderboardData.find(entry => entry.id === currentUser.id);
      setCurrentUserLeaderboard(leaderboardEntry || null);
    }
  }, [currentUser]);

  if (!currentUser || !currentUserLeaderboard) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold font-headline text-foreground">
          {t("dashboard.welcome", { name: currentUser.name.split(" ")[0] })}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {isLvl1 ? (
          <>
            <StatsCard title="Tugas Saya Selesai" value={myTasksCompleted} icon={BookOpen} href="/tasks" />
            <StatsCard title="Skor Saya" value={myScore} icon={Star} href="/leaderboard" />
            <StatsCard title="Peringkat Saya" value={`#${currentUserLeaderboard.rank}`} icon={Trophy} href="/leaderboard" />
            <StatsCard title="Tugas Terlambat" value={myOverdueTasks} icon={Clock} href="/tasks" />
          </>
        ) : (
          <>
            <StatsCard title="Total Tasks Completed" value={totalTasksCompletedTeam} icon={BookOpen} href="/tasks" />
            <StatsCard title="Total Team Members" value={totalTeamMembers} icon={TrendingUp} href="/settings" />
            <StatsCard title="Average Score" value={avgScoreTeam} icon={Trophy} href="/leaderboard" />
            <StatsCard title="Tasks Overdue" value={overdueTasksTeam} icon={Clock} href="/tasks" />
          </>
        )}
      </div>

      {/* Leaderboard Section (Director) or My Rank (Employee) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isLvl1 ? (
            <>
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {todoTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                       {inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                       {completedTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <MyRankCard entry={currentUserLeaderboard} />
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-foreground">Progres Bulanan Saya</CardTitle></CardHeader>
                        <CardContent><ProgressChart currentUser={currentUser} /></CardContent>
                    </Card>
                </div>
            </>
        ) : (
            <>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-foreground">Team Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            <LeaderboardTable leaderboardData={topThree} />
                        </div>
                    </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <TopPerformerCard performer={topPerformer} />
                </div>
            </>
        )}
      </div>


      {/* Tasks & Progress Section */}
      {!isLvl1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
                ))}
                {visibleTasks.filter(t => t.status === 'In Review').slice(0, 2).map((task) => (
                <TaskCard key={task.id} task={task} />
                ))}
            </div>
            </div>
            <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline text-foreground">
                    Monthly Progress
                </CardTitle>
                </CardHeader>
                <CardContent>
                <ProgressChart currentUser={currentUser} />
                </CardContent>
            </Card>
            </div>
        </div>
      )}
      <Chatbot tasks={visibleTasks} users={users} leaderboardData={leaderboardData} />
    </div>
  );
}
