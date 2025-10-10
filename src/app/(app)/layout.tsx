
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { useTaskData } from "@/hooks/use-task-data";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/bottom-nav";
import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/providers/language-provider";

// Helper functions to manage notified downloads in localStorage
const getNotifiedDownloads = (userId: string): Set<number> => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(`kreatask_notified_downloads_${userId}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
};

const addNotifiedDownload = (downloadId: number, userId: string) => {
    const notified = getNotifiedDownloads(userId);
    notified.add(downloadId);
    localStorage.setItem(`kreatask_notified_downloads_${userId}`, JSON.stringify(Array.from(notified)));
};

// 1. Create the context
const UserContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const { 
    users, 
    isLoading: isTaskDataLoading, 
    downloadHistory, 
    setDownloadHistory, 
    addNotification 
  } = useTaskData();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Background task for download progress
  useEffect(() => {
    const itemInProgress = downloadHistory.find(item => item.status === "In Progress");

    if (itemInProgress) {
        const intervalId = `download-interval-${itemInProgress.id}`;
        // Prevent multiple intervals for the same download
        if (window[intervalId as any]) {
            return;
        }

        const interval = setInterval(() => {
            setDownloadHistory(prevHistory => {
                const currentItem = prevHistory.find(d => d.id === itemInProgress.id);
                // Stop if item is gone or status changed
                if (!currentItem || currentItem.status !== 'In Progress') {
                    clearInterval(interval);
                    delete window[intervalId as any];
                    return prevHistory;
                }

                return prevHistory.map(item => {
                    if (item.id === itemInProgress.id) {
                        const newProgress = Math.min(item.progress + 20, 100);
                        if (newProgress >= 100) {
                           clearInterval(interval);
                           delete window[intervalId as any];
                           return { ...item, status: "Completed" as const, progress: 100 };
                        }
                        return { ...item, progress: newProgress };
                    }
                    return item;
                });
            });
        }, 500);

        (window as any)[intervalId] = interval;

        return () => {
            clearInterval(interval);
            delete window[intervalId as any];
        };
    }
  }, [downloadHistory, setDownloadHistory]);

  const createDownloadNotification = useCallback((item: any) => { // Use 'any' for item to avoid type issues in this scope
    if (!currentUser) return;

    const notifiedDownloads = getNotifiedDownloads(currentUser.id);

    if (!notifiedDownloads.has(item.id)) {
        toast({
            title: t('downloads.toast.completed_title'),
            description: t('downloads.toast.completed_desc', { fileName: item.fileName }),
            duration: 5000,
        });

        addNotification({
            id: `notif-download-${currentUser.id}-${item.id}`,
            userId: currentUser.id,
            message: t('downloads.toast.completed_desc', { fileName: item.fileName }),
            type: 'SYSTEM_UPDATE',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/downloads'
        });
        
        addNotifiedDownload(item.id, currentUser.id);
    }
  }, [addNotification, currentUser, t, toast]);
  
  // Background task to create notifications for newly completed downloads
  useEffect(() => {
    if (!currentUser) return;
    
    const notifiedDownloads = getNotifiedDownloads(currentUser.id);
    const newlyCompleted = downloadHistory.filter(
      item => item.status === 'Completed' && !notifiedDownloads.has(item.id)
    );

    newlyCompleted.forEach(item => {
      createDownloadNotification(item);
    });
  }, [downloadHistory, currentUser, createDownloadNotification]);


  useEffect(() => {
    // Only run this logic once the user data from useTaskData is loaded
    if (isTaskDataLoading) return;

    let userToSet: User | null = null;
    // sessionStorage is used for session-specific info like the currently simulated user
    const storedUser = sessionStorage.getItem('currentUser');
    
    if (storedUser) {
        try {
            // Validate that the user from sessionStorage still exists in our main user list
            const parsedUser: User = JSON.parse(storedUser);
            if (users.find(u => u.id === parsedUser.id)) {
                 userToSet = parsedUser;
            } else {
                 sessionStorage.removeItem('currentUser'); // Clear invalid user
            }
        } catch (e) {
            console.error("Failed to parse currentUser from sessionStorage", e);
            sessionStorage.removeItem('currentUser');
        }
    } 
    
    if (!userToSet) {
        const selectedRole = sessionStorage.getItem('selectedRole') as UserRole | null;
        if (selectedRole) {
            userToSet = users.find(u => u.role === selectedRole) || null;
            if (!userToSet && users.length > 0) {
              // Fallback to the first user if the role isn't found for some reason
              userToSet = users[0];
            }
        } else if (users.length > 0) {
            // Default to the first user if no role is selected (initial load)
            userToSet = users[0]; 
        }

        if (userToSet) {
          sessionStorage.setItem('currentUser', JSON.stringify(userToSet));
        }
    }

    if (userToSet) {
        setCurrentUser(userToSet);
    }
    setIsUserLoading(false);
  }, [isTaskDataLoading, users]);

  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }
  
  const isLoading = isUserLoading || isTaskDataLoading;

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full bg-background">
           {!isMobile && (
             <div className="w-64 flex-col border-r border-border bg-card p-4">
                <Skeleton className="h-10 w-3/4 mb-12" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
             </div>
           )}
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
                <div className="flex-1">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <Skeleton className="h-[500px] w-full" />
            </main>
          </div>
        </div>
    )
  }

  return (
      <UserContext.Provider value={{ currentUser }}>
        <div className={cn("min-h-screen w-full bg-background")}>
          <div className="flex min-h-screen w-full">
            {!isMobile && currentUser && <AppSidebar user={currentUser} />}
            <div className="flex flex-1 flex-col bg-transparent">
              {currentUser && <Header />}
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
          {isMobile && currentUser && <BottomNav />}
        </div>
      </UserContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }
  
  return (
    <LanguageProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </LanguageProvider>
  );
}

// 2. Create a custom hook to use the context
export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a AppLayout');
  }
  // This hook now also provides the language context implicitly via LanguageProvider wrapping it
  const langContext = useLanguage();
  if (langContext === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
