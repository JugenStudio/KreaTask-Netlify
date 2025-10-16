
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification, Subtask, File as FileType } from '@/lib/types';
import { useUser } from '@/firebase/provider';
import { UserRole } from '@/lib/types';
import { isEmployee } from '@/lib/roles';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';
import { eq, inArray, desc, and } from 'drizzle-orm';
import { useToast } from './use-toast';

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

// This function can be expanded with more complex logic as needed
const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
    if (!tasks || !users) return [];
    
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
    refetchData: () => Promise<void>;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
const db = drizzle(sql, { schema });

export function TaskDataProvider({ children }: { children: ReactNode }) {
    const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
    const { toast } = useToast();

    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
    
    // Function to fetch all data from NeonDB
    const fetchData = useCallback(async () => {
        if (!firebaseUser) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch current user data
            const currentUserResult = await db.query.users.findFirst({
                where: eq(schema.users.id, firebaseUser.uid),
            });
            setCurrentUserData(currentUserResult || null);

            if (!currentUserResult) {
              setIsLoading(false);
              return;
            }

            // Fetch all users if director/admin, otherwise just the current user
            let usersResult: User[];
            if (isEmployee(currentUserResult.role)) {
                usersResult = [currentUserResult];
            } else {
                usersResult = await db.query.users.findMany();
            }
            setUsers(usersResult);

            // Fetch tasks based on user role
            let tasksResult: Task[] = [];
            const allDbTasks = await db.query.tasks.findMany({
              with: {
                assignees: { with: { user: true } },
                subtasks: true,
                files: true,
                comments: { with: { author: true } },
                revisions: { with: { author: true } },
              }
            });

            tasksResult = allDbTasks.map(t => ({
              ...t,
              assignees: t.assignees.map(a => a.user),
            })) as Task[];

            if (isEmployee(currentUserResult.role)) {
              setAllTasks(tasksResult.filter(t => t.assignees.some(a => a.id === currentUserResult.id)));
            } else {
              setAllTasks(tasksResult);
            }
            
            // Fetch notifications
            const notificationsResult = await db.query.notifications.findMany({
                where: eq(schema.notifications.userId, firebaseUser.uid),
                orderBy: desc(schema.notifications.createdAt),
            });
            setNotifications(notificationsResult as Notification[]);

        } catch (error) {
            console.error("Failed to fetch data from NeonDB:", error);
            toast({
              variant: "destructive",
              title: "Failed to load data",
              description: "Could not connect to the database."
            })
        } finally {
            setIsLoading(false);
        }
    }, [firebaseUser, toast]);

    useEffect(() => {
        if (!isAuthLoading) {
            fetchData();
        }
    }, [isAuthLoading, firebaseUser, fetchData]);


    useEffect(() => {
        if (currentUserData?.id) {
          try {
            const savedDownloads = localStorage.getItem(`kreatask_downloads_${currentUserData.id}`);
            if (savedDownloads) setDownloadHistory(JSON.parse(savedDownloads));
            else setDownloadHistory([]);
          } catch (error) { console.error("Failed to load downloads:", error); }
        }
    }, [currentUserData?.id]);

    useEffect(() => {
      if (currentUserData?.id) {
        localStorage.setItem(`kreatask_downloads_${currentUserData.id}`, JSON.stringify(downloadHistory));
      }
    }, [downloadHistory, currentUserData?.id]);

    const leaderboardData = useMemo(() => calculateLeaderboard(allTasks, users), [allTasks, users]);

    const addTask = useCallback(async (taskData: Partial<Task>) => {
      const { assignees, subtasks: subtaskItems, files: fileItems, ...restOfTask } = taskData;
      
      await db.transaction(async (tx) => {
        const [newTask] = await tx.insert(schema.tasks).values(restOfTask as any).returning();
        
        if (assignees && assignees.length > 0) {
          await tx.insert(schema.tasksToUsers).values(assignees.map(user => ({
            taskId: newTask.id,
            userId: user.id,
          })));
        }
        if (subtaskItems && subtaskItems.length > 0) {
          await tx.insert(schema.subtasks).values(subtaskItems.map(st => ({...st, taskId: newTask.id})));
        }
        if (fileItems && fileItems.length > 0) {
          await tx.insert(schema.files).values(fileItems.map(f => ({...f, taskId: newTask.id})));
        }
      });
      await fetchData(); // Refetch data after adding
    }, [fetchData]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
      const { assignees, subtasks: subtaskItems, files: fileItems, revisions, ...restOfUpdates } = updates;
      
      await db.transaction(async (tx) => {
        if (Object.keys(restOfUpdates).length > 0) {
            await tx.update(schema.tasks).set(restOfUpdates as any).where(eq(schema.tasks.id, taskId));
        }

        if (assignees) {
            await tx.delete(schema.tasksToUsers).where(eq(schema.tasksToUsers.taskId, taskId));
            if (assignees.length > 0) {
                await tx.insert(schema.tasksToUsers).values(assignees.map(user => ({
                    taskId: taskId,
                    userId: user.id,
                })));
            }
        }
        
        if (revisions) {
            const newRevision = revisions[revisions.length - 1];
            if (newRevision) {
                await tx.insert(schema.revisions).values({
                    id: newRevision.id,
                    timestamp: new Date(newRevision.timestamp),
                    change: newRevision.change,
                    authorId: newRevision.author.id,
                    taskId: taskId,
                });
            }
        }
        
        if (subtaskItems) {
           await tx.delete(schema.subtasks).where(eq(schema.subtasks.taskId, taskId));
           if(subtaskItems.length > 0) {
               await tx.insert(schema.subtasks).values(subtaskItems.map(st => ({...st, taskId})));
           }
        }
      });
      await fetchData();
    }, [fetchData]);

    const deleteTask = useCallback(async (taskId: string) => {
        await db.delete(schema.tasks).where(eq(schema.tasks.id, taskId));
        await fetchData();
    }, [fetchData]);
    
    const updateUserInFirestore = useCallback(async (userId: string, data: Partial<User>) => {
        await db.update(schema.users).set(data).where(eq(schema.users.id, userId));
        await fetchData();
    }, [fetchData]);

    const deleteUser = useCallback(async (userId: string) => {
        await db.delete(schema.users).where(eq(schema.users.id, userId));
        await fetchData();
    }, [fetchData]);

    const addNotification = useCallback(async (notificationData: Partial<Notification>) => {
        await db.insert(schema.notifications).values(notificationData as any);
        await fetchData();
    }, [fetchData]);
    
    const updateNotifications = useCallback(async (notificationsToUpdate: Notification[]) => {
      await db.transaction(async (tx) => {
        for (const notif of notificationsToUpdate) {
            await tx.update(schema.notifications)
              .set({ read: notif.read })
              .where(eq(schema.notifications.id, notif.id));
        }
      });
      await fetchData();
    }, [fetchData]);

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
        isLoading: isLoading || isAuthLoading,
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
        setAllTasks: setAllTasks, 
        setUsers: setUsers,
        refetchData: fetchData,
    }), [
        isLoading, isAuthLoading,
        allTasks, users, currentUserData, leaderboardData, notifications, 
        downloadHistory, addTask, updateTask, deleteTask, 
        addNotification, updateUserInFirestore, deleteUser, addToDownloadHistory, updateNotifications, fetchData
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

    