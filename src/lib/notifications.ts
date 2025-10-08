
import type { Notification } from './types';
import { UserRole } from './types';

// Data notifikasi dummy untuk simulasi
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1', // Direktur Utama
    message: 'AI menyarankan nilai 20 poin untuk tugas "Revisi Artikel Mingguan". Mohon verifikasi.',
    type: 'AI_SUGGESTION',
    read: false,
    link: '/performance-report',
    taskId: 'task-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 menit yang lalu
  },
  {
    id: 'notif-2',
    userId: 'user-3', // Jurnalis (Agus)
    message: 'Tugas "Design Promotional Banner" telah disetujui dengan nilai 20 Poin.',
    type: 'TASK_APPROVED',
    read: false,
    link: '/performance-report',
    taskId: 'task-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 jam yang lalu
  },
  {
    id: 'notif-3',
    userId: 'user-2', // Direktur Operasional
    message: 'Tugas "Create Social Media Content Plan" dari Sasi selesai dan menunggu validasi nilai.',
    type: 'VALIDATION_REQUEST',
    read: false,
    link: '/performance-report',
    taskId: 'task-6',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 jam yang lalu
  },
  {
    id: 'notif-4',
    userId: 'user-5', // Desain Grafis (Ariya)
    message: 'Anda mendapat tugas baru: "Buat Konsep Visual untuk Kampanye Q4".',
    type: 'TASK_ASSIGN',
    read: true,
    link: '/tasks/task-new-1', // Contoh link ke tugas baru
    taskId: 'task-new-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 hari yang lalu
  },
    {
    id: 'notif-5',
    userId: 'user-1', // Direktur Utama
    message: 'Top performer bulan ini adalah Deva dengan 320 poin.',
    type: 'PERFORMANCE_ALERT',
    read: true,
    link: '/leaderboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 hari yang lalu
  },
];
