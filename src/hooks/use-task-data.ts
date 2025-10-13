
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';

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
      if (task.status === 'Completed') {
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
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments' | 'files' | 'subtasks'>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
    addToDownloadHistory: (file: { name: string; size: string, url: string }, taskName: string, isRedownload?: boolean) => void;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const firestore = useFirestore();
    
    const tasksCollectionRef = useMemoFirebase(() => collection(firestore, 'tasks'), [firestore]);
    const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const notificationsCollectionRef = useMemoFirebase(() => collection(firestore, 'notifications'), [firestore]);

    const { data: tasksData, isLoading: tasksLoading } = useCollection<Task>(tasksCollectionRef);
    const { data: usersData, isLoading: usersLoading } = useCollection<User>(usersCollectionRef);
    const { data: notificationsData, isLoading: notificationsLoading } = useCollection<Notification>(notificationsCollectionRef);

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);

    const isLoading = tasksLoading || usersLoading || notificationsLoading;

    useEffect(() => {
        if (tasksData) setAllTasks(tasksData);
    }, [tasksData]);

    useEffect(() => {
        if (usersData) setUsers(usersData);
    }, [usersData]);

    useEffect(() => {
        if (notificationsData) setNotifications(notificationsData);
    }, [notificationsData]);

    useEffect(() => {
        if (tasksData && usersData) {
            setLeaderboardData(calculateLeaderboard(tasksData, usersData));
        }
    }, [tasksData, usersData]);

    const addTask = useCallback(async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments' | 'files' | 'subtasks'>) => {
        const taskWithTimestamp = {
            ...newTaskData,
            createdAt: new Date().toISOString(),
            revisions: [],
            comments: [],
            files: [],
            subtasks: [],
        };
        await addDoc(tasksCollectionRef, taskWithTimestamp);
    }, [tasksCollectionRef]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        const taskDocRef = doc(firestore, 'tasks', taskId);
        await updateDoc(taskDocRef, updates);
    }, [firestore]);

    const deleteTask = useCallback(async (taskId: string) => {
        const taskDocRef = doc(firestore, 'tasks', taskId);
        await deleteDoc(taskDocRef);
    }, [firestore]);

    const addNotification = useCallback(async (newNotificationData: Omit<Notification, 'id' | 'createdAt'>) => {
        const notificationWithTimestamp = {
            ...newNotificationData,
            createdAt: new Date().toISOString(),
        };
        await addDoc(notificationsCollectionRef, notificationWithTimestamp);
    }, [notificationsCollectionRef]);

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
        notifications,
        downloadHistory,
        setUsers,
        setAllTasks,
        setNotifications,
        setDownloadHistory,
        addTask,
        updateTask,
        deleteTask,
        addNotification,
        addToDownloadHistory,
    }), [isLoading, allTasks, users, leaderboardData, notifications, downloadHistory, addTask, updateTask, deleteTask, addNotification, addToDownloadHistory]);

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
