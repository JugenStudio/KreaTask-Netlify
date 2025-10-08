import { TaskTable } from "@/components/dashboard/task-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasks } from "@/lib/data";
import { Filter } from "lucide-react";

export default function AllTasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">All Tasks</h1>
          <p className="text-muted-foreground">
            Browse and manage all tasks across the team.
          </p>
        </div>
        <div className="flex gap-2 items-center">
            <Input placeholder="Filter tasks..." className="w-48" />
            <Select>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="todo">To-do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TaskTable tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}
