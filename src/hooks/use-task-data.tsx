

"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, where, query, getDocs, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { UserRole } from '@/lib/types';
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
    setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void;
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
    
    // Fetch current user's data first
    const currentUserDocRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<User>(currentUserDocRef);
    
    const usersCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // Fetch all users if current user is director/admin, otherwise this query will be null
        // and allUsersFromDB will be null
        if (currentUserData && (isDirector(currentUserData.role) || currentUserData.role === UserRole.ADMIN)) {
            return collection(firestore, 'users');
        }
        return null;
    }, [firestore, currentUserData]);
    
    const { data: allUsersFromDB, isLoading: isAllUsersLoading } = useCollection<User>(usersCollectionRef);
    
    const users = useMemo(() => {
        if (allUsersFromDB) {
            return allUsersFromDB;
        }
        if (currentUserData) {
            return [currentUserData];
        }
        return [];
    }, [allUsersFromDB, currentUserData]);


    const tasksCollectionRef = useMemoFirebase(() => {
        if (!firestore || !currentUserData) return null;
        
        // Employees can only see tasks assigned to them
        if (isEmployee(currentUserData.role)) {
            return query(collection(firestore, 'tasks'), where('assignees', 'array-contains', { id: currentUserData.id, name: currentUserData.name, avatarUrl: currentUserData.avatarUrl, role: currentUserData.role }));
        }

        // Directors and Admins can see all tasks
        return collection(firestore, 'tasks');
    }, [firestore, currentUserData]);

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
        const assignees = (newTaskData.assignees || []).map(a => typeof a === 'string' ? a.id : a);
        const docWithAssigneeUids = { ...newTaskData, assignees };
        await addDoc(collection(firestore, 'tasks'), docWithAssigneeUids);
    }, [firestore, user]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        if (!firestore || !user) return;
        const taskRef = doc(firestore, 'tasks', taskId);
        const updatePayload: Partial<Task> = { ...updates };
        if (updates.assignees) {
            updatePayload.assignees = updates.assignees.map(a => typeof a === 'string' ? { id: a, name: users.find(u=>u.id === a)?.name, avatarUrl: users.find(u=>u.id === a)?.avatarUrl, role: users.find(u=>u.id === a)?.role} : a) as User[];
        }
        await updateDoc(taskRef, updatePayload as any);
    }, [firestore, user, users]);

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
        isLoading: isUserLoading || isTasksDataLoading || isNotifsLoading || isCurrentUserLoading || isAllUsersLoading,
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
        isUserLoading, isTasksDataLoading, isNotifsLoading, isCurrentUserLoading, isAllUsersLoading,
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

    
