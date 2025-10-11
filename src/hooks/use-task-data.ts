
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, User, LeaderboardEntry, Notification } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
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

  // Step 1: Fetch tasks for the current user.
  // This is efficient as it targets a specific user's subcollection.
  const tasksQuery = useMemoFirebase(() => {
    if (isUserLoading || !authUser) {
      return null;
    }
    return collection(firestore, 'users', authUser.uid, 'tasks');
  }, [firestore, authUser, isUserLoading]);
  const { data: allTasks, isLoading: isTasksLoading } = useCollection<Task>(tasksQuery);
  
  // Step 2: Fetch notifications.
  const notificationsQuery = useMemoFirebase(() => {
    if (isUserLoading || !authUser) {
      return null;
    }
    return collection(firestore, 'users', authUser.uid, 'notifications');
  }, [firestore, authUser, isUserLoading]);
  const { data: notifications, isLoading: isNotifsLoading } = useCollection<Notification>(notificationsQuery);
  
  // Step 3: Fetch users dynamically based on tasks.
  const [users, setUsersState] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  useEffect(() => {
    if (!allTasks || !firestore || !authUser) {
      // If there are no tasks or auth is not ready, we might not need to fetch users.
      // But we should at least have the current user.
      if (authUser) {
        setUsersState([authUser as User]);
      }
      setIsUsersLoading(isUserLoading); // Reflect auth loading state
      return;
    }

    const fetchUsers = async () => {
      setIsUsersLoading(true);
      // Collect all unique user IDs from all task assignees.
      const userIds = new Set<string>();
      allTasks.forEach(task => {
        task.assignees.forEach(assignee => userIds.add(assignee.id));
      });
      // Always include the current authenticated user.
      userIds.add(authUser.uid);

      if (userIds.size === 0) {
        setUsersState([]);
        setIsUsersLoading(false);
        return;
      }
      
      // Fetch user documents for the collected IDs.
      // Firestore 'in' query is limited to 30 items per query.
      const userIdsArray = Array.from(userIds);
      const userPromises = [];
      for (let i = 0; i < userIdsArray.length; i += 30) {
        const chunk = userIdsArray.slice(i, i + 30);
        const q = query(collection(firestore, "users"), where("id", "in", chunk));
        userPromises.push(getDocs(q));
      }

      try {
        const userSnapshots = await Promise.all(userPromises);
        const fetchedUsers = userSnapshots.flatMap(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
        );
        
        // Ensure the current user is in the list, even if they have no tasks.
        if (!fetchedUsers.some(u => u.id === authUser.uid)) {
            fetchedUsers.push(authUser as User);
        }

        setUsersState(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to at least the current user
        setUsersState([authUser as User]);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, [allTasks, firestore, authUser, isUserLoading]);


  const [downloadHistory, setDownloadHistoryState] = useState<DownloadItem[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  const isLoading = isUserLoading || isTasksLoading || isUsersLoading || isNotifsLoading;

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
