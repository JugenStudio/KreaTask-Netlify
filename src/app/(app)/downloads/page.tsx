
"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, HardDriveDownload, Search, X, Trash2, Folder, CheckCircle, ArrowLeft } from "lucide-react";
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
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


type DownloadItem = {
  id: number;
  fileName: string;
  taskName: string;
  date: string;
  size: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  progress: number;
};

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
  const { downloadHistory, setDownloadHistory, addToDownloadHistory } = useTaskData();
  const { currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<DownloadItem | null>(null);

  const filteredDownloads = useMemo(() => {
    if (!downloadHistory) return [];
    return downloadHistory.filter(item =>
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [downloadHistory, searchTerm]);
  
  const groupedDownloads = useMemo(() => groupDownloadsByDate(filteredDownloads, locale), [filteredDownloads, locale]);
  
  const clearHistory = () => {
    if(!currentUser) return;
    setDownloadHistory([]);
    localStorage.removeItem(`kreatask_notified_downloads_${currentUser.id}`);
    toast({
        title: t('downloads.toast.cleared_title'),
        description: t('downloads.toast.cleared_desc'),
        duration: 5000,
    });
  }

  const handleDeleteItem = () => {
    if (itemToDelete) {
        setDownloadHistory(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast({
            title: t('downloads.toast.item_deleted_title'),
            description: t('downloads.toast.item_deleted_desc', { fileName: itemToDelete.fileName }),
            variant: "destructive"
        });
        setItemToDelete(null);
    }
  };
  
  const handleRedownload = (item: DownloadItem) => {
    const isDownloading = downloadHistory.some(d => d.status === 'In Progress');
    if (isDownloading) {
        toast({
            title: "Download in Progress",
            description: "Please wait for the current download to finish before starting a new one.",
            variant: "destructive",
            duration: 3000
        });
        return;
    }
    // Re-trigger the download process by adding it to history again
    // The layout effect will pick it up and start the progress.
    addToDownloadHistory({ name: item.fileName, size: item.size, url: '' }, item.taskName, true);

    // Also trigger actual download if a URL exists. 
    // This is a dummy implementation for now.
    const link = document.createElement('a');
    link.href = '#'; // In a real app, this would be item.url
    link.setAttribute('download', item.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Redownloading...",
      description: `Starting download for "${item.fileName}".`
    })
  };


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
    <>
    <div className="space-y-6 md:space-y-8">
       <Button variant="outline" size="sm" asChild className="mb-4 w-fit transition-all active:scale-95">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back_to_home')}
        </Link>
      </Button>
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
            <Button variant="ghost" onClick={clearHistory} disabled={!downloadHistory || downloadHistory.length === 0} className="transition-all active:scale-95">{t('downloads.clear_all')}</Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.keys(groupedDownloads).length > 0 ? (
          Object.entries(groupedDownloads).map(([date, downloads]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">{date}</h2>
              <div className="space-y-3">
                {downloads.map((item) => (
                  <Card 
                    key={item.id} 
                    className="bg-secondary/40 border-border/60 hover:bg-muted/40 transition-colors"
                  >
                    <CardContent className="p-3 flex items-center gap-4">
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 overflow-hidden" onClick={() => handleRedownload(item)}>
                           <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium truncate cursor-pointer">{item.fileName}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.fileName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                           {item.status === 'In Progress' ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress value={item.progress} className="h-1 flex-1" />
                                    <span className="text-xs text-muted-foreground">{item.progress}%</span>
                                </div>
                           ) : item.status === 'Failed' ? (
                                <p className="text-xs text-destructive">{t(`downloads.status.failed`)}</p>
                           ) : (
                                <p className="text-xs text-muted-foreground">{item.size}</p>
                           )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                            {item.status === 'Completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {item.status === 'Failed' && <X className="h-5 w-5 text-destructive" />}
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-all active:scale-95" onClick={() => handleRedownload(item)}><Download className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 transition-all active:scale-95" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4 hover:text-destructive"/></Button>
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
     {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('downloads.delete_dialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('downloads.delete_dialog.description', { fileName: itemToDelete.fileName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('downloads.delete_dialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">
                {t('downloads.delete_dialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
