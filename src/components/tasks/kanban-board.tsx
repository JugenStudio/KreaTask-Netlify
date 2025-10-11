
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import type { Task, TaskStatus } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTaskData } from "@/hooks/use-task-data";


// Wrapper component to fix react-beautiful-dnd issue with React 18 Strict Mode
const StrictDroppable = ({ children, droppableId }: { children: React.ReactNode, droppableId: string }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable droppableId={droppableId}>{children}</Droppable>;
};


const statusColumns: TaskStatus[] = ["To-do", "In Progress", "In Review", "Completed", "Blocked"];

const statusColors: Record<TaskStatus, string> = {
    "To-do": "bg-gray-500",
    "In Progress": "bg-blue-500",
    "In Review": "bg-yellow-500",
    "Completed": "bg-green-500",
    "Blocked": "bg-red-500",
};


function KanbanTaskCard({ task, index }: { task: Task, index: number }) {
    const { locale } = useLanguage();
    const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                >
                    <Card className={cn(
                        "bg-card hover:bg-muted transition-colors rounded-xl",
                        snapshot.isDragging && "shadow-lg scale-105"
                    )}>
                        <Link href={`/tasks/${task.id}`}>
                            <CardContent className="p-3">
                                <p className="text-sm font-semibold leading-tight mb-2 text-card-foreground break-words whitespace-normal">{task.title[locale]}</p>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 whitespace-normal">{task.description[locale]}</p>

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
                </div>
            )}
        </Draggable>
    )
}

function KanbanColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
    const { t } = useLanguage();

    return (
        <div className="w-full md:w-72 flex-shrink-0">
            <div className="h-full bg-secondary/50 rounded-xl md:rounded-2xl">
                <CardHeader className="p-3 flex-row justify-between items-center space-y-0">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", statusColors[status])} />
                        <CardTitle className="text-sm font-semibold whitespace-nowrap">
                            {t(`all_tasks.status.${status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: status})}
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
                </CardHeader>
                <StrictDroppable droppableId={status}>
                    {(provided: any, snapshot: any) => (
                        <CardContent 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                                "p-1.5 pt-0 min-h-[150px] transition-colors",
                                snapshot.isDraggingOver && "bg-primary/10"
                            )}
                        >
                            <div className="space-y-1">
                                {tasks.map((task, index) => (
                                    <KanbanTaskCard key={task.id} task={task} index={index} />
                                ))}
                                {provided.placeholder}
                            </div>
                        </CardContent>
                    )}
                </StrictDroppable>
            </div>
        </div>
    );
}

export function KanbanBoard({ tasks, setTasks, allTasks }: { tasks: Task[], setTasks: (tasks: Task[]) => void, allTasks: Task[] }) {
    const { t } = useLanguage();
    const { updateTask } = useTaskData();

    const tasksByStatus = statusColumns.reduce((acc, status) => {
        acc[status] = tasks.filter(task => task.status === status)
                           .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }
        
        const newStatus = destination.droppableId as TaskStatus;
        updateTask(draggableId, { status: newStatus });
    };

    if (tasks.length === 0) {
      return (
          <div className="text-center p-10 rounded-xl md:rounded-2xl bg-secondary/50">
              <p className="font-bold text-sm md:text-base">{t('all_tasks.no_tasks_title', { defaultValue: 'No Tasks Found' })}</p>
              <p className="text-sm text-muted-foreground">{t('all_tasks.no_tasks_desc', { defaultValue: 'Try adjusting your search or filter.' })}</p>
          </div>
      )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea className="w-full rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 pb-4">
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
    </DragDropContext>
  );
}
