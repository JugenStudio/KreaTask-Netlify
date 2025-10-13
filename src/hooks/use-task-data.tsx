
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useUser } from '@/app/(app)/layout';

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
    setUsers: (users: User[] | ((prevUsers: User[]) => User[])) => void; // Kept for settings page
    setAllTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void; // Kept for kanban
    setNotifications: (notifications: Notification[] | ((prevNotifications: Notification[]) => Notification[])) => void;
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Task) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { currentUser } = useUser();

    // Directly fetch data from Firebase
    const tasksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
    const { data: tasksData, isLoading: isTasksLoading } = useCollection<Task>(tasksCollection);

    const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersData, isLoading: isUsersLoading } = useCollection<User>(usersCollection);

    const notificationsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'notifications') : null, [firestore]);
    const { data: notificationsData, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsCollection);

    // Local state for non-firestore data or data that needs manipulation client-side
    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    // States that are still needed for client-side modifications (like settings & kanban)
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (tasksData) setAllTasks(tasksData);
    }, [tasksData]);

    useEffect(() => {
        if (usersData) setUsers(usersData);
    }, [usersData]);

    const isLoading = isTasksLoading || isUsersLoading || isNotifsLoading;

    // Persist downloads to localStorage
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

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addTask = useCallback(async (newTask: Task) => {
        if (!firestore) return;
        const taskRef = doc(firestore, 'tasks', newTask.id);
        await setDoc(taskRef, newTask);
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

    const addNotification = useCallback(async (newNotificationData: Omit<Notification, 'id'>) => {
        if (!firestore) return;
        await addDoc(collection(firestore, 'notifications'), {
            ...newNotificationData,
            createdAt: serverTimestamp(),
        });
    }, [firestore]);
    
    // This remains a local state management function
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
        isLoading,
        allTasks,
        users,
        leaderboardData,
        notifications: notificationsData || [],
        downloadHistory,
        setUsers, // Pass down the setter for the settings page
        setAllTasks, // Pass down the setter for Kanban optimistic updates
        setNotifications: () => {}, // This is now read-only from Firebase
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        addToDownloadHistory,
    }), [
        isLoading, 
        allTasks, 
        users, 
        leaderboardData, 
        notificationsData, 
        downloadHistory, 
        addTask, 
        updateTask, 
        deleteTask, 
        addNotification, 
        addToDownloadHistory
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
