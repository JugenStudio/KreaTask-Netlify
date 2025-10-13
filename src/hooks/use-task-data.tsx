
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { initialData } from '@/lib/data';

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
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial data loading from a "local" source
    useEffect(() => {
        const loadData = () => {
            try {
                // Simulate loading from localStorage or initialData
                const savedTasks = localStorage.getItem('kreatask_tasks');
                const savedUsers = localStorage.getItem('kreatask_users');
                const savedNotifs = localStorage.getItem('kreatask_notifications');
                const savedDownloads = localStorage.getItem('kreatask_downloads');
                
                const tasks = savedTasks ? JSON.parse(savedTasks) : initialData.allTasks;
                const users = savedUsers ? JSON.parse(savedUsers) : initialData.users;
                const notifs = savedNotifs ? JSON.parse(savedNotifs) : initialData.mockNotifications;
                const downloads = savedDownloads ? JSON.parse(savedDownloads) : [];

                setAllTasks(tasks);
                setUsers(users);
                setNotifications(notifs);
                setDownloadHistory(downloads);
                setLeaderboardData(calculateLeaderboard(tasks, users));
            } catch (error) {
                console.error("Failed to load data:", error);
                // Fallback to initial data if localStorage fails
                setAllTasks(initialData.allTasks);
                setUsers(initialData.users);
                setNotifications(initialData.mockNotifications);
                setLeaderboardData(calculateLeaderboard(initialData.allTasks, initialData.users));
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Persist data to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) localStorage.setItem('kreatask_tasks', JSON.stringify(allTasks));
    }, [allTasks, isLoading]);

    useEffect(() => {
        if (!isLoading) localStorage.setItem('kreatask_users', JSON.stringify(users));
    }, [users, isLoading]);

    useEffect(() => {
        if (!isLoading) localStorage.setItem('kreatask_notifications', JSON.stringify(notifications));
    }, [notifications, isLoading]);

    useEffect(() => {
      if (!isLoading) localStorage.setItem('kreatask_downloads', JSON.stringify(downloadHistory));
    }, [downloadHistory, isLoading]);
    
    // Recalculate leaderboard when tasks or users change
    useEffect(() => {
        setLeaderboardData(calculateLeaderboard(allTasks, users));
    }, [allTasks, users]);


    const addTask = useCallback(async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments' | 'files' | 'subtasks'>) => {
        setAllTasks(prevTasks => {
            const fullTask: Task = {
                id: `task-${Date.now()}`,
                ...newTaskData,
                createdAt: new Date().toISOString(),
                revisions: [],
                comments: [],
                files: newTaskData.files || [],
                subtasks: newTaskData.subtasks || [],
            };
            return [...prevTasks, fullTask];
        });
    }, []);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        setAllTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            )
        );
    }, []);

    const deleteTask = useCallback(async (taskId: string) => {
        setAllTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }, []);

    const addNotification = useCallback(async (newNotificationData: Omit<Notification, 'id' | 'createdAt'>) => {
        setNotifications(prev => {
            const fullNotif = {
                ...newNotificationData,
                id: `notif-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            return [fullNotif, ...prev];
        });
    }, []);

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
