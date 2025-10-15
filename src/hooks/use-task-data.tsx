

"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { UserRole } from '@/lib/types';
import { isEmployee } from '@/lib/roles';

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
    
    // Filter to include only team members (employees)
    const teamMembers = users.filter(user => isEmployee(user.role));
    if (teamMembers.length === 0) return [];

    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: any; jabatan?: string; } } = {};

    teamMembers.forEach(user => {
      userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role, jabatan: user.jabatan };
    });

    tasks.forEach(task => {
      if (task.status === 'Completed' && task.approvedBy) {
        task.assignees.forEach(assignee => {
          // Check if the assignee is a valid employee (not a director)
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
    setNotifications: (notifications: Notification[]) => void, // Changed for direct manipulation
    updateNotifications: (notificationsToUpdate: Notification[]) => Promise<void>;
    downloadHistory: DownloadItem[];
    setDownloadHistory: (history: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => void;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Partial<Notification>) => Promise<void>;
    updateUserInFirestore: (userId: string, data: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
    setAllTasks: (tasks: Task[]) => void;
    setUsers: (users: User[]) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersDataFromDB, isLoading: isUsersLoading } = useCollection<User>(usersCollectionRef);
    const users = useMemo(() => usersDataFromDB || [], [usersDataFromDB]);
    
    // Fetch all tasks for directors, or only assigned tasks for employees
    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        const currentUserFromList = users.find(u => u.id === user.uid);
        if (currentUserFromList && isEmployee(currentUserFromList.role)) {
            return query(collection(firestore, 'tasks'), where('assignees', 'array-contains', user.uid));
        }
        // For directors, fetch all tasks
        return collection(firestore, 'tasks');
    }, [firestore, user, users]);

    const { data: tasksData, isLoading: isTasksDataLoading } = useCollection<Task>(tasksCollectionRef);
    const allTasks = useMemo(() => tasksData || [], [tasksData]);
    
    const notificationsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'notifications'), where("userId", "==", user.uid));
    }, [firestore, user]);
    const { data: notificationsDataFromDB, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsCollectionRef);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (notificationsDataFromDB) {
            setNotifications(notificationsDataFromDB);
        }
    }, [notificationsDataFromDB]);
    

    const { data: currentUserDoc, isLoading: isCurrentUserLoading } = useDoc<User>(
        useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user])
    );
    
    const currentUserData = useMemo<User | null>(() => {
        if (currentUserDoc) return currentUserDoc;
        if (user) {
            return {
                id: user.uid,
                email: user.email || '',
                name: user.displayName || 'KreaTask User',
                avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
                role: UserRole.UNASSIGNED,
                jabatan: 'Unassigned',
            };
        }
        return null;
    }, [user, currentUserDoc]);

    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    useEffect(() => {
        if (currentUserData?.id) {
          try {
            const savedDownloads = localStorage.getItem(`kreatask_downloads_${currentUserData.id}`);
            if (savedDownloads) {
                setDownloadHistory(JSON.parse(savedDownloads));
            } else {
                setDownloadHistory([]);
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
        const assignees = (newTaskData.assignees || []).map(a => typeof a === 'string' ? a : a.id);
        const docWithAssigneeUids = { ...newTaskData, assignees };
        await addDoc(collection(firestore, 'tasks'), docWithAssigneeUids);
    }, [firestore, user]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        if (!firestore || !user) return;
        const taskRef = doc(firestore, 'tasks', taskId);
        const updatePayload: Partial<Task> = { ...updates };
        if (updates.assignees) {
            updatePayload.assignees = updates.assignees.map(a => typeof a === 'string' ? a : a.id);
        }
        await updateDoc(taskRef, updatePayload as any);
    }, [firestore, user]);

    const deleteTask = useCallback(async (taskId: string) => {
        if (!firestore || !user) return;
        await deleteDoc(doc(firestore, 'tasks', taskId));
    }, [firestore, user]);
    
    const updateUserInFirestore = useCallback(async (userId: string, data: Partial<User>) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, data);
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
    
    const updateNotifications = useCallback(async (notificationsToUpdate: Notification[]) => {
        if (!firestore) return;
        const batch = writeBatch(firestore);

        notificationsToUpdate.forEach(notif => {
            const notifRef = doc(firestore, 'notifications', notif.id);
            batch.update(notifRef, { read: notif.read });
        });

        await batch.commit();
        // The real-time listener will automatically update the state, but we can update it locally for immediate UI feedback.
        setNotifications(prev => prev.map(n => {
            const updated = notificationsToUpdate.find(u => u.id === n.id);
            return updated || n;
        }));
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

    const setUsers = (newUsers: User[]) => {
      console.warn("setUsers is a no-op with a real-time Firestore backend.");
    };

    const value: TaskDataContextType = useMemo(() => ({
        isLoading: isUserLoading || isTasksDataLoading || isNotifsLoading || isUsersLoading || isCurrentUserLoading,
        allTasks,
        users,
        currentUserData,
        leaderboardData,
        notifications,
        setNotifications,
        updateNotifications,
        downloadHistory,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        updateUserInFirestore,
        deleteUser,
        addToDownloadHistory,
        setAllTasks,
        setUsers,
    }), [
        isUserLoading, isTasksDataLoading, isNotifsLoading, isUsersLoading, isCurrentUserLoading,
        allTasks, users, currentUserData, leaderboardData, notifications, 
        downloadHistory, addTask, updateTask, deleteTask, 
        addNotification, updateUserInFirestore, deleteUser, addToDownloadHistory, updateNotifications
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
