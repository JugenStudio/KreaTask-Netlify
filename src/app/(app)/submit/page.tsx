import { TaskForm } from "@/components/submit/task-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Submit a New Task</h1>
        <p className="text-muted-foreground">Fill out the details below to create a new task.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
