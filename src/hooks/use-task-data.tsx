
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification, UserRole } from '@/lib/types';
import { useCurrentUser } from '@/app/(app)/layout';
import { isEmployee } from '@/lib/roles';
import { useToast } from './use-toast';
import { getInitialDashboardData } from '@/app/actions';

type DownloadItem = {
  id: number;
  fileName: string;
  taskName: string;
  date: string;
  url: string;
  size: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  progress: number;
};

// This function can be expanded with more complex logic as needed
const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
    if (!tasks || !users) return [];
    
    const teamMembers = users.filter(user => isEmployee(user.role));
    if (teamMembers.length === 0) return [];

    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: UserRole; jabatan?: string; } } = {};

    teamMembers.forEach(user => {
      userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role, jabatan: user.jabatan };
    });

    tasks.forEach(task => {
      if (task.status === 'Completed' && task.approvedBy) {
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
      jabatan: data.jabatan,
    }));
};


export interface TaskDataContextType {
    isLoading: boolean;
    allTasks: Task[];
    setAllTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    notifications: Notification[];
    setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void;
    leaderboardData: LeaderboardEntry[];
    downloadHistory: DownloadItem[];
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
    refetchData: () => Promise<void>;
    canManageUsers: boolean; // Add the server-side calculated flag
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const { currentUser: authUser, isLoading: isAuthLoading } = useCurrentUser();
    const { toast } = useToast();

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [canManageUsers, setCanManageUsers] = useState(false); // State for the flag

    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    // Function to fetch all data using a Server Action
    const fetchData = useCallback(async () => {
        if (!authUser) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch the flag from the server action along with other data
            const { users, allTasks, notifications, canManageUsers: serverCanManageUsers } = await getInitialDashboardData(authUser.id);
            setUsers(users);
            setAllTasks(allTasks);
            setNotifications(notifications);
            setCanManageUsers(serverCanManageUsers); // Set the state from server data
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({
              variant: "destructive",
              title: "Failed to load data",
              description: "Could not retrieve data from the server. Please try again later."
            })
        } finally {
            setIsLoading(false);
        }
    }, [authUser, toast]);

    // This useEffect now only runs ONCE when the provider mounts and the user is available.
    // It no longer refetches on every page navigation.
    useEffect(() => {
        if (!isAuthLoading && authUser) {
            fetchData();
        } else if (!isAuthLoading && !authUser) {
            // If user is not authenticated, stop loading.
            setIsLoading(false);
        }
    }, [isAuthLoading, authUser, fetchData]);


    useEffect(() => {
        if (authUser?.id) {
          try {
            const savedDownloads = localStorage.getItem(`kreatask_downloads_${authUser.id}`);
            if (savedDownloads) setDownloadHistory(JSON.parse(savedDownloads));
            else setDownloadHistory([]);
          } catch (error) { console.error("Failed to load downloads:", error); }
        }
    }, [authUser?.id]);

    useEffect(() => {
      if (authUser?.id) {
        localStorage.setItem(`kreatask_downloads_${authUser.id}`, JSON.stringify(downloadHistory));
      }
    }, [downloadHistory, authUser?.id]);

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addToDownloadHistory = useCallback((file: { name: string; size: string, url: string }, taskName: string, isRedownload = false) => {
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
    }, []);
    
    const value: TaskDataContextType = useMemo(() => ({
        isLoading: isLoading,
        allTasks,
        setAllTasks,
        users,
        setUsers,
        notifications,
        setNotifications,
        leaderboardData,
        downloadHistory,
        setDownloadHistory,
        addToDownloadHistory,
        refetchData: fetchData,
        canManageUsers, // Provide the flag through context
    }), [
        isLoading,
        allTasks, users, leaderboardData, notifications, 
        downloadHistory, addToDownloadHistory, fetchData, canManageUsers
    ]);

    return (
        <TaskDataContext.Provider value={value}>
            {children}
        </TaskDataContext.Provider>
    );
}

export const useTaskData = () => {
    const context = useContext(TaskDataContext);
    if (context === undefined) {
        throw new Error('useTaskData must be used within a TaskDataProvider');
    }
    return context;
};
