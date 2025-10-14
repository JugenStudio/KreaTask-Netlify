

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
    
    // Fetch ALL users. This is OK for smaller apps, but for larger apps,
    // this should be restricted or paginated based on roles.
    // The security rules MUST allow this `list` operation for the logged-in user's role.
    const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersDataFromDB, isLoading: isUsersLoading } = useCollection<User>(usersCollectionRef);
    const users = useMemo(() => usersDataFromDB || [], [usersDataFromDB]);
    
    // Fetch tasks where the current user is an assignee
    // This query is secure because it's filtered by the user's UID.
    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'tasks'), where('assignees', 'array-contains', user.uid));
    }, [firestore, user]);
    const { data: tasksData, isLoading: isTasksDataLoading } = useCollection<Task>(tasksCollectionRef);
    const allTasks = useMemo(() => tasksData || [], [tasksData]);
    
    // Fetch notifications ONLY for the current user. This is secure.
    const notificationsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'notifications'), where("userId", "==", user.uid));
    }, [firestore, user]);
    const { data: notificationsData, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsCollectionRef);
    const notifications = useMemo(() => notificationsData || [], [notificationsData]);

    // Fetch the specific document for the currently logged-in user. This is secure.
    const { data: currentUserDoc, isLoading: isCurrentUserLoading } = useDoc<User>(
        useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user])
    );
    
    // Construct the full User object for the current user.
    const currentUserData = useMemo<User | null>(() => {
        if (currentUserDoc) return currentUserDoc;
        // Fallback while the doc is loading, using data from the auth object
        if (user) {
            return {
                id: user.uid,
                email: user.email || '',
                name: user.displayName || 'KreaTask User',
                avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
                role: UserRole.UNASSIGNED, // Default role
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
        addNotification, updateUserInFirestore, deleteUser, addToDownloadHistory
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
