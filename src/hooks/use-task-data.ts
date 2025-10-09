
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
    try {
      const storedTasks = sessionStorage.getItem('tasks');
      const storedUsers = sessionStorage.getItem('users');
      const storedNotifications = sessionStorage.getItem('notifications');

      const tasks = storedTasks ? JSON.parse(storedTasks) : initialData.allTasks;
      const users = storedUsers ? JSON.parse(storedUsers) : initialData.users;
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : initialData.mockNotifications;

      setAllTasks(tasks);
      setUsersState(users);
      setNotificationsState(notifications);

      if (!storedTasks) sessionStorage.setItem('tasks', JSON.stringify(tasks));
      if (!storedUsers) sessionStorage.setItem('users', JSON.stringify(users));
      if (!storedNotifications) sessionStorage.setItem('notifications', JSON.stringify(notifications));

    } catch (error) {
        console.error("Failed to parse data from sessionStorage", error);
        // Fallback to initial data
        setAllTasks(initialData.allTasks);
        setUsersState(initialData.users);
        setNotificationsState(initialData.mockNotifications);
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


  const updateSessionStorage = (key: string, data: any) => {
      try {
          sessionStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
          console.error(`Failed to update sessionStorage for key: ${key}`, error);
      }
  };

  const setUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    updateSessionStorage('users', newUsers);
  };

  const setAllTasksAndStorage = (newTasks: Task[]) => {
      setAllTasks(newTasks);
      updateSessionStorage('tasks', newTasks);
  };

  const setNotifications = (newNotifications: Notification[]) => {
      setNotificationsState(newNotifications);
      updateSessionStorage('notifications', newNotifications);
  };
  
  const addTask = (newTask: Task) => {
    setAllTasks(prevTasks => {
        const updatedTasks = [newTask, ...prevTasks];
        updateSessionStorage('tasks', updatedTasks);
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
      updateSessionStorage('notifications', updatedNotifications);
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
