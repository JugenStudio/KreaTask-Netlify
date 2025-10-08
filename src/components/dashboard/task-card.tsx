"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Star } from "lucide-react";

const statusColors: Record<TaskStatus, string> = {
    "To-do": "bg-gray-200 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "In Review": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-green-100 text-green-800",
    "Blocked": "bg-red-100 text-red-800",
};

const categoryColors = {
    "Low": "bg-green-100 text-green-800",
    "Medium": "bg-yellow-100 text-yellow-800",
    "High": "bg-orange-100 text-orange-800",
    "Critical": "bg-red-100 text-red-800",
}

export function TaskCard({ task }: { task: Task }) {
  const { locale } = useLanguage();

  return (
    <Card className={cn("rounded-2xl shadow-none border-none", `bg-accent`)}>
      <CardHeader>
        <div className="flex justify-between items-center">
            <Badge className={cn(categoryColors[task.category], "font-bold")}>{task.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                <span className="font-bold text-card-foreground">4.5</span>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href={`/tasks/${task.id}`}>
            <CardTitle className="text-lg font-bold hover:underline text-card-foreground">
              {task.title[locale]}
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-2 text-muted-foreground">
            {task.description[locale]}
          </CardDescription>
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              {task.assignees.map((user) => (
                <Avatar key={user.id} className="h-9 w-9 border-2 border-accent">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-xs font-bold border-2 border-accent">
                5+
              </div>
            </div>
            <Link href={`/tasks/${task.id}`} className="p-3 rounded-full bg-card/80 text-card-foreground cursor-pointer hover:bg-card transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
