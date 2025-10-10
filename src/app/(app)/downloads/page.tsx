
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, HardDriveDownload } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTaskData } from "@/hooks/use-task-data";

// Mock data for download history with progress
const initialDownloadHistory = [
    { id: 1, fileName: "Banner_Draft_v1.png", taskName: "Desain Banner Promosi", date: "2024-09-22", size: "1.2 MB", status: "Completed", progress: 100 },
    { id: 2, fileName: "Brand_Guidelines.pdf", taskName: "Desain Banner Promosi", date: "2024-09-22", size: "850 KB", status: "Completed", progress: 100 },
    { id: 3, fileName: "Script_Final_v2.docx", taskName: "Produksi Video Presentasi", date: "2024-09-21", size: "128 KB", status: "Completed", progress: 100 },
    { id: 4, fileName: "Campaign_Concept_B.jpg", taskName: "Desain visual kampanye", date: "2024-09-20", size: "2.8 MB", status: "In Progress", progress: 0 },
    { id: 5, fileName: "Annual_Report_Q3.pdf", taskName: "Laporan Keuangan Kuartal 3", date: "2024-09-19", size: "5.4 MB", status: "Failed", progress: 0 },
];

type DownloadItem = typeof initialDownloadHistory[0];

export default function DownloadsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addNotification } = useTaskData();
  const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>(initialDownloadHistory);

  useEffect(() => {
    const itemInProgress = downloadHistory.find(item => item.status === "In Progress");

    if (itemInProgress) {
        const interval = setInterval(() => {
            setDownloadHistory(prevHistory => {
                return prevHistory.map(item => {
                    if (item.id === itemInProgress.id) {
                        const newProgress = Math.min(item.progress + 20, 100);
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            toast({
                                title: t('downloads.toast.completed_title'),
                                description: t('downloads.toast.completed_desc', { fileName: item.fileName }),
                            });
                             addNotification({
                                id: `notif-download-${Date.now()}`,
                                userId: 'user-1', // Assuming a logged-in user
                                message: t('downloads.toast.completed_desc', { fileName: item.fileName }),
                                type: 'SYSTEM_UPDATE',
                                read: false,
                                createdAt: new Date().toISOString(),
                            });
                            return { ...item, status: "Completed" as const, progress: 100 };
                        }
                        return { ...item, progress: newProgress };
                    }
                    return item;
                });
            });
        }, 500);

        return () => clearInterval(interval);
    }
  }, [downloadHistory, t, toast, addNotification]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
          <HardDriveDownload className="h-6 w-6 md:h-8 md:w-8" />
          {t('downloads.title')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {t('downloads.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl md:text-2xl">{t('downloads.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">{t('downloads.table.fileName')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('downloads.table.task')}</TableHead>
                  <TableHead className="text-right">{t('downloads.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloadHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="truncate">{item.fileName}</p>
                          {item.status === 'In Progress' && (
                            <Progress value={item.progress} className="h-1.5 mt-1" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{item.taskName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={
                        item.status === 'Completed' ? 'default' 
                        : item.status === 'In Progress' ? 'secondary' 
                        : 'destructive'
                      } className={item.status === 'Completed' ? 'bg-green-500/80' : ''}>
                        {t(`downloads.status.${item.status.toLowerCase().replace(' ', '_')}` as any)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {downloadHistory.length === 0 && (
             <div className="text-center p-10">
                <p className="text-muted-foreground">{t('downloads.no_history')}</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
