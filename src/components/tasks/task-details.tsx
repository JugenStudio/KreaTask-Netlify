
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Task, TaskStatus } from "@/lib/types";
import {
  CalendarDays,
  Download,
  File as FileIcon,
  Film,
  Image as ImageIcon,
  Palette,
  Check,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "@/providers/language-provider";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "In Review": "bg-yellow-500 text-black",
  Completed: "bg-green-500",
  Blocked: "bg-red-500",
};

const fileTypeIcons = {
  video: <Film className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  image: <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  illustration: <Palette className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  document: <FileIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
};

export function TaskDetails({ task: initialTask }: { task: Task }) {
  const { locale, t } = useLanguage();
  const [task, setTask] = useState(initialTask);

  const handleSubtaskChange = (subtaskId: string, checked: boolean) => {
    setTask(prevTask => {
      const newSubtasks = prevTask.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: checked } : st
      );
      return { ...prevTask, subtasks: newSubtasks };
    });
  };
  
  const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
                <CardTitle className="font-headline text-xl md:text-2xl">{task.title[locale]}</CardTitle>
                <CardDescription className="text-sm md:text-base">{t('task.created_on', { date: new Date(task.createdAt).toLocaleDateString() })}</CardDescription>
            </div>
            <Badge className={cn("text-white text-xs md:text-sm whitespace-nowrap", statusColors[task.status])}>
                {t(`all_tasks.status.${task.status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: task.status})}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="space-y-2">
            <h4 className="font-semibold text-base md:text-lg">{t('task.description')}</h4>
            <p className="text-sm text-muted-foreground">{task.description[locale]}</p>
        </div>
        <Separator />
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base md:text-lg flex items-center gap-2"><ListChecks className="h-5 w-5"/> {t('task.checklist.title')}</h4>
            <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{t('task.checklist.progress', { completed: completedSubtasks.toString(), total: totalSubtasks.toString() })}</p>
            </div>
            <div className="space-y-3">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center space-x-3 bg-secondary/50 p-3 rounded-lg">
                  <Checkbox
                    id={`subtask-${subtask.id}`}
                    checked={subtask.isCompleted}
                    onCheckedChange={(checked) => handleSubtaskChange(subtask.id, !!checked)}
                  />
                  <Label
                    htmlFor={`subtask-${subtask.id}`}
                    className={cn("text-sm", subtask.isCompleted && "line-through text-muted-foreground")}
                  >
                    {subtask.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">{t('task.assignees')}</h4>
            <div className="flex items-center space-x-2">
              {task.assignees.map((user) => (
                <Avatar key={user.id} className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              <div>
                {task.assignees.map(user => <p key={user.id} className="text-sm font-medium">{user.name}</p>)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">{t('task.due_date')}</h4>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h4 className="font-semibold text-base md:text-lg">{t('task.attachments')}</h4>
          {task.files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.files.map((file) => (
                <Card key={file.id} className="overflow-hidden rounded-xl">
                  <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                    {file.type === 'image' || file.type === 'illustration' ? (
                       <Image data-ai-hint="abstract art" src={file.url} alt={file.name} width={300} height={168} className="object-cover w-full h-full" />
                    ) : (
                      fileTypeIcons[file.type]
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <Button variant="outline" size="icon" asChild className="h-8 w-8 transition-all active:scale-95">
                        <a href={file.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('task.no_attachments')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
