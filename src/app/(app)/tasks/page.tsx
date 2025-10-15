
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TaskTable } from "@/components/dashboard/task-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskData } from "@/hooks/use-task-data";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";


export default function AllTasksPage() {
  const { currentUser } = useCurrentUser();
  const { allTasks, users, isLoading, setAllTasks } = useTaskData();
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();
  const query = searchParams.get('q') || '';
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  // State for the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    // On initial load, set view mode based on device
    if (isMobile) {
      setViewMode("list");
    }
  }, [isMobile]);

  if (!currentUser || isLoading) {
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

  const isUserEmployee = isEmployee(currentUser.role);
  
  const visibleTasks: Task[] = (() => {
    if (isEmployee(currentUser.role)) {
      // Level 1: Karyawan hanya melihat tugasnya sendiri
      return allTasks.filter(task => 
        task.assignees.some(assignee => assignee.id === currentUser.id)
      );
    }
    if (currentUser.role === UserRole.DIREKTUR_OPERASIONAL) {
      // Level 2: Direktur Operasional melihat tugas timnya
      const supervisedRoles = [UserRole.JURNALIS, UserRole.SOCIAL_MEDIA_OFFICER, UserRole.DESAIN_GRAFIS];
      return allTasks.filter(task => 
        task.assignees.some(assignee => supervisedRoles.includes(assignee.role))
      );
    }
    if (currentUser.role === UserRole.DIREKTUR_UTAMA) {
      // Level 3: Direktur Utama melihat semua tugas
      return allTasks;
    }
    // Fallback jika peran tidak terdefinisi
    return [];
  })();

  const filteredTasks = visibleTasks.filter(task => {
    const matchesSearch = task.title[locale].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignees.some(a => a.id === assigneeFilter);
    return matchesSearch && matchesStatus && matchesAssignee;
  });
  

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        <Button variant="outline" size="sm" asChild className="w-fit transition-all active:scale-95">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back_to_home')}
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold font-headline">{t('all_tasks.title')}</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('all_tasks.description')}
            </p>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('all_tasks.filter_placeholder')} 
                  className="w-full pl-8 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
            <div className="flex gap-2">
              {!isUserEmployee && (
                 <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="flex-1 sm:w-40 h-10">
                        <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              )}
              <Select value={statusFilter} onValueChange={(value: TaskStatus | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="flex-1 sm:w-40 h-10">
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
              <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                  <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="rounded-sm h-8 w-8"
                      onClick={() => setViewMode('list')}
                  >
                      <List className="h-4 w-4" />
                  </Button>
                  <Button
                      variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="rounded-sm h-8 w-8"
                      onClick={() => setViewMode('board')}
                  >
                      <LayoutGrid className="h-4 w-4" />
                  </Button>
              </div>
            </div>
        </div>

        {viewMode === 'list' ? (
          <TaskTable tasks={filteredTasks} currentUser={currentUser} onEdit={handleEditTask} />
        ) : (
          <KanbanBoard tasks={filteredTasks} setTasks={setAllTasks} allTasks={allTasks} />
        )}
      </div>
      {taskToEdit && (
        <EditTaskModal 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen} 
          task={taskToEdit} 
        />
      )}
    </>
  );
}
