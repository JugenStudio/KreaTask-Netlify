
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useCurrentUser } from '@/app/(app)/layout';
import { isDirector } from '@/lib/roles';

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
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Partial<Notification>) => Promise<void>;
    updateUserRole: (userId: string, role: string) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { currentUser } = useCurrentUser();

    // Determine if the current user is a director.
    const isUserDirector = currentUser ? isDirector(currentUser.role) : false;

    // --- Data Fetching Logic based on Role ---

    // 1. Fetch ALL users only if the current user is a Director/Admin
    const usersCollectionRef = useMemoFirebase(() => 
        firestore && isUserDirector ? collection(firestore, 'users') : null, 
        [firestore, isUserDirector]
    );
    const { data: allUsers, isLoading: isUsersLoading, error: usersError } = useCollection<User>(usersCollectionRef);

    // If the user is not a director, we manually add them to the list so they can see their own info.
    const users = useMemo(() => {
        if (isUserDirector) {
            return allUsers || [];
        }
        return currentUser ? [currentUser] : [];
    }, [isUserDirector, allUsers, currentUser]);

    // 2. Fetch tasks based on role.
    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !currentUser) return null;
        const tasksCollection = collection(firestore, 'tasks');
        
        // Directors see all tasks
        if (isUserDirector) {
            return tasksCollection;
        }
        
        // Employees only see tasks assigned to them
        return query(tasksCollection, where('assignees', 'array-contains', {
            id: currentUser.id,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
            role: currentUser.role
        }));
    }, [firestore, currentUser, isUserDirector]);
    const { data: allTasks, isLoading: isTasksLoading, error: tasksError } = useCollection<Task>(tasksCollectionRef);

    // 3. Fetch notifications for the current user
    const notificationsCollectionRef = useMemoFirebase(() => 
        firestore && currentUser ? collection(firestore, 'notifications') : null, 
        [firestore, currentUser]
    );
    const { data: notifications, isLoading: isNotifsLoading, error: notifsError } = useCollection<Notification>(notificationsCollectionRef);
    
    // --- Local State for Download History ---
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

    // --- Derived Data ---
    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks || [], users || []), [allTasks, users]);

    // --- Firestore Write Operations ---
    const addTask = useCallback(async (newTaskData: Partial<Task>) => {
        if (!firestore) return;
        await addDoc(collection(firestore, 'tasks'), {
            ...newTaskData,
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

    const value: TaskDataContextType = useMemo(() => ({
        isLoading: isTasksLoading || isUsersLoading || isNotifsLoading,
        allTasks: allTasks || [],
        users: users || [],
        leaderboardData,
        notifications: notifications || [],
        downloadHistory,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        updateUserRole,
        deleteUser,
        addToDownloadHistory,
    }), [
        isTasksLoading, isUsersLoading, isNotifsLoading, 
        allTasks, users, leaderboardData, notifications, 
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
