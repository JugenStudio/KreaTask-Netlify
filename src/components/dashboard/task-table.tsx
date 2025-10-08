
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

const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "In Review": "bg-yellow-500 text-black",
  Completed: "bg-green-500",
  Blocked: "bg-red-500",
};

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const { locale } = useLanguage();

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Task</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[25%]">Team</TableHead>
              <TableHead className="w-[15%] hidden sm:table-cell">Due Date</TableHead>
              <TableHead className="w-[5%]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <Link href={`/tasks/${task.id}`} className="hover:underline break-words">
                    {task.title[locale]}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "text-white",
                      statusColors[task.status]
                    )}
                  >
                    {task.status}
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
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}`}>View Task</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
