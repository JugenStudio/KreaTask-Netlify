
import type { Notification } from './types';
import { UserRole } from './types';

// Data notifikasi dummy untuk simulasi
// User IDs:
// user-1: Direktur Utama (Naufal)
// user-2: Direktur Operasional (Deva)
// user-3: Jurnalis (Agus)

export const mockNotifications: Notification[] = [
  // --- Notifikasi untuk Direktur Utama (user-1) ---
  {
    id: 'notif-1',
    userId: 'user-1',
    message: 'AI menyarankan nilai 20 poin untuk tugas "Revisi Artikel Mingguan". Mohon verifikasi.',
    type: 'AI_SUGGESTION',
    read: false,
    link: '/performance-report',
    taskId: 'task-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 menit yang lalu
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    message: 'Top performer bulan ini adalah Deva dengan 320 poin.',
    type: 'PERFORMANCE_ALERT',
    read: true,
    link: '/leaderboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 hari yang lalu
  },
  {
    id: 'notif-6',
    userId: 'user-1',
    message: 'Tugas "Prepare Q4 Marketing Strategy" oleh Citra menunggu validasi nilai.',
    type: 'VALIDATION_REQUEST',
    read: false,
    link: '/performance-report',
    taskId: 'task-15',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 menit yang lalu
  },

  // --- Notifikasi untuk Direktur Operasional (user-2) ---
  {
    id: 'notif-3',
    userId: 'user-2', 
    message: 'Tugas "Create Social Media Content Plan" dari Sasi selesai dan menunggu validasi nilai.',
    type: 'VALIDATION_REQUEST',
    read: false,
    link: '/performance-report',
    taskId: 'task-6',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 jam yang lalu
  },
  {
    id: 'notif-7',
    userId: 'user-2', 
    message: 'Naufal (Direktur Utama) telah menyetujui nilai untuk tugas "Design Promotional Banner".',
    type: 'TASK_APPROVED',
    read: true,
    link: '/performance-report',
    taskId: 'task-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 jam yang lalu
  },

  // --- Notifikasi untuk Jurnalis (user-3) ---
  {
    id: 'notif-2',
    userId: 'user-3',
    message: 'Tugas "Design Promotional Banner" telah disetujui dengan nilai 20 Poin.',
    type: 'TASK_APPROVED',
    read: false,
    link: '/performance-report',
    taskId: 'task-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 jam yang lalu
  },
  {
    id: 'notif-4',
    userId: 'user-3',
    message: 'Anda mendapat tugas baru: "Wawancara dengan CEO Tech Corp".',
    type: 'TASK_ASSIGN',
    read: true,
    link: '/tasks/task-new-1', // Contoh link ke tugas baru
    taskId: 'task-new-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 hari yang lalu
  },
  {
    id: 'notif-8',
    userId: 'user-3',
    message: 'Tugas "Tulis Artikel Tren Teknologi Q3" akan jatuh tempo dalam 3 hari.',
    type: 'SYSTEM_UPDATE', // Seharusnya TASK_DUE_SOON, tapi kita gunakan yg ada
    read: false,
    link: '/tasks/task-3',
    taskId: 'task-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];
