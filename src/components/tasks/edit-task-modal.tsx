
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTaskData } from "@/hooks/use-task-data";
import { Calendar } from "@/components/ui/calendar";
import { TaskCategory, type Task, type User, type Subtask, type LocalizedString } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";
import { useEffect, useMemo, useState } from "react";
import { getTranslations } from "@/app/actions";
import { useCurrentUser } from "@/app/(app)/layout";
import Image from 'next/image';
import { Checkbox } from "../ui/checkbox";

const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Subtask title cannot be empty."),
  isCompleted: z.boolean(),
});

const editTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  dueDate: z.date(),
  assignees: z.array(z.string()).min(1, "At least one assignee is required."),
  category: z.nativeEnum(TaskCategory),
  subtasks: z.array(subtaskSchema).optional(),
});

type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

interface EditTaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
}

export function EditTaskModal({ isOpen, onOpenChange, task }: EditTaskModalProps) {
  const { t, locale } = useLanguage();
  const { currentUser } = useCurrentUser();
  const { users, updateTask, addNotification } = useTaskData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignableUsers = useMemo(() => users, [users]);

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title[locale],
      description: task.description[locale],
      dueDate: new Date(task.dueDate),
      assignees: task.assignees.map(a => a.id),
      category: task.category,
      subtasks: task.subtasks,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  useEffect(() => {
    form.reset({
      title: task.title[locale],
      description: task.description[locale],
      dueDate: new Date(task.dueDate),
      assignees: task.assignees.map(a => a.id),
      category: task.category,
      subtasks: task.subtasks,
    });
  }, [task, isOpen, form, locale]);

  async function onSubmit(values: EditTaskFormValues) {
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      const [titleResult, descriptionResult] = await Promise.all([
        getTranslations(values.title),
        getTranslations(values.description || "")
      ]);

      const titleTranslations = titleResult.data || { en: values.title, id: values.title };
      const descriptionTranslations = descriptionResult.data || { en: values.description || "", id: values.description || "" };
      
      const assignedUser = users.find(u => u.id === values.assignees[0]);

      const newRevision = {
        id: `rev-${task.id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: currentUser,
        change: {
          en: `${currentUser.name} updated the task details.`,
          id: `${currentUser.name} memperbarui detail tugas.`,
        },
      };

      const updatedSubtasks = values.subtasks?.map(st => ({
        ...st,
        id: st.id || `subtask-${task.id}-${Date.now()}-${Math.random()}`,
      })) as Subtask[];

      const updates: Partial<Task> = {
        title: titleTranslations,
        description: descriptionTranslations,
        dueDate: format(values.dueDate, 'yyyy-MM-dd'),
        assignees: assignedUser ? [assignedUser] : [],
        category: values.category,
        subtasks: updatedSubtasks,
        revisions: [...task.revisions, newRevision],
      };

      updateTask(task.id, updates);
      
      if (assignedUser) {
        addNotification({
          id: `notif-edit-${Date.now()}`,
          userId: assignedUser.id,
          message: `Task "${updates.title?.[locale]}" has been updated by ${currentUser.name}.`,
          type: 'SYSTEM_UPDATE',
          read: false,
          link: `/tasks/${task.id}`,
          taskId: task.id,
          createdAt: new Date().toISOString(),
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{t('task.edit_modal.title')}</DialogTitle>
          <DialogDescription>{t('task.edit_modal.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('submit.manual_form.task_title_label')}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            variant="outline"
                            className={cn("h-10 justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>{t('submit.manual_form.due_date_placeholder')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('submit.manual_form.assign_to_label')}</FormLabel>
                    <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
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
                                <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('submit.manual_form.category_label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('submit.manual_form.category_placeholder')} /></SelectTrigger></FormControl>
                        <SelectContent>
                        {Object.values(TaskCategory).map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('submit.manual_form.description_label')}</FormLabel>
                  <FormControl><Textarea className="resize-y min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>{t('submit.manual_form.checklist_label')}</Label>
              <div className="mt-2 space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                     <Checkbox checked={field.isCompleted} disabled className="opacity-50" />
                    <Input
                      {...form.register(`subtasks.${index}.title`)}
                      className="h-9"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", isCompleted: false })}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('submit.manual_form.checklist_add_button')}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="ghost" disabled={isSubmitting}>{t('task.edit_modal.cancel_button')}</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('task.edit_modal.save_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
