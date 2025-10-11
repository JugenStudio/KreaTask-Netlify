
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { ArrowRight, Star } from "lucide-react";

const statusColors: Record<TaskStatus, string> = {
    "To-do": "bg-gray-200 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "In Review": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-green-100 text-green-800",
    "Blocked": "bg-red-100 text-red-800",
};

const categoryColors = {
    "Low": "bg-green-100/10 text-green-300",
    "Medium": "bg-yellow-100/10 text-yellow-300",
    "High": "bg-orange-100/10 text-orange-300",
    "Critical": "bg-red-100/10 text-red-300",
}

export function TaskCard({ task }: { task: Task }) {
  const { locale, t } = useLanguage();

  return (
    <Card className={cn("card-spotlight bg-card transition-all hover:border-primary/50 active:scale-95")}>
      <CardHeader>
        <div className="flex justify-between items-center">
            <Badge className={cn(categoryColors[task.category], "font-bold border-none")}>{t(`submit.manual_form.categories.${task.category.toLowerCase()}`)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href={`/tasks/${task.id}`}>
            <CardTitle className="text-base md:text-lg font-bold hover:underline text-card-foreground">
              {task.title[locale]}
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-2 text-muted-foreground text-sm">
            {task.description[locale]}
          </CardDescription>
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              {task.assignees.map((user) => (
                <Avatar key={user.id} className="h-8 w-8 md:h-9 md:w-9 border-2 border-background/50">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Link href={`/tasks/${task.id}`} className="p-2 md:p-3 rounded-full bg-white/10 text-card-foreground cursor-pointer hover:bg-white/20 transition-colors">
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
