"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardEntry } from "@/lib/types";
import { Crown, Medal, ArrowUpCircle } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Crown className="h-6 w-6 text-yellow-500" />;
  }
  if (rank === 2) {
    return <Medal className="h-6 w-6 text-slate-400" />;
  }
  if (rank === 3) {
    return <Medal className="h-6 w-6 text-amber-600" />;
  }
  return <span className="w-6 text-center text-muted-foreground">{rank}</span>;
};

export function LeaderboardTable({
  leaderboardData,
}: {
  leaderboardData: LeaderboardEntry[];
}) {
  const { t } = useLanguage();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16 text-center">{t('leaderboard.table.rank')}</TableHead>
          <TableHead>{t('leaderboard.table.employee')}</TableHead>
          <TableHead className="text-center">{t('leaderboard.table.tasks_completed')}</TableHead>
          <TableHead className="text-right">{t('leaderboard.table.total_score')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardData.map((entry) => (
          <TableRow key={entry.id} className="border-none">
            <TableCell className="font-bold">
              <div className="flex items-center justify-center h-full">
                <RankIcon rank={entry.rank} />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                  <AvatarFallback>{entry.name ? entry.name.slice(0, 2) : '??'}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-bold text-card-foreground">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">Score: {entry.score}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center font-medium text-muted-foreground">{entry.tasksCompleted}</TableCell>
            <TableCell className="text-right">
                <div className={cn(
                    "flex items-center justify-end gap-1 font-semibold",
                    entry.rank < 4 ? "text-green-500" : "text-red-500"
                )}>
                    <ArrowUpCircle className={cn(entry.rank >= 4 && "rotate-180")} />
                    <span>{entry.score / 10} %</span>
                </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
