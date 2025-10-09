
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/lib/types";
import { Crown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";

export function TopPerformerCard({ performer }: { performer: LeaderboardEntry }) {
  const { t } = useLanguage();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-card-foreground">Top Performer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="h-28 w-28 border-4 border-background/50">
            <AvatarImage src={performer.avatarUrl} alt={performer.name} />
            <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full transform rotate-12">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-card-foreground">{performer.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{t(`roles.${performer.role}` as any, { defaultValue: performer.role })}</p>
        <p className="text-sm text-muted-foreground mb-2">Score: {performer.score}</p>
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4 font-semibold border-none">
          {performer.tasksCompleted} Tasks Completed
        </Badge>
      </CardContent>
    </Card>
  );
}
