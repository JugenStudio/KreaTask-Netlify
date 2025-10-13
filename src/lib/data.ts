
import type { User, Task } from './types';
import { UserRole } from './types';

// NOTE: This file is now used only for seeding data for the first time.
// The primary source of truth for application data is Firebase Firestore.
// The useTaskData hook is responsible for fetching and managing live data.

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA, jabatan: 'Direktur Utama' },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL, jabatan: 'Direktur Operasional' },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS, jabatan: 'Jurnalis' },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER, jabatan: 'Social Media Officer' },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS, jabatan: 'Desain Grafis' },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING, jabatan: 'Marketing' },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE, jabatan: 'Finance' },
  { id: 'user-11', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(11), role: UserRole.UNASSIGNED, jabatan: 'Unassigned' },
];

// This data is for fallback or initial seeding only.
export const initialTasks: Task[] = [];

// The initialData export is now primarily for seeding.
export const initialData = {
    users: initialUsers,
    allTasks: initialTasks,
    mockNotifications: [],
}
