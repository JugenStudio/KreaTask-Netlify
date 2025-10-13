
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';

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

const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
    if (!tasks || !users) return [];
    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: any; } } = {};

    users.forEach(user => {
      userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role };
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
    }));
};

export interface TaskDataContextType {
    isLoading: boolean;
    allTasks: Task[];
    users: User[];
    leaderboardData: LeaderboardEntry[];
    notifications: Notification[];
    downloadHistory: DownloadItem[];
    setUsers: (users: User[] | ((prevUsers: User[]) => User[])) => void;
    setAllTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void;
    setNotifications: (notifications: Notification[] | ((prevNotifications: Notification[]) => Notification[])) => void;
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Partial<Notification>) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { user, isUserLoading: isAuthLoading } = useUser();

    // IMPORTANT: Only create collection references if firestore and user are available.
    const tasksCollection = useMemoFirebase(() => firestore && user ? collection(firestore, 'tasks') : null, [firestore, user]);
    const { data: allTasks, isLoading: isTasksLoading } = useCollection<Task>(tasksCollection);

    const usersCollection = useMemoFirebase(() => firestore && user ? collection(firestore, 'users') : null, [firestore, user]);
    const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersCollection);

    const notificationsCollection = useMemoFirebase(() => firestore && user ? collection(firestore, 'notifications') : null, [firestore, user]);
    const { data: notifications, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsCollection);
    
    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    useEffect(() => {
        try {
            const savedDownloads = localStorage.getItem('kreatask_downloads');
            if (savedDownloads) {
                setDownloadHistory(JSON.parse(savedDownloads));
            }
        } catch (error) {
            console.error("Failed to load downloads from localStorage:", error);
        }
    }, []);

    useEffect(() => {
      localStorage.setItem('kreatask_downloads', JSON.stringify(downloadHistory));
    }, [downloadHistory]);

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks || [], users || []), [allTasks, users]);

    const addTask = useCallback(async (newTaskData: Partial<Task>) => {
        if (!firestore) return;
        await addDoc(collection(firestore, 'tasks'), {
            ...newTaskData,
            createdAt: new Date().toISOString(),
        });
    }, [firestore]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        if (!firestore) return;
        const taskRef = doc(firestore, 'tasks', taskId);
        await updateDoc(taskRef, updates);
    }, [firestore]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!firestore) return;
        await deleteDoc(doc(firestore, 'tasks', taskId));
    }, [firestore]);

    const addNotification = useCallback(async (newNotificationData: Partial<Notification>) => {
        if (!firestore) return;
        await addDoc(collection(firestore, 'notifications'), {
            ...newNotificationData,
            createdAt: new Date().toISOString(),
        });
    }, [firestore]);
    
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
        isLoading: isAuthLoading || isTasksLoading || isUsersLoading || isNotifsLoading,
        allTasks: allTasks || [],
        users: users || [],
        leaderboardData,
        notifications: notifications || [],
        downloadHistory,
        setUsers: () => console.warn("setUsers is deprecated. Update Firestore directly."),
        setAllTasks: () => console.warn("setAllTasks is deprecated. Update Firestore directly."),
        setNotifications: () => console.warn("setNotifications is deprecated. Update Firestore directly."),
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        addToDownloadHistory,
    }), [
        isAuthLoading, isTasksLoading, isUsersLoading, isNotifsLoading, 
        allTasks, users, leaderboardData, notifications, 
        downloadHistory, addTask, updateTask, deleteTask, 
        addNotification, addToDownloadHistory
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
