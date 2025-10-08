
"use client";

import { useEffect, useState } from "react";
import { TaskTable } from "@/components/dashboard/task-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allTasks, users } from "@/lib/data";
import { Filter, Search } from "lucide-react";
import type { Task, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { isEmployee } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllTasksPage() {
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

  if (!currentUser) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  const visibleTasks: Task[] = isEmployee(currentUser.role)
    ? allTasks.filter(task => task.assignees.some(assignee => assignee.id === currentUser.id))
    : allTasks;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">All Tasks</h1>
          <p className="text-muted-foreground">
            Browse and manage all tasks across the team.
          </p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter tasks..." className="w-full md:w-48 pl-8" />
            </div>
            <Select>
                <SelectTrigger className="w-40 hidden md:flex">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="todo">To-do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" className="hidden md:inline-flex">
                <Filter className="h-4 w-4 mr-2" />
                Filter
            </Button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <TaskTable tasks={visibleTasks} />
      </div>
    </div>
  );
}
