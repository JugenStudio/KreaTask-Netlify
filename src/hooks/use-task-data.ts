
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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
    const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: UserRole; } } = {};

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


export function useTaskData() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersQuery);

  const tasksQuery = useMemoFirebase(() => {
    if (!authUser) return null;
    return collection(firestore, 'users', authUser.uid, 'tasks');
  }, [firestore, authUser]);
  const { data: allTasks, isLoading: isTasksLoading } = useCollection<Task>(tasksQuery);
  
  const notificationsQuery = useMemoFirebase(() => {
    if (!authUser) return null;
    return collection(firestore, 'users', authUser.uid, 'notifications');
  }, [firestore, authUser]);
  const { data: notifications, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsQuery);

  const [downloadHistory, setDownloadHistoryState] = useState<DownloadItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const isLoading = isUserLoading || isUsersLoading || isTasksLoading || isNotifsLoading;

  useEffect(() => {
    if (authUser?.uid) {
        try {
            const storedDownloads = localStorage.getItem(`kreatask_downloads_${authUser.uid}`);
            const downloads = storedDownloads ? JSON.parse(storedDownloads) : [];
            setDownloadHistoryState(downloads);
        } catch (error) {
            console.error("Failed to parse user-specific downloads from localStorage", error);
            setDownloadHistoryState([]);
        }
    }
  }, [authUser?.uid]);


  useEffect(() => {
    if (allTasks && users) {
      const newLeaderboard = calculateLeaderboard(allTasks, users);
      setLeaderboardData(newLeaderboard);
    }
  }, [allTasks, users]);


  const updateLocalStorage = (key: string, data: any) => {
      try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(data));
          }
      } catch (error) {
          console.error(`Failed to update localStorage for key: ${key}`, error);
      }
  };

  const setUsers = (newUsers: User[]) => {
    newUsers.forEach(user => {
      const userRef = doc(firestore, 'users', user.id);
      updateDocumentNonBlocking(userRef, user);
    });
    // The useCollection hook will update the state automatically, no need for setUsersState
  };

  const setNotifications = (newNotifications: Notification[]) => {
    if (!notifications || !authUser) return;
    newNotifications.forEach(notification => {
        const notifRef = doc(firestore, 'users', authUser.uid, 'notifications', notification.id);
        updateDocumentNonBlocking(notifRef, notification);
    });
  };

  const setDownloadHistory = useCallback((newHistory: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => {
    if (authUser?.uid) {
        setDownloadHistoryState(prevState => {
            const updatedState = typeof newHistory === 'function' ? newHistory(prevState) : newHistory;
            updateLocalStorage(`kreatask_downloads_${authUser.uid}`, updatedState);
            return updatedState;
        });
    }
  }, [authUser?.uid]);
  
  const addTask = (newTask: Omit<Task, 'id'>) => {
    if (!authUser) return;
    const tasksColRef = collection(firestore, 'users', authUser.uid, 'tasks');
    addDocumentNonBlocking(tasksColRef, newTask);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!authUser) return;
    const taskRef = doc(firestore, 'users', authUser.uid, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, updates);
  };

  const deleteTask = (taskId: string) => {
    if (!authUser) return;
    const taskRef = doc(firestore, 'users', authUser.uid, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  const addNotification = useCallback((newNotification: Omit<Notification, 'id'>) => {
    if (!authUser) return;
    const notifColRef = collection(firestore, 'users', newNotification.userId, 'notifications');
    addDocumentNonBlocking(notifColRef, newNotification);
  }, [firestore, authUser]);

  const addToDownloadHistory = useCallback((file: { name: string; size: string, url: string }, taskName: string, isRedownload = false) => {
    if (!authUser) return;

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
    
    if (isRedownload) {
      setDownloadHistory(prevHistory => {
        const existingItemIndex = prevHistory.findIndex(item => item.fileName === file.name && item.taskName === taskName);
        if (existingItemIndex > -1) {
          const updatedHistory = [...prevHistory];
          updatedHistory[existingItemIndex] = newDownloadItem;
          return updatedHistory;
        }
        return [newDownloadItem, ...prevHistory];
      });
    } else {
       setDownloadHistory(prevHistory => [newDownloadItem, ...prevHistory]);
    }

  }, [authUser, setDownloadHistory]);


  return { 
    isLoading, 
    allTasks: allTasks || [], 
    users: users || [],
    leaderboardData, 
    notifications: notifications || [],
    downloadHistory,
    setUsers,
    setAllTasks: (tasks: Task[]) => { 
        if(!authUser) return;
        tasks.forEach(t => updateTask(t.id, t))
    }, 
    setNotifications,
    setDownloadHistory,
    addTask,
    updateTask,
    deleteTask,
    addNotification,
    addToDownloadHistory,
  };
}
