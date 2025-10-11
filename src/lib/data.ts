
import type { User, Task, LeaderboardEntry, DetailedReportEntry, Notification, Comment } from './types';
import { TaskCategory, UserRole } from './types';

// NOTE: This file now contains only placeholder or initial seed data.
// The primary source of truth for application data is Firebase Firestore.
// The useTaskData hook is responsible for fetching and managing live data.

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE },
  { id: 'user-11', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(11), role: UserRole.UNASSIGNED },
];

// This data is for fallback or initial seeding only.
export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: { en: 'Design Promotional Banner', id: 'Desain Banner Promosi' },
    description: { en: 'Create a promotional banner for the upcoming event.', id: 'Membuat desain banner untuk event promo bulan ini.' },
    assignees: [initialUsers.find(u => u.name === "Ariya")!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-08-12',
    createdAt: '2024-08-01',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: "Direktur Utama",
    revisions: [], 
    comments: [], 
    files: [],
    subtasks: [],
  },
];

export const initialData = {
    users: initialUsers,
    allTasks: initialTasks,
    mockNotifications: [],
}

// The following exports are kept for potential backward compatibility but should be considered deprecated.
// The main logic now relies on the useTaskData hook which fetches live data.
export const users = initialUsers;
export const tasks: Task[] = initialTasks;
export const leaderboardData: LeaderboardEntry[] = [];
export const detailedReportData: DetailedReportEntry[] = [];
