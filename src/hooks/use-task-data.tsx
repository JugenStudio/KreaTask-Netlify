
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { initialUsers, initialTasks } from '@/lib/data';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useUser } from '@/firebase/provider';

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
    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: any; jabatan?: string; } } = {};

    users.forEach(user => {
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
    users: User[];
    currentUserData: User | null;
    leaderboardData: LeaderboardEntry[];
    notifications: Notification[];
    downloadHistory: DownloadItem[];
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Partial<Notification>) => Promise<void>;
    updateUserRole: (userId: string, role: string) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
    setAllTasks: (tasks: Task[]) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const [users, setUsers] = useState<User[]>([]);
    
    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'tasks');
    }, [firestore, user]);
    const { data: tasksData, isLoading: isTasksDataLoading } = useCollection<Task>(tasksCollectionRef);
    const allTasks = useMemo(() => tasksData || [], [tasksData]);
    
    const notificationsCollectionRef = useMemoFirebase(() => 
        (firestore && user) ? query(collection(firestore, 'notifications'), where('userId', '==', user.uid)) : null,
        [firestore, user]
    );
    const { data: notificationsData, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsCollectionRef);
    const notifications = useMemo(() => notificationsData || [], [notificationsData]);

    const currentUserData: User | null = useMemo(() => {
        if (!user) return null;
        return {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email || '',
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
            role: (user as any).role || null, // This will be filled later
        };
    }, [user]);

    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    useEffect(() => {
        if (currentUserData?.id) {
          try {
            const savedDownloads = localStorage.getItem(`kreatask_downloads_${currentUserData.id}`);
            if (savedDownloads) {
                setDownloadHistory(JSON.parse(savedDownloads));
            } else {
                setDownloadHistory([]); // Reset for new user
            }
          } catch (error) {
              console.error("Failed to load downloads from localStorage:", error);
          }
        }
    }, [currentUserData?.id]);

    useEffect(() => {
      if (currentUserData?.id) {
        localStorage.setItem(`kreatask_downloads_${currentUserData.id}`, JSON.stringify(downloadHistory));
      }
    }, [downloadHistory, currentUserData?.id]);

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addTask = useCallback(async (newTaskData: Partial<Task>) => {
        if (!firestore || !user) return;
        const userTasksCollection = collection(firestore, 'users', user.uid, 'tasks');
        const docRef = doc(userTasksCollection, newTaskData.id);
        await setDoc(docRef, newTaskData);
    }, [firestore, user]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        if (!firestore || !user) return;
        const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskRef, updates);
    }, [firestore, user]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!firestore || !user) return;
        await deleteDoc(doc(firestore, 'users', user.uid, 'tasks', taskId));
    }, [firestore, user]);
    
    const updateUserRole = useCallback(async (userId: string, role: string) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, { role });
    }, [firestore]);

    const deleteUser = useCallback(async (userId: string) => {
        if (!firestore) return;
        await deleteDoc(doc(firestore, 'users', userId));
    }, [firestore]);

    const addNotification = useCallback(async (newNotificationData: Partial<Notification>) => {
        if (!firestore) return;
        const newNotif = {
            id: `notif-${Date.now()}`,
            read: false,
            createdAt: new Date().toISOString(),
            ...newNotificationData
        };
        const notifRef = doc(collection(firestore, 'notifications'), newNotif.id);
        await setDoc(notifRef, newNotif);
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
    
    const setAllTasks = (newTasks: Task[]) => {
      console.warn("setAllTasks is a no-op with a real-time Firestore backend.");
    };

    const value: TaskDataContextType = useMemo(() => ({
        isLoading: isUserLoading || isTasksDataLoading || isNotifsLoading,
        allTasks,
        users,
        currentUserData,
        leaderboardData,
        notifications,
        downloadHistory,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        updateUserRole,
        deleteUser,
        addToDownloadHistory,
        setAllTasks,
    }), [
        isUserLoading, isTasksDataLoading, isNotifsLoading,
        allTasks, users, currentUserData, leaderboardData, notifications, 
        downloadHistory, addTask, updateTask, deleteTask, 
        addNotification, updateUserRole, deleteUser, addToDownloadHistory
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
