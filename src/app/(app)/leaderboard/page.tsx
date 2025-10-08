"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Download } from "lucide-react";
import { leaderboardData, detailedReportData } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { DetailedReportDialog } from "@/components/leaderboard/detailed-report-dialog";
import { useLanguage } from "@/providers/language-provider";

export default function LeaderboardPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-400" />
          {t('leaderboard.title')}
        </h1>
        <p className="text-muted-foreground">{t('leaderboard.description')}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-center">{t('leaderboard.top_performers')}</CardTitle>
            <CardDescription className="text-center">{t('leaderboard.top_performers_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardTable leaderboardData={leaderboardData} />
          </CardContent>
        </Card>
        <div className="flex justify-center mt-6">
          <Button size="lg" onClick={() => setIsReportOpen(true)}>
            <Download className="mr-2 h-5 w-5" />
            {t('leaderboard.view_report_button')}
          </Button>
        </div>
      </div>
      
      <DetailedReportDialog 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)}
        reportData={detailedReportData}
      />
    </div>
  );
}
