
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative";
  href?: string;
}

export function StatsCard({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = "positive", 
    href = "#" 
}: StatsCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-400' : 'text-red-400';

  return (
    <Link href={href} className="flex group">
      <Card className="rounded-xl md:rounded-2xl shadow-sm border-border/80 h-full w-full transition-all duration-300 bg-card/80 hover:border-primary/50 card-glow">
        <CardContent className="p-4 md:p-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{value}</p>
            {change && (
                <p className={cn("text-xs md:text-sm font-semibold", changeColor)}>{change}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
