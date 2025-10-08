
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
  href?: string;
}

export function StatsCard({ title, value, icon: Icon, href = "#" }: StatsCardProps) {

  return (
    <Link href={href} className="flex">
    <Card className={cn("rounded-2xl shadow-none border-border h-full w-full transition-all hover:scale-[1.02] hover:shadow-lg bg-card")}>
      <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
        <div className="p-3 rounded-full bg-secondary mb-3">
            <Icon className={cn("h-6 w-6 text-primary")} />
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
    </Link>
  );
}
