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
import { notFound } from "next/navigation";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id);
  const currentUser = users[0]; // Assume logged in user

  if (!task) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <TaskDetails task={task} />
      </div>
      <div className="md:col-span-1">
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="revisions">History</TabsTrigger>
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
