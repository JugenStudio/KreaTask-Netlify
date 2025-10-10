
"use client";

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
import type { Task, TaskStatus, Notification, File as FileType, Subtask } from "@/lib/types";
import {
  CalendarDays,
  Download,
  File as FileIcon,
  Film,
  Image as ImageIcon,
  Palette,
  ListChecks,
  Send,
  UploadCloud,
  X,
  Paperclip,
  Trash2,
  PlusCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "@/providers/language-provider";
import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/app/(app)/layout";
import { isEmployee } from "@/lib/roles";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTaskData } from "@/hooks/use-task-data";

const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "In Review": "bg-yellow-500",
  Completed: "bg-green-500",
  Blocked: "bg-red-500",
};

const fileTypeIcons = {
  video: <Film className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  image: <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  illustration: <Palette className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
  document: <FileIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />,
};

interface FileWithPreview extends File {
  preview: string;
}

interface TaskDetailsProps {
    task: Task;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    onAddNotification: (notification: Notification) => void;
}

export function TaskDetails({ task: initialTask, onUpdateTask, onAddNotification }: TaskDetailsProps) {
  const { locale, t } = useLanguage();
  const { toast } = useToast();
  const { addToDownloadHistory } = useTaskData();
  const [task, setTask] = useState(initialTask);
  const [submissionFiles, setSubmissionFiles] = useState<FileWithPreview[]>([]);
  const { currentUser } = useCurrentUser();
  const [fileToDelete, setFileToDelete] = useState<FileType | null>(null);

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);
  
  useEffect(() => {
    // Cleanup function to revoke object URLs on component unmount
    return () => {
        submissionFiles.forEach(file => {
            URL.revokeObjectURL(file.preview);
        });
    };
  }, [submissionFiles]);

  const handleSubtaskChange = (subtaskId: string, checked: boolean) => {
    const updatedSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: checked } : st
    );
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setTask(updatedTask);
    onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };
  
  const handleDeleteFileClick = (file: FileType) => {
    setFileToDelete(file);
  };
  
  const confirmDeleteFile = () => {
    if (!fileToDelete) return;

    const updatedFiles = task.files?.filter(file => file.id !== fileToDelete.id);
    const updatedTask = { ...task, files: updatedFiles };
    
    setTask(updatedTask);
    onUpdateTask(task.id, { files: updatedFiles });

    toast({
      title: t('task.attachments.delete_toast.success_title'),
      description: t('task.attachments.delete_toast.success_desc', { fileName: fileToDelete.name }),
      variant: "destructive",
    });

    setFileToDelete(null); // Close the dialog
  };

  const handleAddNewFiles = (newFiles: File[]) => {
    const fileObjects: FileType[] = newFiles.map((file, index) => ({
      id: `file-${task.id}-${Date.now() + index}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(file), // Create a temporary URL for preview
      type: file.type.startsWith('image') ? 'image' : 'document',
    }));

    const updatedFiles = [...(task.files || []), ...fileObjects];
    const updatedTask = { ...task, files: updatedFiles };
    
    setTask(updatedTask);
    onUpdateTask(task.id, { files: updatedFiles });
    
    toast({
      title: t('task.attachments.upload_toast.success_title'),
      description: t('task.attachments.upload_toast.success_desc', { count: newFiles.length.toString() }),
    });
  };

  const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleAddNewFiles(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  };

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleAddNewFiles(Array.from(event.target.files));
      event.target.value = ''; // Reset input to allow re-uploading the same file
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updatedTask = { ...task, status: newStatus };
    setTask(updatedTask);
    onUpdateTask(task.id, { status: newStatus });
    toast({
      title: t('task.status_change_toast.title'),
      description: t('task.status_change_toast.description', { title: task.title[locale], status: t(`all_tasks.status.${newStatus.toLowerCase().replace(' ', '_')}`) }),
    });
  }


  const handleSubmitForReview = () => {
    const updatedTask = { ...task, status: "In Review" as TaskStatus };
    setTask(updatedTask);
    onUpdateTask(task.id, { status: "In Review" });

    toast({
        title: t('task.submit.toast.success_title'),
        description: t('task.submit.toast.success_desc', { title: task.title[locale] }),
    });
    
    onAddNotification({
      id: `notif-review-${Date.now()}`,
      userId: 'user-1',
      message: `${currentUser?.name} has submitted task "${task.title[locale]}" for review.`,
      type: 'VALIDATION_REQUEST',
      read: false,
      link: `/performance-report`,
      taskId: task.id,
      createdAt: new Date().toISOString(),
    });
  };

  function handleSubmissionFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setSubmissionFiles(prev => [...prev, ...newFiles as FileWithPreview[]]);
      toast({
        title: t('task.submit.upload.toast.success_title'),
        description: t('task.submit.upload.toast.success_desc', { count: newFiles.length.toString() })
      });
    }
  }

  function removeSubmissionFile(fileName: string) {
    setSubmissionFiles(prev => {
        const fileToRemove = prev.find(f => f.name === fileName);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        return prev.filter(file => file.name !== fileName);
    });
  }

  const handleDownloadClick = (file: FileType) => {
    // 1. Add to download manager to simulate progress
    addToDownloadHistory({ name: file.name, size: file.size }, task.title[locale]);

    // 2. Programmatically trigger the actual download
    const link = document.createElement('a');
    link.href = file.url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const isAssignedToCurrentUser = currentUser && task.assignees.some(a => a.id === currentUser.id);
  const canSubmit = isEmployee(currentUser?.role || '') && isAssignedToCurrentUser && (task.status === 'In Progress' || task.status === 'To-do');

  const visibleFiles = useMemo(() => {
    if (!task.files) return [];
  
    const completedLinkedFileIds = new Set(
      task.subtasks
        ?.filter(st => st.isCompleted && st.linkedFileId)
        .map(st => st.linkedFileId)
    );
  
    return task.files.filter(file => {
      const isLinkedToAnySubtask = task.subtasks?.some(st => st.linkedFileId === file.id);
      
      if (!isLinkedToAnySubtask) {
        return true;
      }
      
      return completedLinkedFileIds.has(file.id);
    });
  }, [task.files, task.subtasks]);


  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
              <div>
                  <CardTitle className="font-headline text-xl md:text-2xl">{task.title[locale]}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{t('task.created_on', { date: new Date(task.createdAt).toLocaleDateString() })}</CardDescription>
              </div>
              <Select value={task.status} onValueChange={(value: TaskStatus) => handleStatusChange(value)}>
                <SelectTrigger className="w-fit min-w-[140px] text-xs md:text-sm font-semibold border-border bg-secondary hover:bg-muted focus:ring-ring gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", statusColors[task.status])}></span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusColors).map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", statusColors[status as TaskStatus])}></span>
                        {t(`all_tasks.status.${status.toLowerCase().replace(' ', '_')}` as any)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">

          {canSubmit && (
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl">
                          <UploadCloud className="h-6 w-6 text-primary" />
                          {t('task.submit.panel.title')}
                      </CardTitle>
                      <CardDescription>{t('task.submit.panel.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="submission-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-muted">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Paperclip className="w-6 h-6 md:w-8 md:h-8 mb-3 text-muted-foreground" />
                                  <p className="mb-2 text-xs md:text-sm text-muted-foreground"><span className="font-semibold">{t('submit.manual_form.attachments_cta')}</span> {t('submit.manual_form.attachments_dnd')}</p>
                                  <p className="text-xs text-muted-foreground">{t('submit.manual_form.attachments_desc')}</p>
                              </div>
                              <input id="submission-file-upload" type="file" className="hidden" multiple onChange={handleSubmissionFileChange} />
                          </label>
                      </div>
                      {submissionFiles.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {submissionFiles.map(file => (
                                  <div key={file.name} className="relative group rounded-xl bg-background p-2">
                                      <Image src={file.preview} alt={file.name} width={200} height={150} className="object-cover rounded-lg aspect-[4/3]" />
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                          <Button variant="destructive" size="icon" onClick={() => removeSubmissionFile(file.name)} className="transition-all active:scale-95 h-8 w-8">
                                              <X className="h-4 w-4" />
                                          </Button>
                                      </div>
                                      <p className="text-xs pt-2 truncate text-center text-muted-foreground">{file.name}</p>
                                  </div>
                              ))}
                          </div>
                      )}
                       <Button onClick={handleSubmitForReview} className="w-full" disabled={submissionFiles.length === 0}>
                          <Send className="mr-2 h-4 w-4" />
                          {t('task.submit.panel.submit_button')}
                      </Button>
                  </CardContent>
              </Card>
          )}

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
              <div className="flex flex-col space-y-2">
                  {task.assignees.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">{user.name}</p>
                      </div>
                  ))}
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
            <h4 className="font-semibold text-base md:text-lg">{t('task.attachments.title')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFiles && visibleFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden rounded-xl group">
                  <div className="block aspect-[16/9] bg-muted flex items-center justify-center">
                    {file.type === 'image' || file.type === 'illustration' ? (
                        <Image data-ai-hint="abstract art" src={file.url} alt={file.name} width={300} height={168} className="object-cover w-full h-full" />
                    ) : (
                      fileTypeIcons[file.type as keyof typeof fileTypeIcons]
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 transition-all active:scale-95" onClick={() => handleDownloadClick(file)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 transition-all active:scale-95"
                          onClick={() => handleDeleteFileClick(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {/* Upload Card */}
              <label 
                htmlFor="attachment-upload-input"
                className="flex flex-col items-center justify-center aspect-[16/9] w-full border-2 border-dashed rounded-xl bg-secondary/30 text-muted-foreground hover:bg-muted hover:border-primary hover:text-primary transition-colors cursor-pointer"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <span className="text-sm font-semibold">{t('task.attachments.upload_card.title')}</span>
                  <span className="text-xs">{t('task.attachments.upload_card.description')}</span>
              </label>
              <input 
                id="attachment-upload-input" 
                type="file" 
                className="hidden" 
                multiple
                onChange={handleFileUploadChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('task.attachments.delete_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('task.attachments.delete_dialog.description', { fileName: fileToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('task.attachments.delete_dialog.cancel_button')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} className="bg-destructive hover:bg-destructive/90">
              {t('task.attachments.delete_dialog.confirm_button')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    