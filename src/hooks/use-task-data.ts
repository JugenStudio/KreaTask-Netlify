

"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/data';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';

type DownloadItem = {
  id: number;
  fileName: string;
  taskName: string;
  date: string;
  size: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  progress: number;
};

const calculateLeaderboard = (tasks: Task[], users: User[]): LeaderboardEntry[] => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const [downloadHistory, setDownloadHistoryState] = useState<DownloadItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setCurrentUserId(parsedUser.id);
            } catch (e) {
                // if parsing fails, it might be an old format, we can default or clear it
            }
        } else {
            // If no user in session, maybe default to first user for initial load context
            const storedUsers = localStorage.getItem('kreatask_users');
            const users = storedUsers ? JSON.parse(storedUsers) : initialData.users;
            if (users.length > 0) {
              setCurrentUserId(users[0].id);
            }
        }
    }
  }, []);


  useEffect(() => {
    if (typeof window === 'undefined') {
        return;
    }
    
    try {
      const storedTasks = localStorage.getItem('kreatask_tasks');
      const storedUsers = localStorage.getItem('kreatask_users');
      const storedNotifications = localStorage.getItem('kreatask_notifications');
      
      const tasks = storedTasks ? JSON.parse(storedTasks) : initialData.allTasks;
      const users = storedUsers ? JSON.parse(storedUsers) : initialData.users;
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : initialData.mockNotifications;

      setAllTasks(tasks);
      setUsersState(users);
      setNotificationsState(notifications);

      if (!storedTasks) localStorage.setItem('kreatask_tasks', JSON.stringify(tasks));
      if (!storedUsers) localStorage.setItem('kreatask_users', JSON.stringify(users));
      if (!storedNotifications) localStorage.setItem('kreatask_notifications', JSON.stringify(notifications));

    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        setAllTasks(initialData.allTasks);
        setUsersState(initialData.users);
        setNotificationsState(initialData.mockNotifications);
        localStorage.clear(); // Clear potentially corrupted storage
    } finally {
        setIsLoading(false);
    }
  }, []);

   useEffect(() => {
    if (currentUserId) {
        try {
            const storedDownloads = localStorage.getItem(`kreatask_downloads_${currentUserId}`);
            // If nothing is in storage, start with an empty array.
            const downloads = storedDownloads ? JSON.parse(storedDownloads) : [];
            setDownloadHistoryState(downloads);
        } catch (error) {
            console.error("Failed to parse user-specific downloads from localStorage", error);
            setDownloadHistoryState([]);
        }
    }
  }, [currentUserId]);


  useEffect(() => {
    if (allTasks.length > 0 && users.length > 0) {
      const newLeaderboard = calculateLeaderboard(allTasks, users);
      setLeaderboardData(newLeaderboard);
    }
  }, [allTasks, users]);


  const updateLocalStorage = (key: string, data: any) => {
      try {
          localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
          console.error(`Failed to update localStorage for key: ${key}`, error);
      }
  };

  const setUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    updateLocalStorage('kreatask_users', newUsers);
  };

  const setAllTasksAndStorage = (newTasks: Task[]) => {
      setAllTasks(newTasks);
      updateLocalStorage('kreatask_tasks', newTasks);
  };

  const setNotifications = (newNotifications: Notification[]) => {
      setNotificationsState(newNotifications);
      updateLocalStorage('kreatask_notifications', newNotifications);
  };

  const setDownloadHistory = useCallback((newHistory: DownloadItem[] | ((prevState: DownloadItem[]) => DownloadItem[])) => {
    if (currentUserId) {
        setDownloadHistoryState(prevState => {
            const updatedState = typeof newHistory === 'function' ? newHistory(prevState) : newHistory;
            updateLocalStorage(`kreatask_downloads_${currentUserId}`, updatedState);
            return updatedState;
        });
    }
  }, [currentUserId]);
  
  const addTask = (newTask: Task) => {
    setAllTasks(prevTasks => {
        const updatedTasks = [newTask, ...prevTasks];
        updateLocalStorage('kreatask_tasks', updatedTasks);
        return updatedTasks;
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = allTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setAllTasksAndStorage(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = allTasks.filter(task => task.id !== taskId);
    setAllTasksAndStorage(updatedTasks);
  };

  const addNotification = useCallback((newNotification: Notification) => {
    setNotificationsState(prevNotifications => {
      const updatedNotifications = [newNotification, ...prevNotifications];
      updateLocalStorage('kreatask_notifications', updatedNotifications);
      return updatedNotifications;
    });
  }, []);

  const addToDownloadHistory = useCallback((file: { name: string; size: string }, taskName: string) => {
    if (!currentUserId) return;

    const newDownloadItem: DownloadItem = {
      id: Date.now(),
      fileName: file.name,
      taskName: taskName,
      date: new Date().toISOString(),
      size: file.size,
      status: 'In Progress',
      progress: 0,
    };

    setDownloadHistory(prevHistory => [newDownloadItem, ...prevHistory]);
  }, [currentUserId, setDownloadHistory]);


  return { 
    isLoading, 
    allTasks, 
    users,
    leaderboardData, 
    notifications,
    downloadHistory,
    setUsers,
    setAllTasks: setAllTasksAndStorage, 
    setNotifications,
    setDownloadHistory,
    addTask,
    updateTask,
    deleteTask,
    addNotification,
    addToDownloadHistory,
  };
}
