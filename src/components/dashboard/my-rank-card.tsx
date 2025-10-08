
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/lib/types";
import { Trophy } from "lucide-react";

export function MyRankCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Card className="h-full bg-secondary">
      <CardHeader>
        <CardTitle className="font-headline text-card-foreground">My Current Rank</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="h-28 w-28 border-4 border-background/50">
            <AvatarImage src={entry.avatarUrl} alt={entry.name} />
            <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary p-2 px-4 rounded-full text-primary-foreground font-bold text-lg border-4 border-secondary">
            #{entry.rank}
          </div>
        </div>
        <h3 className="text-xl font-bold text-card-foreground">{entry.name}</h3>
        <p className="text-muted-foreground mb-4">Score: {entry.score}</p>
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 font-semibold border-none">
          {entry.tasksCompleted} Tasks Completed
        </Badge>
        <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
          View My Report
        </Button>
      </CardContent>
    </Card>
  );
}
