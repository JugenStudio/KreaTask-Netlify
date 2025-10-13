
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { initialUsers, initialTasks } from '@/lib/data';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { isDirector, isEmployee } from '@/lib/roles';

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
    setUsers: (users: User[]) => void;
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
    
    // This fetches ALL users and is likely causing the permission error.
    // We will get the list of users only when needed, e.g., in the settings page.
    // const usersCollectionRef = useMemoFirebase(() => {
    //     if (!firestore || !user) return null;
    //     return collection(firestore, 'users');
    // }, [firestore, user]);
    // const { data: usersData, isLoading: isUsersLoading } = useCollection<User>(usersCollectionRef);
    const [users, setUsers] = useState<User[]>([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);

    const seedInitialData = useCallback(async () => {
        if (!firestore) return;
        console.log("Checking if user collection exists and needs seeding...");
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            
            if (usersSnapshot.empty) {
                console.log("Database is empty. Seeding initial users...");
                const batch = writeBatch(firestore);

                initialUsers.forEach(userToSeed => {
                    const userRef = doc(firestore, 'users', userToSeed.id);
                    batch.set(userRef, {
                      name: userToSeed.name,
                      email: userToSeed.email,
                      avatarUrl: userToSeed.avatarUrl,
                      role: userToSeed.role,
                      jabatan: userToSeed.jabatan || '',
                    });
                });

                await batch.commit();
                console.log("Initial users seeded successfully.");
            } else {
                console.log("Users collection is not empty. Skipping seed.");
            }
        } catch (error) {
            console.error("Error seeding user data:", error);
        }
    }, [firestore]);

    useEffect(() => {
      if (firestore) {
        seedInitialData();
      }
    }, [firestore, seedInitialData]);

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

    // DERIVE currentUserData from the authenticated 'user' object instead of a separate fetch
    const currentUserData: User | null = useMemo(() => {
        if (!user) return null;
        // Find the full user data from the `users` state if it's available
        const fullData = users.find(u => u.id === user.uid);
        if (fullData) return fullData;

        // Fallback to basic info from auth object if full data isn't loaded yet
        return {
            id: user.uid,
            name: user.displayName || 'KreaTask User',
            email: user.email || '',
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
            // The role will be missing here initially, but that's okay for the layout to render
            role: 'Unassigned' as any,
        };
    }, [user, users]);

    useEffect(() => {
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            getDocs(collection(firestore, 'users')).then(snapshot => {
                const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
                setUsers(fetchedUsers);
                setIsUsersLoading(false);
            }).catch(err => {
                console.error("Failed to fetch users list:", err);
                setIsUsersLoading(false);
            });
        } else {
            setUsers([]);
            setIsUsersLoading(false);
        }
    }, [user, firestore]);

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

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addTask = useCallback(async (newTaskData: Partial<Task>) => {
        if (!firestore || !user) return;
        const userTasksCollection = collection(firestore, 'users', user.uid, 'tasks');
        const docRef = doc(userTasksCollection, newTaskData.id);
        await setDoc(docRef, newTaskData);
    }, [firestore, user]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        if (!firestore || !user) return;
        // This assumes a user can only update their own tasks.
        // For directors updating others' tasks, this logic needs adjustment.
        // For now, let's assume it operates on the logged-in user's task subcollection.
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
        isLoading: isUserLoading || isTasksDataLoading || isNotifsLoading || isUsersLoading,
        allTasks,
        users,
        currentUserData,
        leaderboardData,
        notifications,
        downloadHistory,
        setUsers,
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
        isUserLoading, isTasksDataLoading, isNotifsLoading, isUsersLoading,
        allTasks, users, currentUserData, leaderboardData, notifications, 
        downloadHistory, setUsers, setDownloadHistory, addTask, updateTask, deleteTask, 
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
