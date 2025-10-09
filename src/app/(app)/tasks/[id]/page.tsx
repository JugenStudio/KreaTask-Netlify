
"use client";

import { useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CommentSection } from "@/components/tasks/comment-section";
import { RevisionHistory } from "@/components/tasks/revision-history";
import { TaskDetails } from "@/components/tasks/task-details";
import { useTaskData } from "@/hooks/use-task-data";
import { notFound, useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/app/(app)/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { allTasks, users, isLoading, updateTask, addNotification } = useTaskData();
  const { currentUser } = useCurrentUser();
  
  const task = useMemo(() => allTasks.find((t) => t.id === id), [id, allTasks]);
  
  const { t } = useLanguage();

  if (isLoading || !currentUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-36" />
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Skeleton className="md:col-span-2 h-[600px]" />
            <Skeleton className="md:col-span-1 h-[400px]" />
        </div>
      </div>
    );
  }

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('all_tasks.back_to_tasks')}
        </Button>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2">
            <TaskDetails 
              task={task} 
              onUpdateTask={updateTask} 
              onAddNotification={addNotification}
            />
        </div>
        <div className="md:col-span-1">
            <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">{t('task.tabs.comments')}</TabsTrigger>
                <TabsTrigger value="revisions">{t('task.tabs.history')}</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
                <CommentSection comments={task.comments} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="revisions" className="mt-4">
                <RevisionHistory revisions={task.revisions} />
            </TabsContent>
            </Tabs>
        </div>
        </div>
    </div>
  );
}
