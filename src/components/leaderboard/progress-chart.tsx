
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { Task, User } from "@/lib/types"
import { isEmployee } from "@/lib/roles"
import { format } from "date-fns"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton"

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

interface ProgressChartProps {
    currentUser?: User | null;
    allTasks: Task[];
}

export function ProgressChart({ currentUser, allTasks }: ProgressChartProps) {
  const chartData = React.useMemo(() => {
    if (!currentUser) return [];

    const tasksToConsider = isEmployee(currentUser.role)
      ? allTasks.filter(task => task.assignees.some(a => a.id === currentUser.id))
      : allTasks;
      
    const completedTasks = tasksToConsider.filter(task => task.status === 'Completed' && task.approvedBy);

    const tasksByMonth: { [key: string]: number } = {};

    completedTasks.forEach(task => {
        // Assuming dueDate is the completion date for simplicity
        const month = format(new Date(task.dueDate), "MMM");
        tasksByMonth[month] = (tasksByMonth[month] || 0) + 1;
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create data for the last 6 months, even if there are no tasks
    const recentMonths = monthOrder.slice(-6);
    
    return recentMonths.map(month => ({
        month,
        tasks: tasksByMonth[month] || 0,
    }));

  }, [currentUser, allTasks]);


  if (!currentUser) {
    return <Skeleton className="h-[200px] w-full" />
  }

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart 
            accessibilityLayer 
            data={chartData}
            margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
            }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis hide={true} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[16, 16, 16, 16]} />
        </BarChart>
      </ChartContainer>
  )
}
