
"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { Card, CardContent } from "../ui/card";

const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500 border-transparent text-white",
  "In Progress": "bg-blue-500 border-transparent text-white",
  "In Review": "bg-yellow-500 border-transparent text-yellow-900",
  "Completed": "bg-green-500 border-transparent text-white",
  "Blocked": "bg-red-500 border-transparent text-white",
};

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const { locale, t } = useLanguage();

  if (tasks.length === 0) {
      return (
          <div className="text-center p-10 rounded-2xl bg-secondary/50">
              <p className="font-bold">{t('all_tasks.no_tasks_title', { defaultValue: 'No Tasks Found' })}</p>
              <p className="text-sm text-muted-foreground">{t('all_tasks.no_tasks_desc', { defaultValue: 'Try adjusting your search or filter.' })}</p>
          </div>
      )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-lg border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{t('all_tasks.table.task')}</TableHead>
              <TableHead className="w-[15%]">{t('all_tasks.table.status')}</TableHead>
              <TableHead className="w-[25%]">{t('all_tasks.table.team')}</TableHead>
              <TableHead className="w-[15%] hidden sm:table-cell">{t('all_tasks.table.due_date')}</TableHead>
              <TableHead className="w-[5%]">
                <span className="sr-only">{t('all_tasks.table.actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <Link href={`/tasks/${task.id}`} className="hover:underline break-words transition-all active:scale-95">
                    {task.title[locale]}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={cn(statusColors[task.status])}>
                    {t(`all_tasks.status.${task.status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: task.status})}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {task.assignees.map((user) => (
                      <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" className="transition-all active:scale-95">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}`}>{t('all_tasks.actions.view')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>{t('all_tasks.actions.edit')}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">{t('all_tasks.actions.delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
          {tasks.map(task => (
              <Card key={task.id} className="transition-all active:scale-95">
                  <Link href={`/tasks/${task.id}`} className="block">
                      <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                              <p className="font-semibold text-sm flex-1 pr-2 text-card-foreground">{task.title[locale]}</p>
                               <Badge className={cn("text-xs", statusColors[task.status])}>
                                {t(`all_tasks.status.${task.status.toLowerCase().replace(' ', '_')}` as any, {defaultValue: task.status})}
                              </Badge>
                          </div>
                          <div className="flex justify-between items-end mt-3">
                            <div className="flex -space-x-2">
                              {task.assignees.map((user) => (
                                <Avatar key={user.id} className="h-8 w-8 border-2 border-card">
                                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                      </CardContent>
                  </Link>
              </Card>
          ))}
      </div>
    </>
  );
}
