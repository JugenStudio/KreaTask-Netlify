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
import type { Task, TaskStatus } from "@/lib/types";
import {
  CalendarDays,
  Download,
  File as FileIcon,
  Film,
  Image as ImageIcon,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const statusColors: Record<TaskStatus, string> = {
  "To-do": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "In Review": "bg-yellow-500 text-black",
  Completed: "bg-green-500",
  Blocked: "bg-red-500",
};

const fileTypeIcons = {
  video: <Film className="h-10 w-10 text-muted-foreground" />,
  image: <ImageIcon className="h-10 w-10 text-muted-foreground" />,
  illustration: <Palette className="h-10 w-10 text-muted-foreground" />,
  document: <FileIcon className="h-10 w-10 text-muted-foreground" />,
};

export function TaskDetails({ task }: { task: Task }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl">{task.title}</CardTitle>
                <CardDescription>Created on {new Date(task.createdAt).toLocaleDateString()}</CardDescription>
            </div>
            <Badge className={cn("text-white", statusColors[task.status])}>
                {task.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h4 className="font-semibold">Description</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Assignees</h4>
            <div className="flex items-center space-x-2">
              {task.assignees.map((user) => (
                <Avatar key={user.id} className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              <div>
                {task.assignees.map(user => <p key={user.id} className="text-sm font-medium">{user.name}</p>)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Due Date</h4>
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
          <h4 className="font-semibold">Attachments</h4>
          {task.files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                    {file.type === 'image' || file.type === 'illustration' ? (
                       <Image data-ai-hint="abstract art" src={file.url} alt={file.name} width={300} height={168} className="object-cover w-full h-full" />
                    ) : (
                      fileTypeIcons[file.type]
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <Button variant="outline" size="icon" asChild>
                        <a href={file.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No files attached.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
