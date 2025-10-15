
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Paperclip, X, WandSparkles, Loader2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useTaskData } from "@/hooks/use-task-data";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useState, useMemo, useEffect } from "react";
import { TaskCategory, UserRole, type User, type LocalizedString, type Subtask, type File as FileType, type ValueCategory } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { isDirector, isEmployee } from "@/lib/roles";
import { getTaskFromAI, getTranslations } from "@/app/actions";
import { Separator } from "../ui/separator";
import { useLanguage } from "@/providers/language-provider";
import { useRouter } from "next/navigation";


const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  category: z.nativeEnum(TaskCategory),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  assignees: z.array(z.string()).min(1, "At least one assignee is required."),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
    currentUser: User;
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

const getScoringFromCategory = (category: TaskCategory): { value: number; valueCategory: ValueCategory } => {
  switch (category) {
    case TaskCategory.Critical:
      return { value: 50, valueCategory: 'Kritis' };
    case TaskCategory.High:
      return { value: 40, valueCategory: 'Tinggi' };
    case TaskCategory.Medium:
      return { value: 20, valueCategory: 'Menengah' };
    case TaskCategory.Low:
      return { value: 10, valueCategory: 'Rendah' };
    default:
      return { value: 10, valueCategory: 'Rendah' };
  }
};


export function TaskForm({ currentUser }: TaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { users, addTask, addNotification } = useTaskData();
  const [files, setFiles] = useState<File[]>([]);
  const [aiCommand, setAiCommand] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useLanguage();

  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [currentSubtask, setCurrentSubtask] = useState("");

  const defaultValues: Partial<TaskFormValues> = useMemo(() => ({
      title: "",
      description: "",
      category: TaskCategory.Medium,
      assignees: isEmployee(currentUser.role) ? [currentUser.id] : [],
  }), [currentUser]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [currentUser, defaultValues, form]);


  const assignableUsers = useMemo(() => {
    if (isEmployee(currentUser.role)) {
      return [currentUser];
    }
    if (currentUser.role === UserRole.DIREKTUR_UTAMA || currentUser.role === UserRole.ADMIN) {
      return users;
    }
    if (isDirector(currentUser.role)) {
      return users.filter(u => isEmployee(u.role) || u.id === currentUser.id);
    }
    return [];
  }, [currentUser, users]);

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true);
    setError(null);
    const newTaskId = `task-${Date.now()}`;
    const assignedUser = users.find(u => u.id === values.assignees[0]);

    try {
        // Translate title and description concurrently
        const [titleResult, descriptionResult] = await Promise.all([
            getTranslations(values.title),
            getTranslations(values.description || "")
        ]);

        if (titleResult.error || descriptionResult.error) {
            const errorMessage = titleResult.error || descriptionResult.error || "Translation failed.";
            toast({
                variant: "destructive",
                title: "Translation Error",
                description: errorMessage,
            });
            setError(errorMessage);
            setIsSubmitting(false);
            return;
        }

        const titleTranslations = titleResult.data || { en: values.title, id: values.title };
        const descriptionTranslations = descriptionResult.data || { en: values.description || "", id: values.description || "" };
        
        const newSubtasks: Subtask[] = subtasks.map((subtaskTitle, index) => ({
          id: `subtask-${newTaskId}-${index}`,
          title: subtaskTitle,
          isCompleted: false,
        }));
        
        const newFilesPromises = files.map(async (file, index) => {
            const dataUri = await fileToDataUri(file);
            return {
                id: `file-${newTaskId}-${index}`,
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                url: dataUri,
                type: file.type.startsWith('image') ? 'image' : 'document',
            } as FileType;
        });

        const newFiles = await Promise.all(newFilesPromises);

        const { value, valueCategory } = getScoringFromCategory(values.category);

        const newTask = {
          id: newTaskId,
          title: titleTranslations,
          description: descriptionTranslations,
          status: 'To-do' as const,
          assignees: assignedUser ? [assignedUser] : [],
          dueDate: format(values.dueDate, 'yyyy-MM-dd'),
          createdAt: new Date().toISOString(),
          category: values.category,
          value: value,
          valueCategory: valueCategory,
          evaluator: 'AI' as const,
          approvedBy: null,
          revisions: [],
          comments: [],
          files: newFiles,
          subtasks: newSubtasks,
        };
        
        addTask(newTask);

        addNotification({
          id: `notif-${Date.now()}`,
          userId: currentUser.id,
          message: `You created a new task: "${newTask.title[locale]}"`,
          type: 'TASK_ASSIGN',
          read: false,
          link: `/tasks/${newTaskId}`,
          taskId: newTaskId,
          createdAt: new Date().toISOString(),
        });
        
        if (assignedUser && assignedUser.id !== currentUser.id) {
           addNotification({
            id: `notif-${Date.now() + 1}`,
            userId: assignedUser.id,
            message: `${currentUser.name} assigned you a new task: "${newTask.title[locale]}"`,
            type: 'TASK_ASSIGN',
            read: false,
            link: `/tasks/${newTaskId}`,
            taskId: newTaskId,
            createdAt: new Date().toISOString(),
          });
        }

        toast({
          title: t('submit.toast.success_title'),
          description: t('submit.toast.success_desc', { title: newTask.title[locale] }),
        });

        form.reset();
        setFiles([]);
        setSubtasks([]);
        setAiCommand("");
        router.push('/tasks');

    } catch (e) {
        console.error("An unexpected error occurred during task submission:", e);
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setFiles(prev => [...prev, ...Array.from(event.target.files)]);
    }
  }

  function removeFile(fileName: string) {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  }
  
  const canAssignTasks = !isEmployee(currentUser.role);

  const handleSmartFill = async () => {
    if (!aiCommand.trim()) return;
    setIsGenerating(true);
    setError(null);

    const assignableUserNames = assignableUsers.map(u => u.name);
    const { taskData, error: aiErrorKey } = await getTaskFromAI(aiCommand, assignableUserNames);
    
    if (aiErrorKey) {
        const translatedError = t(aiErrorKey as any);
        setError(translatedError);
        toast({ 
            variant: "destructive", 
            title: t('submit.toast.ai_error_title' as any), 
            description: translatedError 
        });
    } else if (taskData) {
        // Apply the AI data to the form
        if (taskData.title) form.setValue("title", taskData.title);
        if (taskData.description) form.setValue("description", taskData.description);
        if (taskData.category) form.setValue("category", taskData.category);
        if (taskData.dueDate) {
            // Ensure date is parsed correctly, even with timezone differences
            const date = parseISO(taskData.dueDate);
            form.setValue("dueDate", date);
        }
        if (taskData.assigneeName) {
            const assignedUser = assignableUsers.find(u => u.name === taskData.assigneeName);
            if (assignedUser) {
                form.setValue("assignees", [assignedUser.id]);
            }
        }
        if (taskData.subtasks) {
            setSubtasks(taskData.subtasks);
        }
        toast({
          title: t('submit.toast.suggestion_applied_title'),
          description: t('submit.toast.suggestion_applied_desc'),
        });
    }
    setIsGenerating(false);
  };
  
  const handleAddSubtask = () => {
    if (currentSubtask.trim() !== "") {
      setSubtasks([...subtasks, currentSubtask.trim()]);
      setCurrentSubtask("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };


  return (
    <>
      <Card className="card-spotlight hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
            <WandSparkles className="h-6 w-6 text-primary" />
            {t('submit.ai_generator.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder={t('submit.ai_generator.placeholder')}
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              className="h-24"
              disabled={isGenerating}
            />
            <Button onClick={handleSmartFill} disabled={isGenerating || !aiCommand.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('submit.ai_generator.loading_button')}
                </>
              ) : (
                t('submit.ai_generator.button')
              )}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="relative my-6 md:my-8">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">{t('submit.separator')}</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="card-spotlight hover:border-primary/50 transition-colors">
            <CardHeader>
                <CardTitle className="font-headline text-xl md:text-2xl">{t('submit.manual_form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('submit.manual_form.task_title_label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('submit.manual_form.task_title_placeholder')} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('submit.manual_form.category_label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('submit.manual_form.category_placeholder')} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {Object.values(TaskCategory).map((category) => (
                                <SelectItem key={category} value={category}>
                                {t(`submit.manual_form.categories.${category.toLowerCase()}`)}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className={cn("grid grid-cols-1 gap-6 md:gap-8", canAssignTasks && "md:grid-cols-2")}>
                    <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>{t('submit.manual_form.due_date_label')}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-10 justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>{t('submit.manual_form.due_date_placeholder')}</span>
                                )}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {canAssignTasks && (
                    <FormField
                        control={form.control}
                        name="assignees"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('submit.manual_form.assign_to_label')}</FormLabel>
                            <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={t('submit.manual_form.assign_to_placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {assignableUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                    <div className="flex items-center gap-2">
                                        <Image src={user.avatarUrl} alt={user.name} width={20} height={20} className="rounded-full" />
                                        <span>{user.name} ({t(`roles.${user.role}` as any)})</span>
                                    </div>
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    )}
                </div>
                
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('submit.manual_form.description_label')}</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder={t('submit.manual_form.description_placeholder')}
                            className="resize-none h-24"
                            {...field}
                            disabled={isSubmitting}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 
                <FormItem>
                    <FormLabel>{t('submit.manual_form.checklist_label')}</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input 
                                placeholder={t('submit.manual_form.checklist_placeholder')}
                                value={currentSubtask}
                                onChange={(e) => setCurrentSubtask(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubtask();
                                    }
                                }}
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <Button type="button" onClick={handleAddSubtask} disabled={isSubmitting || !currentSubtask.trim()} className="transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" /> {t('submit.manual_form.checklist_add_button')}
                        </Button>
                    </div>
                     {subtasks.length > 0 && (
                        <div className="space-y-2 pt-2">
                            {subtasks.map((task, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/50">
                                    <span className="text-sm text-secondary-foreground">{task}</span>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleRemoveSubtask(index)} 
                                        className="h-6 w-6 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all active:scale-95"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </FormItem>

                <FormItem>
                <FormLabel>{t('submit.manual_form.attachments_label')}</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-secondary/50", isSubmitting ? "cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-muted")}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Paperclip className="w-6 h-6 md:w-8 md:h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-xs md:text-sm text-muted-foreground"><span className="font-semibold">{t('submit.manual_form.attachments_cta')}</span> {t('submit.manual_form.attachments_dnd')}</p>
                            <p className="text-xs text-muted-foreground">{t('submit.manual_form.attachments_desc')}</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} disabled={isSubmitting} />
                    </label>
                    </div>
                </FormControl>
                {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {files.map(file => (
                        <Card key={file.name} className="relative group rounded-xl overflow-hidden card-spotlight hover:border-primary/50 transition-colors">
                        <Image src={URL.createObjectURL(file)} alt={file.name} width={200} height={150} className="object-cover w-full h-full aspect-[4/3]" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => removeFile(file.name)} className="transition-all active:scale-95" disabled={isSubmitting}>
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                           <p className="text-xs text-white truncate">{file.name}</p>
                        </div>
                        </Card>
                    ))}
                    </div>
                )}
                </FormItem>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => form.reset()} className="transition-all active:scale-95" disabled={isSubmitting}>{t('submit.manual_form.cancel_button')}</Button>
                    <Button type="submit" className="transition-all active:scale-95" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('submit.manual_form.submit_button_loading', { defaultValue: 'Creating...' })}
                            </>
                        ) : (
                           t('submit.manual_form.submit_button')
                        )}
                    </Button>
                </div>
                </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </>
  );
}
