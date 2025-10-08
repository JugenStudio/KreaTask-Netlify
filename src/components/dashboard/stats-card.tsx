import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "default" | "yellow" | "green";
}

export function StatsCard({ title, value, icon: Icon, color = "default" }: StatsCardProps) {
  const colorClasses = {
    default: "bg-secondary",
    yellow: "bg-yellow-100 dark:bg-yellow-900/50",
    green: "bg-green-100 dark:bg-green-900/50",
  }

  const arrowColorClasses = {
    default: "text-secondary-foreground",
    yellow: "text-yellow-600",
    green: "text-green-600",
  }

  return (
    <Card className={cn("rounded-2xl shadow-none border-none", colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
            <div className="p-3 rounded-full bg-card/50">
                <Icon className={cn("h-6 w-6", arrowColorClasses[color])} />
            </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            <div className={cn("p-2 rounded-full bg-card/50 cursor-pointer", arrowColorClasses[color])}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
