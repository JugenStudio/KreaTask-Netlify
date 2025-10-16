
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
import type { Task, TaskStatus, Notification, File as FileType, Subtask, User } from "@/lib/types";
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
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "@/providers/language-provider";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/app/(app)/layout";
import { isDirector, isEmployee } from "@/lib/roles";
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
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { updateTaskAction, createNotificationAction, deleteTaskAction } from "@/app/actions";


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
}

// Helper to convert File to Data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function TaskDetails({ task }: TaskDetailsProps) {
  const { locale, t } = useLanguage();
  const { toast } = useToast();
  const { addToDownloadHistory } = useTaskData();
  const [submissionFiles, setSubmissionFiles] = useState<FileWithPreview[]>([]);
  const { currentUser } = useCurrentUser();
  const [fileToDelete, setFileToDelete] = useState<FileType | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const router = useRouter();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');

  const canDeleteTask = (task: Task, user: User | null): boolean => {
    if (!user) return false;
    // UI logic is simplified, the final check is on the server.
    return isDirector(user.role) || task.assignees.some(a => a.id === user.id);
  };

  const handleDeleteTask = async () => {
    if (!currentUser) return;
    try {
      await deleteTaskAction(task.id, currentUser.id);
      toast({
        title: t('all_tasks.toast.delete_success_title'),
        description: t('all_tasks.toast.delete_success_desc', { title: task.title[locale] }),
        variant: 'destructive',
      });
      router.push('/tasks');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message,
        });
    }
  };


  const handleSubtaskChange = async (subtaskId: string, checked: boolean) => {
    if(!currentUser) return;
    const updatedSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: checked } : st
    );
    await updateTaskAction(task.id, { subtasks: updatedSubtasks }, currentUser.id);
  };
  
  const handleDeleteFileClick = (file: FileType) => {
    setFileToDelete(file);
  };
  
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !currentUser) return;
    const updatedFiles = task.files?.filter(file => file.id !== fileToDelete.id);
    await updateTaskAction(task.id, { files: updatedFiles }, currentUser.id);

    toast({
      title: t('task.attachments.delete_toast.success_title'),
      description: t('task.attachments.delete_toast.success_desc', { fileName: fileToDelete.name }),
      variant: "destructive",
    });

    setFileToDelete(null); // Close the dialog
  };

  const handleAddNewFiles = async (newFiles: File[]) => {
    if (!currentUser) return;

    const fileObjectsPromises = newFiles.map(async (file, index) => {
      const dataUri = await fileToDataUri(file);
      return {
        id: `file-${task.id}-${Date.now() + index}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: dataUri,
        type: file.type.startsWith('image') ? 'image' : 'document',
      } as FileType;
    });

    const fileObjects = await Promise.all(fileObjectsPromises);
    const updatedFiles = [...(task.files || []), ...fileObjects];
    await updateTaskAction(task.id, { files: updatedFiles }, currentUser.id);
    
    await createNotificationAction({
      userId: currentUser.id,
      message: `${newFiles.length} file(s) have been attached to task "${task.title[locale]}".`,
      type: 'SYSTEM_UPDATE',
      read: false,
      link: `/tasks/${task.id}`,
      taskId: task.id,
      createdAt: new Date().toISOString(),
    });

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

  const handleEditNote = (file: FileType) => {
    setEditingFileId(file.id);
    setEditingNote(file.note || '');
  };

  const handleSaveNote = async (fileId: string) => {
    if(!currentUser) return;
    const updatedFiles = task.files?.map(f => f.id === fileId ? { ...f, note: editingNote } : f);
    await updateTaskAction(task.id, { files: updatedFiles }, currentUser.id);
    setEditingFileId(null);
    setEditingNote('');
  };

  const handleSubmitForReview = async () => {
    if (!currentUser) return;
    await updateTaskAction(task.id, { status: "In Review" }, currentUser.id);

    toast({
        title: t('task.submit.toast.success_title'),
        description: t('task.submit.toast.success_desc', { title: task.title[locale] }),
    });
    
    await createNotificationAction({
      userId: 'user-1', // Assuming Direktur Utama has a fixed ID or get it from users list
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
    addToDownloadHistory({ name: file.name, size: file.size, url: file.url }, task.title[locale]);

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

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="font-headline text-xl md:text-2xl">{task.title[locale]}</CardTitle>
              <CardDescription className="text-sm md:text-base">{t('task.created_on', { date: new Date(task.createdAt).toLocaleDateString() })}</CardDescription>
            </div>
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
                {task.files && task.files.length > 0 && (
                    task.files.map((file) => (
                    <Card key={file.id} className="overflow-hidden rounded-xl group">
                        <div className="block aspect-[16/9] bg-muted flex items-center justify-center">
                        {file.type === 'image' || file.type === 'illustration' ? (
                            <Image data-ai-hint="abstract art" src={file.url} alt={file.name} width={300} height={168} className="object-cover w-full h-full" />
                        ) : (
                            fileTypeIcons[file.type as keyof typeof fileTypeIcons]
                        )}
                        </div>
                        <div className="p-3">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                        {editingFileId === file.id ? (
                            <div className="mt-2 space-y-2">
                                <Input 
                                    value={editingNote} 
                                    onChange={(e) => setEditingNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="h-8 text-xs"
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" className="h-7" onClick={() => handleSaveNote(file.id)}>Save</Button>
                                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingFileId(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            file.note && <p className="text-xs italic text-muted-foreground mt-1">"{file.note}"</p>
                        )}
                        <div className="flex justify-end items-center gap-1 mt-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 transition-all active:scale-95" onClick={() => handleDownloadClick(file)}>
                            <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 transition-all active:scale-95" onClick={() => handleEditNote(file)}>
                            <Edit className="h-4 w-4" />
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
                    </Card>
                    ))
                )}
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
          
          {canDeleteTask(task, currentUser) && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('all_tasks.actions.delete')}
                </Button>
              </div>
            </>
          )}
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('all_tasks.delete_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('all_tasks.delete_dialog.description', { title: task.title[locale] })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('all_tasks.delete_dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">
              {t('all_tasks.delete_dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
