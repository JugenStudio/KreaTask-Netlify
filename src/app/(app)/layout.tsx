
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import type { User, Task, LeaderboardEntry, Notification } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/providers/language-provider";
import Aurora from '@/components/Aurora';
import { BottomNav } from "@/components/bottom-nav";
import { initialData } from '@/lib/data';
import { TaskDataContext, type TaskDataContextType } from "@/hooks/use-task-data";
import { useSpotlightEffect } from "@/hooks/use-spotlight";

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

type DownloadItem = {
  id: number;
  fileName: string;
  taskName: string;
  date: string;
  size: string;
  url: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  progress: number;
};

const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
    if (!tasks || !users) return [];
    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: any; } } = {};

    users.forEach(user => {
      userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role };
    });

    tasks.forEach(task => {
      if (task.status === 'Completed') {
        task.assignees.forEach(assignee => {
          if (assignee && userScores[assignee.id]) {
            userScores[assignee.id].score += task.value;
            userScores[assignee.id].tasksCompleted += 1;
          }
        });
      }
    });

    const sortedUsers = Object.entries(userScores).sort(([, a], [, b]) => b.score - a.score);

    return sortedUsers.map(([id, data], index) => ({
      id,
      rank: index + 1,
      name: data.name,
      score: data.score,
      tasksCompleted: data.tasksCompleted,
      avatarUrl: data.avatarUrl,
      role: data.role,
    }));
};


const TaskDataProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [downloadHistory, setDownloadHistoryState] = useState<DownloadItem[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [userForDownloads, setUserForDownloads] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setUserForDownloads(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from session storage", e);
            }
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        try {
            const storedTasks = localStorage.getItem('kreatask_tasks');
            const storedUsers = localStorage.getItem('kreatask_users');
            const storedNotifications = localStorage.getItem('kreatask_notifications');
            
            const tasks = storedTasks ? JSON.parse(storedTasks) : initialData.allTasks;
            const users = storedUsers ? JSON.parse(storedUsers) : initialData.users;

            setAllTasks(tasks);
            setUsers(users);
            setNotifications(storedNotifications ? JSON.parse(storedNotifications) : initialData.mockNotifications);
            setLeaderboardData(calculateLeaderboard(tasks, users));
            
            if (userForDownloads?.id) {
               const storedDownloads = localStorage.getItem(`kreatask_downloads_${userForDownloads.id}`);
               setDownloadHistoryState(storedDownloads ? JSON.parse(storedDownloads) : []);
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setAllTasks(initialData.allTasks);
            setUsers(initialData.users);
            setNotifications(initialData.mockNotifications);
            setLeaderboardData(calculateLeaderboard(initialData.allTasks, initialData.users));
        } finally {
            setIsLoading(false);
        }
    }, [userForDownloads?.id]);

    const updateLocalStorage = (key: string, data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Failed to update localStorage for key: ${key}`, error);
        }
    };

    const handleSetTasks = (newTasks: Task[]) => {
        setAllTasks(newTasks);
        setLeaderboardData(calculateLeaderboard(newTasks, users));
        updateLocalStorage('kreatask_tasks', newTasks);
    };

    const handleSetUsers = (newUsers: User[]) => {
        setUsers(newUsers);
        setLeaderboardData(calculateLeaderboard(allTasks, newUsers));
        updateLocalStorage('kreatask_users', newUsers);
    };

    const handleSetNotifications = (newNotifications: Notification[]) => {
        setNotifications(newNotifications);
        updateLocalStorage('kreatask_notifications', newNotifications);
    };

    const setDownloadHistory = useCallback((newHistory: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => {
      if (userForDownloads?.id) {
          setDownloadHistoryState(prevState => {
              const updatedState = typeof newHistory === 'function' ? newHistory(prevState) : newHistory;
              updateLocalStorage(`kreatask_downloads_${userForDownloads.id}`, updatedState);
              return updatedState;
          });
      }
    }, [userForDownloads?.id]);

    const addTask = (newTask: Task) => {
        handleSetTasks([...allTasks, newTask]);
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        const updatedTasks = allTasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        );
        handleSetTasks(updatedTasks);
    };

    const deleteTask = (taskId: string) => {
        const updatedTasks = allTasks.filter(task => task.id !== taskId);
        handleSetTasks(updatedTasks);
    };

    const addNotification = useCallback((newNotification: Notification) => {
        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            updateLocalStorage('kreatask_notifications', updated);
            return updated;
        });
    }, []);

    const addToDownloadHistory = useCallback((file: { name: string; size: string, url: string }, taskName: string, isRedownload = false) => {
      if (!userForDownloads) return;

      const newDownloadItem: DownloadItem = {
        id: Date.now(),
        fileName: file.name,
        taskName: taskName,
        date: new Date().toISOString(),
        size: file.size,
        url: file.url,
        status: 'In Progress',
        progress: 0,
      };
      
      setDownloadHistory(prevHistory => {
        const existingItemIndex = prevHistory.findIndex(item => item.fileName === file.name && item.taskName === taskName);
        if (isRedownload && existingItemIndex > -1) {
            const updatedHistory = [...prevHistory];
            updatedHistory[existingItemIndex] = newDownloadItem;
            return updatedHistory;
        }
        return [newDownloadItem, ...prevHistory];
      });

    }, [userForDownloads, setDownloadHistory]);

    const value: TaskDataContextType = {
        isLoading,
        allTasks,
        users,
        leaderboardData,
        notifications,
        downloadHistory,
        setUsers: handleSetUsers,
        setAllTasks: handleSetTasks,
        setNotifications: handleSetNotifications,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        addToDownloadHistory,
    };

    return <TaskDataContext.Provider value={value}>{children}</TaskDataContext.Provider>;
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
  } = useContext(TaskDataContext)!;
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Apply spotlight effect globally
  useSpotlightEffect();


  // Background task for download progress
  useEffect(() => {
    const itemInProgress = downloadHistory.find(item => item.status === "In Progress");

    if (itemInProgress) {
        const intervalId = `download-interval-${itemInProgress.id}`;
        if (window[intervalId as any]) {
            return;
        }

        const interval = setInterval(() => {
            setDownloadHistory(prevHistory => {
                const currentItem = prevHistory.find(d => d.id === itemInProgress.id);
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
            link: '/downloads',
            createdAt: new Date().toISOString(),
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
           <div className="fixed top-0 left-0 w-full h-full z-[-1] opacity-30">
            <Aurora
              colorStops={["#172554", "#166534", "#172554"]}
              blend={1}
              amplitude={0.2}
              speed={0.2}
            />
           </div>
          <div className="flex min-h-screen w-full">
            {!isMobile && currentUser && <AppSidebar user={currentUser} />}
            <div className="flex flex-1 flex-col bg-transparent">
              {currentUser && <Header />}
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
                {children}
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
      <TaskDataProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </TaskDataProvider>
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

    