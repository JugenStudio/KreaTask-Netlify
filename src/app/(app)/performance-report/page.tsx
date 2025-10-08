
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allTasks, users } from "@/lib/data";
import type { Task, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { isEmployee } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportTable } from "@/components/performance-report/report-table";
import { History } from "lucide-react";


export default function PerformanceReportPage() {
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

  const completedTasks = useMemo(() => {
    if (!currentUser) return [];
    return allTasks.filter(task => 
      task.status === "Completed" && 
      task.assignees.some(assignee => assignee.id === currentUser.id)
    );
  }, [currentUser]);


  if (!currentUser) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-1/3" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  // This page is intended for employees to see their task history.
  // Redirect directors or other roles if they land here.
  if (!isEmployee(currentUser.role)) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>This page is intended for employee task history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>As a director, you can view all tasks on the "All Tasks" page.</p>
                    <Button asChild className="mt-4">
                        <a href="/tasks">Go to All Tasks</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="h-8 w-8" />
            Riwayat Tugas Selesai
          </h1>
          <p className="text-muted-foreground">
            Berikut adalah daftar semua tugas yang telah Anda selesaikan.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
            <ReportTable tasks={completedTasks} />
        </CardContent>
      </Card>
    </div>
  );
}

