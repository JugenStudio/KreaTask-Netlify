
"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/data';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Prevent execution on server
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
        // Fallback to initial data and clear potentially corrupted storage
        setAllTasks(initialData.allTasks);
        setUsersState(initialData.users);
        setNotificationsState(initialData.mockNotifications);
        localStorage.removeItem('kreatask_tasks');
        localStorage.removeItem('kreatask_users');
        localStorage.removeItem('kreatask_notifications');
    } finally {
        setIsLoading(false);
    }
  }, []);

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


  return { 
    isLoading, 
    allTasks, 
    users,
    leaderboardData, 
    notifications,
    setUsers,
    setAllTasks: setAllTasksAndStorage, 
    setNotifications,
    addTask,
    updateTask,
    deleteTask,
    addNotification
  };
}
