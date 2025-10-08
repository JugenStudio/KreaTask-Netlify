"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { User } from "@/lib/types"
import { isEmployee } from "@/lib/roles"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const allMonthsData = {
    May: { lessons: 23 },
    June: { lessons: 44 },
    July: { lessons: 14 },
    August: { lessons: 38 },
    September: { lessons: 25 },
};

const employeeMonthsData = {
    May: { lessons: 5 },
    June: { lessons: 12 },
    July: { lessons: 3 },
    August: { lessons: 8 },
    September: { lessons: 6 },
};

const chartConfig = {
  lessons: {
    label: "Tasks",
  },
}

export function ProgressChart({ currentUser }: { currentUser: User }) {
  const dataToShow = isEmployee(currentUser.role) ? employeeMonthsData : allMonthsData;
  const chartData = Object.entries(dataToShow).map(([month, values]) => ({
      month: month.slice(0, 3),
      ...values,
      fill: "hsl(var(--primary))"
  }));

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
          />
          <YAxis hide={true} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="lessons" radius={[16, 16, 16, 16]} />
        </BarChart>
      </ChartContainer>
  )
}
