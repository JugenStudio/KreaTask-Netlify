
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
import { tasks, users } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const task = useMemo(() => tasks.find((t) => t.id === id), [id]);
  
  const currentUser = users[0]; // Assume logged in user
  const { t } = useLanguage();

  if (!task) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
      <div className="md:col-span-2">
        <TaskDetails task={task} />
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
  );
}
