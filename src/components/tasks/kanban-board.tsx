
"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusColumns: TaskStatus[] = ["To-do", "In Progress", "In Review", "Completed", "Blocked"];

const statusColors: Record<TaskStatus, string> = {
    "To-do": "bg-gray-500",
    "In Progress": "bg-blue-500",
    "In Review": "bg-yellow-500",
    "Completed": "bg-green-500",
    "Blocked": "bg-red-500",
};


function KanbanTaskCard({ task }: { task: Task }) {
    const { locale } = useLanguage();
    const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
        <Card className="mb-4 bg-card hover:bg-muted transition-colors">
            <Link href={`/tasks/${task.id}`}>
                <CardContent className="p-3">
                    <p className="text-sm font-semibold leading-tight mb-2 text-card-foreground break-words">{task.title[locale]}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description[locale]}</p>

                    {totalSubtasks > 0 && (
                        <div className="text-xs text-muted-foreground mb-3">
                            {completedSubtasks} / {totalSubtasks} sub-tasks
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                        {task.assignees.map((user) => (
                            <Avatar key={user.id} className="h-6 w-6 border-2 border-card">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        </div>
                         <Badge variant="outline" className="text-xs">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Badge>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}

function KanbanColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
    const { t } = useLanguage();

    return (
        <div className="flex-shrink-0 w-72">
            <Card className="bg-secondary/50 border-none">
                <CardHeader className="p-3 flex-row justify-between items-center space-y-0">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[status])} />
                        <CardTitle className="text-sm font-semibold">
                            {t(`all_tasks.status.${status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: status})}
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="h-[500px] overflow-y-auto pr-2 -mr-2">
                        {tasks.map(task => (
                            <KanbanTaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
    
    // In a real app, setTasks would come from a context or prop to handle drag-and-drop state changes
    // For now, it's just for display
    const [taskState, setTaskState] = useState(tasks);
    const { t } = useLanguage();

    const tasksByStatus = statusColumns.reduce((acc, status) => {
        acc[status] = taskState.filter(task => task.status === status);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    if (tasks.length === 0) {
      return (
          <div className="text-center p-10 rounded-xl md:rounded-2xl bg-secondary/50">
              <p className="font-bold text-sm md:text-base">{t('all_tasks.no_tasks_title', { defaultValue: 'No Tasks Found' })}</p>
              <p className="text-sm text-muted-foreground">{t('all_tasks.no_tasks_desc', { defaultValue: 'Try adjusting your search or filter.' })}</p>
          </div>
      )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-6 pb-4">
            {statusColumns.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                />
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
