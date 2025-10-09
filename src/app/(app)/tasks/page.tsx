
"use client";

import { useState } from "react";
import { TaskTable } from "@/components/dashboard/task-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allTasks, users } from "@/lib/data";
import { Search, List, LayoutGrid, ArrowLeft } from "lucide-react";
import type { Task, TaskStatus, User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { isEmployee } from "@/lib/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/app/(app)/layout";
import Link from "next/link";

export default function AllTasksPage() {
  const { currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const { t, locale } = useLanguage();

  if (!currentUser) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Skeleton className="h-10 md:h-12 w-1/3" />
                <div className="flex gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 flex-1 md:w-48" />
                    <Skeleton className="h-10 w-32 md:w-40" />
                </div>
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  const visibleTasks: Task[] = isEmployee(currentUser.role)
    ? allTasks.filter(task => task.assignees.some(assignee => assignee.id === currentUser.id))
    : allTasks;

  const filteredTasks = visibleTasks.filter(task => {
    const matchesSearch = task.title[locale].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </Button>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('all_tasks.title')}</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('all_tasks.description')}
          </p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('all_tasks.filter_placeholder')} 
                  className="w-full md:w-48 pl-8 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
            <Select value={statusFilter} onValueChange={(value: TaskStatus | "all") => setStatusFilter(value)}>
                <SelectTrigger className="w-32 md:w-40 h-10">
                    <SelectValue placeholder={t('all_tasks.all_statuses')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('all_tasks.all_statuses')}</SelectItem>
                    <SelectItem value="To-do">{t('all_tasks.status.to-do')}</SelectItem>
                    <SelectItem value="In Progress">{t('all_tasks.status.in_progress')}</SelectItem>
                    <SelectItem value="In Review">{t('all_tasks.status.in_review')}</SelectItem>
                    <SelectItem value="Completed">{t('all_tasks.status.completed')}</SelectItem>
                    <SelectItem value="Blocked">{t('all_tasks.status.blocked')}</SelectItem>
                </SelectContent>
            </Select>
             <div className="hidden md:flex items-center gap-1 rounded-full bg-muted p-1">
                <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setViewMode('list')}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setViewMode('board')}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      {viewMode === 'list' || (typeof window !== 'undefined' && window.innerWidth < 768) ? (
        <TaskTable tasks={filteredTasks} />
      ) : (
        <KanbanBoard tasks={filteredTasks} />
      )}
    </div>
  );
}
