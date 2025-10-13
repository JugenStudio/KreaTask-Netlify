
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { initialUsers, initialTasks } from '@/lib/data';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useCurrentUser } from '@/app/(app)/layout';
import { isDirector, isEmployee } from '@/lib/roles';
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
    setAllTasks: (tasks: Task[]) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    
    // Seed data function
    const seedInitialData = useCallback(async () => {
        if (!firestore) return;
        console.log("Checking if seeding is needed...");
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        
        if (usersSnapshot.empty) {
            console.log("Database is empty. Seeding initial data...");
            const batch = writeBatch(firestore);

            initialUsers.forEach(user => {
                const userRef = doc(firestore, 'users', user.id);
                batch.set(userRef, user);
            });
            
            initialTasks.forEach(task => {
                const taskRef = doc(firestore, 'tasks', task.id);
                batch.set(taskRef, task);
            })

            await batch.commit();
            console.log("Initial data seeded successfully.");
        } else {
            console.log("Data already exists. Skipping seed.");
        }
    }, [firestore]);

    useEffect(() => {
        if (firestore) {
            seedInitialData();
        }
    }, [firestore, seedInitialData]);

    const usersCollectionRef = useMemoFirebase(() => 
        firestore && user ? collection(firestore, 'users') : null, 
        [firestore, user]
    );
    const { data: usersData, isLoading: isUsersLoading, error: usersError } = useCollection<User>(usersCollectionRef);
    const users = usersData || [];

    const isUserDirector = user ? isDirector((users.find(u => u.id === user.uid) as User)?.role) : false;

    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        const tasksCollection = collection(firestore, 'tasks');
        if (isUserDirector) {
            return tasksCollection;
        }
        const currentUserData = users.find(u => u.id === user.uid);
        if (!currentUserData) return null;

        return query(tasksCollection, where('assignees', 'array-contains', {
            id: currentUserData.id,
            name: currentUserData.name,
            avatarUrl: currentUserData.avatarUrl,
            role: currentUserData.role
        }));
    }, [firestore, user, users, isUserDirector]);
    
    const { data: tasksData, isLoading: isTasksLoading, error: tasksError } = useCollection<Task>(tasksCollectionRef);

    useEffect(() => {
        if (tasksData) {
            setAllTasks(tasksData);
        }
    }, [tasksData]);
    
    const notificationsCollectionRef = useMemoFirebase(() => 
        firestore && user ? query(collection(firestore, 'notifications'), where('userId', '==', user.uid)) : null,
        [firestore, user]
    );
    const { data: notifications, isLoading: isNotifsLoading, error: notifsError } = useCollection<Notification>(notificationsCollectionRef);
    
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
        setAllTasks,
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
