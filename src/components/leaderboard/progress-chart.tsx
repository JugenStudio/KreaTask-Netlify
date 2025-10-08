"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

const chartData = [
  { month: "May", lessons: 23, fill: "hsl(var(--primary))" },
  { month: "June", lessons: 44, fill: "hsl(var(--primary))" },
  { month: "July", lessons: 14, fill: "hsl(var(--primary))" },
]

const chartConfig = {
  lessons: {
    label: "Lessons",
  },
}

export function ProgressChart() {
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
            tickFormatter={(value) => value.slice(0, 3)}
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
