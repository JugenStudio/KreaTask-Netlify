
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { initialData } from '@/lib/data';

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
    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: UserRole; } } = {};

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

interface TaskDataContextType {
    isLoading: boolean;
    allTasks: Task[];
    users: User[];
    leaderboardData: LeaderboardEntry[];
    notifications: Notification[];
    downloadHistory: DownloadItem[];
    setUsers: (users: User[]) => void;
    setAllTasks: (tasks: Task[]) => void;
    setNotifications: (notifications: Notification[]) => void;
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    addNotification: (notification: Notification) => void;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
}

const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export const TaskDataProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [allTasks, setAllTasks] = useState<Task[]>(initialData.allTasks);
    const [users, setUsers] = useState<User[]>(initialData.users);
    const [notifications, setNotifications] = useState<Notification[]>(initialData.mockNotifications);
    const [downloadHistory, setDownloadHistoryState] = useState<DownloadItem[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
      // Simulate fetching current user
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from session storage", e);
        }
      }
    }, []);


    useEffect(() => {
        setIsLoading(true);
        // Load data from localStorage or initialData
        try {
            const storedTasks = localStorage.getItem('kreatask_tasks');
            const storedUsers = localStorage.getItem('kreatask_users');
            const storedNotifications = localStorage.getItem('kreatask_notifications');
            
            setAllTasks(storedTasks ? JSON.parse(storedTasks) : initialData.allTasks);
            setUsers(storedUsers ? JSON.parse(storedUsers) : initialData.users);
            setNotifications(storedNotifications ? JSON.parse(storedNotifications) : initialData.mockNotifications);

            if (currentUser?.id) {
               const storedDownloads = localStorage.getItem(`kreatask_downloads_${currentUser.id}`);
               setDownloadHistoryState(storedDownloads ? JSON.parse(storedDownloads) : []);
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            // Fallback to initial data if parsing fails
            setAllTasks(initialData.allTasks);
            setUsers(initialData.users);
            setNotifications(initialData.mockNotifications);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        // Update leaderboard whenever tasks or users change
        const newLeaderboard = calculateLeaderboard(allTasks, users);
        setLeaderboardData(newLeaderboard);
    }, [allTasks, users]);

    const updateLocalStorage = (key: string, data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Failed to update localStorage for key: ${key}`, error);
        }
    };

    const handleSetTasks = (newTasks: Task[]) => {
        setAllTasks(newTasks);
        updateLocalStorage('kreatask_tasks', newTasks);
    };

    const handleSetUsers = (newUsers: User[]) => {
        setUsers(newUsers);
        updateLocalStorage('kreatask_users', newUsers);
    };

    const handleSetNotifications = (newNotifications: Notification[]) => {
        setNotifications(newNotifications);
        updateLocalStorage('kreatask_notifications', newNotifications);
    };

    const setDownloadHistory = useCallback((newHistory: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => {
      if (currentUser?.id) {
          setDownloadHistoryState(prevState => {
              const updatedState = typeof newHistory === 'function' ? newHistory(prevState) : newHistory;
              updateLocalStorage(`kreatask_downloads_${currentUser.id}`, updatedState);
              return updatedState;
          });
      }
    }, [currentUser?.id]);

    const addTask = (newTask: Task) => {
        const updatedTasks = [...allTasks, newTask];
        handleSetTasks(updatedTasks);
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
      if (!currentUser) return;

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
      
      if (isRedownload) {
        setDownloadHistory(prevHistory => {
          const existingItemIndex = prevHistory.findIndex(item => item.fileName === file.name && item.taskName === taskName);
          if (existingItemIndex > -1) {
            const updatedHistory = [...prevHistory];
            updatedHistory[existingItemIndex] = newDownloadItem;
            return updatedHistory;
          }
          return [newDownloadItem, ...prevHistory];
        });
      } else {
         setDownloadHistory(prevHistory => [newDownloadItem, ...prevHistory]);
      }

    }, [currentUser, setDownloadHistory]);

    const value = {
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

export const useTaskData = () => {
    const context = useContext(TaskDataContext);
    if (context === undefined) {
        throw new Error('useTaskData must be used within a TaskDataProvider');
    }
    return context;
};
