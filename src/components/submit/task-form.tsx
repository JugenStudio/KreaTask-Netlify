
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
import { CalendarIcon, Paperclip, X, WandSparkles, Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTaskData } from "@/hooks/use-task-data";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useState, useMemo, useEffect } from "react";
import { TaskCategory, UserRole, type User, type LocalizedString } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { isDirector, isEmployee } from "@/lib/roles";
import { getTaskSuggestions, getTranslations } from "@/app/actions";
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

interface Suggestion {
    title: string;
    description: string;
}

export function TaskForm({ currentUser }: TaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { users, addTask, addNotification } = useTaskData();
  const [files, setFiles] = useState<File[]>([]);
  const [aiGoal, setAiGoal] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useLanguage();

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
    if (currentUser.role === UserRole.DIREKTUR_UTAMA) {
      return users;
    }
    if (isDirector(currentUser.role)) {
      return users.filter(u => isEmployee(u.role) || u.id === currentUser.id);
    }
    return [];
  }, [currentUser, users]);

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true);
    const newTaskId = `task-${Date.now()}`;
    const assignedUser = users.find(u => u.id === values.assignees[0]);

    // Translate title and description
    const titleTranslationPromise = getTranslations(values.title);
    let descriptionTranslations: LocalizedString = { en: "", id: "" };
    if (values.description && values.description.trim()) {
        const descriptionResult = await getTranslations(values.description);
        if (descriptionResult.error) {
            toast({
                variant: "destructive",
                title: "Translation Failed",
                description: "Could not translate task description. Please try again.",
            });
            setIsSubmitting(false);
            return;
        }
        descriptionTranslations = descriptionResult.data || { en: values.description, id: values.description };
    }

    const titleResult = await titleTranslationPromise;

    if (titleResult.error) {
      toast({
        variant: "destructive",
        title: "Translation Failed",
        description: "Could not translate task content. Please try again.",
      });
      setIsSubmitting(false);
      return;
    }

    const newTask = {
      id: newTaskId,
      title: titleResult.data || { en: values.title, id: values.title },
      description: descriptionTranslations,
      status: 'To-do' as const,
      assignees: assignedUser ? [assignedUser] : [],
      dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      category: values.category,
      value: 0,
      valueCategory: 'Rendah' as const,
      evaluator: 'AI' as const,
      approvedBy: null,
      revisions: [],
      comments: [],
      files: [],
      subtasks: [],
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
    setSuggestions([]);
    setAiGoal("");
    setIsSubmitting(false);
    router.push('/tasks');
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        return fileWithPreview;
      });
      setFiles(prev => [...prev, ...newFiles as any[]]);
    }
  }

  function removeFile(fileName: string) {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  }
  
  const canAssignTasks = !isEmployee(currentUser.role);

  const handleGenerateSuggestions = async () => {
    if (!aiGoal.trim()) return;
    setIsGenerating(true);
    setError(null);
    setSuggestions([]);
    const result = await getTaskSuggestions(aiGoal);
    if (result.error) {
      setError(result.error);
    } else if (result.suggestions) {
      setSuggestions(result.suggestions);
    }
    setIsGenerating(false);
  };
  
  const applySuggestion = (suggestion: Suggestion) => {
    form.setValue("title", suggestion.title);
    form.setValue("description", suggestion.description);
    toast({
      title: t('submit.toast.suggestion_applied_title'),
      description: t('submit.toast.suggestion_applied_desc'),
    });
  };

  return (
    <>
      <Card>
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
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              className="h-20"
              disabled={isGenerating}
            />
            <Button onClick={handleGenerateSuggestions} disabled={isGenerating || !aiGoal.trim()}>
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
            {suggestions.length > 0 && (
              <div className="space-y-3 pt-4">
                 <h4 className="font-semibold text-md">{t('submit.ai_generator.suggestions_title')}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.map((s, i) => (
                      <Card 
                        key={i} 
                        className="bg-secondary/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => applySuggestion(s)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                             <Lightbulb className="h-5 w-5 mt-1 text-yellow-400" />
                             <div>
                                <p className="font-semibold text-sm">{s.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="relative my-6 md:my-8">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">{t('submit.separator')}</span>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl md:text-2xl">{t('submit.manual_form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
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
                                {category}
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
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                </div>
                
                <FormItem>
                <FormLabel>{t('submit.manual_form.attachments_label')}</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-secondary", isSubmitting ? "cursor-not-allowed bg-muted" : "cursor-pointer hover:bg-muted")}>
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
                        <Card key={file.name} className="relative group rounded-xl">
                        <Image src={(file as any).preview} alt={file.name} width={200} height={150} className="object-cover rounded-lg aspect-[4/3]" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => removeFile(file.name)} className="transition-all active:scale-95" disabled={isSubmitting}>
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs p-2 truncate">{file.name}</p>
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
            </form>
            </Form>
        </CardContent>
      </Card>
    </>
  );
}

    