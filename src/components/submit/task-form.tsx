
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
import { CalendarIcon, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { users } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card } from "../ui/card";
import { useState, useMemo } from "react";
import { TaskCategory, UserRole, type User } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { isDirector, isEmployee } from "@/lib/roles";

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

export function TaskForm({ currentUser }: TaskFormProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const defaultValues: Partial<TaskFormValues> = {
      title: "",
      description: "",
      category: TaskCategory.Medium,
      assignees: [],
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const assignableUsers = useMemo(() => {
    if (currentUser.role === UserRole.DIREKTUR_UTAMA) {
      // Level 3 can assign to anyone except themselves
      return users.filter(u => u.id !== currentUser.id);
    }
    if (isDirector(currentUser.role)) {
      // Level 2 can assign to employees
      return users.filter(u => isEmployee(u.role));
    }
    // Level 1 can't assign to others
    return [];
  }, [currentUser]);


  function onSubmit(values: TaskFormValues) {
    console.log(values);
    toast({
      title: "Task Submitted",
      description: `"${values.title}" has been created.`,
    });
    form.reset();
    setFiles([]);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Animate new hero section" {...field} />
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
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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

          <div className={cn("grid grid-cols-1 md:grid-cols-1 gap-8", canAssignTasks && "md:grid-cols-2")}>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-10 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
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
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={(value) => field.onChange([value])} >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee or director" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignableUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                                <Image src={user.avatarUrl} alt={user.name} width={20} height={20} className="rounded-full" />
                                <span>{user.name} ({user.role})</span>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a detailed description for the task..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormItem>
          <FormLabel>Attachments</FormLabel>
          <FormControl>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Paperclip className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Video, illustration, or any other file</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
              </label>
            </div>
          </FormControl>
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {files.map(file => (
                <Card key={file.name} className="relative group">
                  <Image src={(file as any).preview} alt={file.name} width={200} height={150} className="object-cover rounded-lg aspect-[4/3]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon" onClick={() => removeFile(file.name)}>
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
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Form>
  );
}
