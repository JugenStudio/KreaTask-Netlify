
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, HardDriveDownload, Search, X, Trash2, Folder, CheckCircle } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTaskData } from "@/hooks/use-task-data";
import { useCurrentUser } from "@/app/(app)/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";

const initialDownloadHistory = [
    { id: 1, fileName: "Banner_Draft_v1.png", taskName: "Desain Banner Promosi", date: new Date().toISOString(), size: "1.2 MB", status: "Completed", progress: 100 },
    { id: 2, fileName: "Brand_Guidelines.pdf", taskName: "Desain Banner Promosi", date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), size: "850 KB", status: "Completed", progress: 100 },
    { id: 3, fileName: "Script_Final_v2.docx", taskName: "Produksi Video Presentasi", date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), size: "128 KB", status: "Completed", progress: 100 },
    { id: 4, fileName: "Campaign_Concept_B.jpg", taskName: "Desain visual kampanye", date: new Date().toISOString(), size: "2.8 MB", status: "Completed", progress: 100 },
    { id: 5, fileName: "Annual_Report_Q3.pdf", taskName: "Laporan Keuangan Kuartal 3", date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), size: "5.4 MB", status: "Failed", progress: 0 },
];

type DownloadItem = typeof initialDownloadHistory[0];

const groupDownloadsByDate = (downloads: DownloadItem[], locale: 'en' | 'id') => {
  return downloads.reduce((acc, download) => {
    const downloadDate = new Date(download.date);
    let groupTitle: string;

    if (isToday(downloadDate)) {
      groupTitle = locale === 'id' ? "Hari Ini" : "Today";
    } else if (isYesterday(downloadDate)) {
      groupTitle = locale === 'id' ? "Kemarin" : "Yesterday";
    } else {
      groupTitle = format(downloadDate, "d MMMM yyyy", { locale: locale === 'id' ? id : undefined });
    }

    if (!acc[groupTitle]) {
      acc[groupTitle] = [];
    }
    acc[groupTitle].push(download);
    return acc;
  }, {} as Record<string, DownloadItem[]>);
};


export default function DownloadsPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const { addNotification } = useTaskData();
  const { currentUser } = useCurrentUser();
  const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>(initialDownloadHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const prevDownloadHistoryRef = useRef<DownloadItem[]>(downloadHistory);

  useEffect(() => {
    const simulationTimeout = setTimeout(() => {
      const itemToDownload = downloadHistory.find(item => item.id === 4);
      if (itemToDownload && itemToDownload.status === 'Completed') {
        setDownloadHistory(prev =>
          prev.map(item => item.id === 4 ? { ...item, status: 'In Progress', progress: 0 } : item)
        );
      }
    }, 1000);

    return () => clearTimeout(simulationTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const itemInProgress = downloadHistory.find(item => item.status === "In Progress");

    if (itemInProgress) {
        const interval = setInterval(() => {
            setDownloadHistory(prevHistory => {
                let isDone = false;
                const updatedHistory = prevHistory.map(item => {
                    if (item.id === itemInProgress.id) {
                        const newProgress = Math.min(item.progress + 20, 100);
                        if (newProgress >= 100) {
                           isDone = true;
                           return { ...item, status: "Completed" as const, progress: 100 };
                        }
                        return { ...item, progress: newProgress };
                    }
                    return item;
                });
                if (isDone) {
                    clearInterval(interval);
                }
                return updatedHistory;
            });
        }, 500);

        return () => clearInterval(interval);
    }
  }, [downloadHistory]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Check for newly completed downloads
    const newlyCompleted = downloadHistory.filter(current => {
        const previous = prevDownloadHistoryRef.current.find(p => p.id === current.id);
        return current.status === 'Completed' && previous?.status !== 'Completed';
    });

    newlyCompleted.forEach(item => {
        toast({
            title: t('downloads.toast.completed_title'),
            description: t('downloads.toast.completed_desc', { fileName: item.fileName }),
        });
        addNotification({
            id: `notif-download-${Date.now()}-${item.id}`,
            userId: currentUser.id,
            message: t('downloads.toast.completed_desc', { fileName: item.fileName }),
            type: 'SYSTEM_UPDATE',
            read: false,
            createdAt: new Date().toISOString(),
        });
    });

    // Update the ref for the next render
    prevDownloadHistoryRef.current = downloadHistory;

  }, [downloadHistory, currentUser, t, toast, addNotification]);


  const filteredDownloads = useMemo(() => {
    return downloadHistory.filter(item =>
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [downloadHistory, searchTerm]);
  
  const groupedDownloads = useMemo(() => groupDownloadsByDate(filteredDownloads, locale), [filteredDownloads, locale]);
  
  const clearHistory = () => {
    setDownloadHistory([]);
    toast({
        title: t('downloads.toast.cleared_title'),
        description: t('downloads.toast.cleared_desc'),
    });
  }

  if (!currentUser) {
    return (
        <div className="space-y-6 md:space-y-8">
             <div>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
             </div>
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
             </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
            <HardDriveDownload className="h-6 w-6 md:h-8 md:w-8" />
            {t('downloads.title')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('downloads.description')}
          </p>
        </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder={t('downloads.search_placeholder')}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="ghost" onClick={clearHistory} disabled={downloadHistory.length === 0} className="transition-all active:scale-95">{t('downloads.clear_all')}</Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.keys(groupedDownloads).length > 0 ? (
          Object.entries(groupedDownloads).map(([date, downloads]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">{date}</h2>
              <div className="space-y-3">
                {downloads.map((item) => (
                  <Card key={item.id} className="bg-secondary/40 border-border/60 hover:bg-muted/40 transition-colors">
                    <CardContent className="p-3 flex items-center gap-4">
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                           <p className="font-medium truncate">{item.fileName}</p>
                           {item.status === 'In Progress' ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress value={item.progress} className="h-1 flex-1" />
                                    <span className="text-xs text-muted-foreground">{item.progress}%</span>
                                </div>
                           ) : (
                                <p className="text-xs text-muted-foreground">{item.size}</p>
                           )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            {item.status === 'Completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {item.status === 'Failed' && <X className="h-5 w-5 text-destructive" />}
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-all active:scale-95"><Folder className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-all active:scale-95"><Trash2 className="h-4 w-4 hover:text-destructive"/></Button>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
            <div className="text-center p-16 bg-secondary/40 rounded-xl">
                <p className="font-semibold">{t('downloads.no_history')}</p>
                <p className="text-sm text-muted-foreground">{t('downloads.no_history_desc')}</p>
            </div>
        )}
      </div>
    </div>
  );
}
