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

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Crown className="h-6 w-6 text-yellow-400" />;
  }
  if (rank === 2) {
    return <Medal className="h-6 w-6 text-gray-400" />;
  }
  if (rank === 3) {
    return <Medal className="h-6 w-6 text-yellow-600" />;
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
          <TableHead className="w-16">{t('leaderboard.table.rank')}</TableHead>
          <TableHead>{t('leaderboard.table.employee')}</TableHead>
          <TableHead>{t('leaderboard.table.tasks_completed')}</TableHead>
          <TableHead className="text-right">{t('leaderboard.table.total_score')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardData.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-bold">
              <div className="flex items-center justify-center h-full">
                <RankIcon rank={entry.rank} />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                  <AvatarFallback>{entry.name ? entry.name.slice(0, 2) : '??'}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{entry.name}</div>
              </div>
            </TableCell>
            <TableCell>{entry.tasksCompleted}</TableCell>
            <TableCell className="text-right text-lg font-bold text-primary">
              {entry.score}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}