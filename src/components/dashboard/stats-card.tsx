"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "default" | "yellow" | "green";
  href?: string;
}

export function StatsCard({ title, value, icon: Icon, color = "default", href = "#" }: StatsCardProps) {
  const colorClasses = {
    default: "bg-card",
    yellow: "bg-yellow-400/10 dark:bg-yellow-900/40",
    green: "bg-green-400/10 dark:bg-green-900/40",
  }

  const iconColorClasses = {
    default: "text-foreground",
    yellow: "text-yellow-500 dark:text-yellow-300",
    green: "text-green-500 dark:text-green-300",
  }

  return (
    <Link href={href} className="flex">
    <Card className={cn("rounded-2xl shadow-none border-none h-full w-full transition-all hover:scale-[1.02] hover:shadow-lg", colorClasses[color])}>
      <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
        <div className="p-3 rounded-full bg-background/30 mb-3">
            <Icon className={cn("h-6 w-6 text-muted-foreground", iconColorClasses[color])} />
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
    </Link>
  );
}
