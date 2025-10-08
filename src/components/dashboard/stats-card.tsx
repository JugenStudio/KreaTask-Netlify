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
    default: "bg-secondary",
    yellow: "bg-yellow-900/40",
    green: "bg-green-900/40",
  }

  const iconColorClasses = {
    default: "text-foreground",
    yellow: "text-yellow-300",
    green: "text-green-300",
  }

  return (
    <Link href={href}>
    <Card className={cn("rounded-2xl shadow-none border-none h-full transition-all hover:scale-[1.02] hover:shadow-lg", colorClasses[color])}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-full bg-background/30">
                    <Icon className={cn("h-6 w-6", iconColorClasses[color])} />
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
        </div>
        <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            <div className={cn("p-2 rounded-full bg-background/30", iconColorClasses[color])}>
                <ArrowRight className="h-5 w-5" />
            </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
