
"use client";

import { TaskCard } from "@/components/dashboard/task-card";
import { TopPerformerCard } from "@/components/dashboard/top-performer-card";
import { allTasks, users, leaderboardData } from "@/lib/data";
import { useLanguage } from "@/providers/language-provider";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookOpen, Trophy, Clock, Users as UsersIcon } from "lucide-react";
import { ProgressChart } from "@/components/leaderboard/progress-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Chatbot } from "@/components/chatbot";
import type { Task, User, UserRole } from "@/lib/types";

const EMPLOYEE_ROLES: UserRole[] = ['Jurnalis', 'Social Media Officer', 'Desain Grafis', 'Marketing', 'Finance'];

export default function DashboardPage() {
  const currentUser = users[0]; // Simulating logged in user
  const { t } = useLanguage();

  let visibleTasks: Task[];

  if (EMPLOYEE_ROLES.includes(currentUser.role)) {
    // Karyawan (Level 1) sees only their own tasks
    visibleTasks = allTasks.filter(task => 
      task.assignees.some(assignee => assignee.id === currentUser.id)
    );
  } else {
    // Direktur & Super User (Level 2 & 3) see all tasks
    visibleTasks = allTasks;
  }

  const topThree = leaderboardData.slice(0, 3);
  const topPerformer = leaderboardData[0];

  const inProgressTasks = visibleTasks
    .filter((t) => t.status === "In Progress")
    .slice(0, 2);
  const inReviewTasks = visibleTasks
    .filter((t) => t.status === "In Review")
    .slice(0, 2);

  const totalTasksCompleted = leaderboardData.reduce(
    (sum, user) => sum + user.tasksCompleted,
    0
  );
  const totalTeamMembers = users.length;
  const avgScore =
    leaderboardData.length > 0
      ? Math.round(
          leaderboardData.reduce((sum, user) => sum + user.score, 0) /
            leaderboardData.length
        )
      : 0;
  const overdueTasks = allTasks.filter(
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
        <StatsCard
          title="Total Tasks Completed"
          value={totalTasksCompleted}
          icon={BookOpen}
          href="/tasks"
        />
        <StatsCard
          title="Total Team Members"
          value={totalTeamMembers}
          icon={UsersIcon}
          href="/settings"
        />
        <StatsCard
          title="Average Score"
          value={avgScore}
          icon={Trophy}
          href="/leaderboard"
        />
        <StatsCard
          title="Tasks Overdue"
          value={overdueTasks}
          icon={Clock}
          href="/tasks"
        />
      </div>

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-foreground">
                Team Leaderboard
              </CardTitle>
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
      </div>

      {/* Tasks & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {inReviewTasks.map((task) => (
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
              <ProgressChart />
            </CardContent>
          </Card>
        </div>
      </div>
      <Chatbot tasks={visibleTasks} users={users} leaderboardData={leaderboardData} />
    </div>
  );
}
