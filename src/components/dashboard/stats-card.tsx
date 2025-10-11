
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const colorVariants = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  yellow: "bg-yellow-500/10 text-yellow-500",
  purple: "bg-purple-500/10 text-purple-500",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative";
  href?: string;
  color?: keyof typeof colorVariants;
}

export function StatsCard({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = "positive", 
    href = "#",
    color = "blue"
}: StatsCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-400' : 'text-red-400';

  return (
    <Link href={href} className="flex group">
      <Card className="card-spotlight rounded-xl md:rounded-2xl shadow-sm border-border/80 h-full w-full transition-all duration-300 bg-card/80 hover:border-primary/50">
        <CardContent className="p-4 md:p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", colorVariants[color])}>
                <Icon className="h-6 w-6" />
            </div>
          </div>
          <div>
            {change && (
                <p className={cn("text-xs md:text-sm font-semibold", changeColor)}>{change}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
