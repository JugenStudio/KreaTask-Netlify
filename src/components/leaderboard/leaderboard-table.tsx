
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
import { Crown, Medal } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
};

export function LeaderboardTable({
  leaderboardData,
}: {
  leaderboardData: LeaderboardEntry[];
}) {
  const { t } = useLanguage();
  return (
    <TooltipProvider>
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
              <TableCell>
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
                      <div className="text-sm text-muted-foreground">{entry.role}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-semibold text-card-foreground">{entry.tasksCompleted}</TableCell>
              <TableCell className="text-right font-bold text-lg text-card-foreground">
                {entry.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
