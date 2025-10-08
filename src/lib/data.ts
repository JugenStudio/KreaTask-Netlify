import type { User, Task, Notification, LocalizedString, LeaderboardEntry, DetailedReportEntry } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const users: User[] = [
  { id: 'user-1', name: 'Admin Ali', email: 'ali@kreatask.com', avatarUrl: getAvatarUrl(1), role: 'Administrator' },
  { id: 'user-2', name: 'Leader Lena', email: 'lena@kreatask.com', avatarUrl: getAvatarUrl(2), role: 'Team Leader' },
  { id: 'user-3', name: 'Member Mo', email: 'mo@kreatask.com', avatarUrl: getAvatarUrl(3), role: 'Team Member' },
  { id: 'user-4', name: 'Member Mia', email: 'mia@kreatask.com', avatarUrl: getAvatarUrl(4), role: 'Team Member' },
  { id: 'user-5', name: 'Charlie Day', email: 'charlie@kreatask.com', avatarUrl: getAvatarUrl(5), role: 'Team Member' },
  { id: 'user-6', name: 'Rina', email: 'rina@kreatask.com', avatarUrl: getAvatarUrl(6), role: 'Team Member' },
  { id: 'user-7', name: 'Fadil', email: 'fadil@kreatask.com', avatarUrl: getAvatarUrl(7), role: 'Team Member' },
  { id: 'user-8', name: 'Andika', email: 'andika@kreatask.com', avatarUrl: getAvatarUrl(8), role: 'Team Member' },
  { id: 'user-9', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(9), role: 'Team Member' },
  { id: 'user-10', name: 'Siti', email: 'siti@kreatask.com', avatarUrl: getAvatarUrl(10), role: 'Team Member' },
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: {
      en: 'Design new logo concept',
      id: 'Rancang konsep logo baru'
    },
    description: {
      en: 'Create three new logo concepts for the rebranding project. Focus on modern and minimalist designs.',
      id: 'Buat tiga konsep logo baru untuk proyek rebranding. Fokus pada desain modern dan minimalis.'
    },
    status: 'Completed',
    assignees: [users[5]], // Rina
    dueDate: '2024-08-15',
    createdAt: '2024-07-20',
    category: 'High',
    basePoints: 40,
    bonusPoints: 5,
    penaltyPoints: 0,
    totalPoints: 45,
    revisions: [],
    comments: [],
    files: [],
  },
  {
    id: 'task-2',
    title: {
      en: 'Develop landing page animation',
      id: 'Kembangkan animasi halaman arahan'
    },
    description: {
      en: 'Code the hero section animation using Framer Motion. The animation should be smooth and engaging.',
      id: 'Buat kode animasi bagian hero menggunakan Framer Motion. Animasinya harus mulus dan menarik.'
    },
    status: 'Completed',
    assignees: [users[5]], // Rina
    dueDate: '2024-08-10',
    createdAt: '2024-07-18',
    category: 'Medium',
    basePoints: 20,
    bonusPoints: 5,
    penaltyPoints: 0,
    totalPoints: 25,
    revisions: [],
    comments: [],
    files: [],
  },
  {
    id: 'task-3',
    title: {
      en: 'Write blog post on "The Future of AI"',
      id: 'Tulis postingan blog tentang "Masa Depan AI"'
    },
    description: {
      en: 'Draft a 1500-word blog post. Include insights from recent industry reports.',
      id: 'Tulis draf postingan blog 1500 kata. Sertakan wawasan dari laporan industri terbaru.'
    },
    status: 'Completed',
    assignees: [users[6]], // Fadil
    dueDate: '2024-08-05',
    createdAt: '2024-07-15',
    category: 'Medium',
    basePoints: 20,
    bonusPoints: 5,
    penaltyPoints: 0,
    totalPoints: 25,
    revisions: [],
    comments: [],
    files: [],
  },
  {
    id: 'task-4',
    title: {
      en: 'User Authentication Flow',
      id: 'Alur Otentikasi Pengguna'
    },
    description: {
      en: 'Set up Firebase Authentication and create the login/signup pages.',
      id: 'Siapkan Otentikasi Firebase dan buat halaman login/daftar.'
    },
    status: 'Completed',
    assignees: [users[7]], // Andika
    dueDate: '2024-08-25',
    createdAt: '2024-07-25',
    category: 'High',
    basePoints: 40,
    bonusPoints: 0,
    penaltyPoints: 5, // Late
    totalPoints: 35,
    revisions: [],
    comments: [],
    files: [],
  },
   {
    id: 'task-5',
    title: {
      en: 'API Integration for Payment Gateway',
      id: 'Integrasi API untuk Gerbang Pembayaran'
    },
    description: {
      en: 'Integrate Stripe API for handling subscription payments.',
      id: 'Integrasikan API Stripe untuk menangani pembayaran langganan.'
    },
    status: 'In Progress',
    assignees: [users[8]], // Budi
    dueDate: '2024-08-20',
    createdAt: '2024-07-22',
    category: 'Critical',
    basePoints: 50,
    bonusPoints: 0,
    penaltyPoints: 0,
    totalPoints: 50,
    revisions: [],
    comments: [],
    files: [],
  },
  {
    id: 'task-6',
    title: {
      en: 'Update documentation',
      id: 'Perbarui dokumentasi'
    },
    description: {
      en: 'Update the user guide with the new features.',
      id: 'Perbarui panduan pengguna dengan fitur-fitur baru.'
    },
    status: 'Completed',
    assignees: [users[9]], // Siti
    dueDate: '2024-08-18',
    createdAt: '2024-08-10',
    category: 'Low',
    basePoints: 10,
    bonusPoints: 5,
    penaltyPoints: 0,
    totalPoints: 15,
    revisions: [],
    comments: [],
    files: [],
  },
];

export const notifications: Notification[] = [
  { id: 'notif-1', type: 'status-change', title: { en: 'Task Status Updated', id: 'Status Tugas Diperbarui' }, description: { en: 'Your task "Design new logo concept" was moved to In Review.', id: 'Tugas Anda "Rancang konsep logo baru" dipindahkan ke Dalam Tinjauan.' }, timestamp: '2024-07-25T10:00:00Z', isRead: false },
  { id: 'notif-2', type: 'comment', title: { en: 'New Comment', id: 'Komentar Baru' }, description: { en: 'Lena commented on "Develop landing page animation".', id: 'Lena mengomentari "Kembangkan animasi halaman arahan".' }, timestamp: '2024-07-25T09:30:00Z', isRead: false },
  { id: 'notif-3', type: 'task-assigned', title: { en: 'New Task Assigned', id: 'Tugas Baru Ditetapkan' }, description: { en: 'You have been assigned to "User Authentication Flow".', id: 'Anda telah ditugaskan untuk "Alur Otentikasi Pengguna".' }, timestamp: '2024-07-25T08:00:00Z', isRead: true },
];

// Calculate scores for leaderboard
const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string } } = {};

users.forEach(user => {
  userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl };
});

tasks.forEach(task => {
  if (task.status === 'Completed') {
    task.assignees.forEach(assignee => {
      if (userScores[assignee.id]) {
        userScores[assignee.id].score += task.totalPoints;
        userScores[assignee.id].tasksCompleted += 1;
      }
    });
  }
});

const sortedUsers = Object.entries(userScores).sort(([, a], [, b]) => b.score - a.score);

export const leaderboardData: LeaderboardEntry[] = sortedUsers.map(([id, data], index) => ({
  id,
  rank: index + 1,
  name: data.name,
  score: data.score,
  tasksCompleted: data.tasksCompleted,
  avatarUrl: data.avatarUrl
}));


export const detailedReportData: DetailedReportEntry[] = [
  {
    id: 'report-1',
    employeeName: 'Rina',
    taskTitle: tasks[0].title,
    category: 'High',
    priority: 'High',
    deadline: '2024-08-15',
    completedOn: '2024-08-14',
    status: 'Selesai Tepat Waktu',
    revisions: 0,
    taskScore: 45,
    aiJustification: { en: 'Excellent work. Completed ahead of schedule, earning bonus points. No revisions needed.', id: 'Kerja bagus. Selesai lebih awal, mendapatkan poin bonus. Tidak perlu revisi.' },
    reviewer: 'Leader Lena',
    assessmentDate: '2024-08-15',
  },
  {
    id: 'report-2',
    employeeName: 'Fadil',
    taskTitle: tasks[2].title,
    category: 'Medium',
    priority: 'Medium',
    deadline: '2024-08-05',
    completedOn: '2024-08-05',
    status: 'Selesai Tepat Waktu',
    revisions: 0,
    taskScore: 25,
    aiJustification: { en: 'Task completed on the due date. Standard points awarded.', id: 'Tugas selesai pada tanggal jatuh tempo. Poin standar diberikan.' },
    reviewer: 'Leader Lena',
    assessmentDate: '2024-08-06',
  },
  {
    id: 'report-3',
    employeeName: 'Andika',
    taskTitle: tasks[3].title,
    category: 'High',
    priority: 'High',
    deadline: '2024-08-25',
    completedOn: '2024-08-26',
    status: 'Terlambat',
    revisions: 0,
    taskScore: 35,
    aiJustification: { en: 'Task was completed one day late, resulting in a penalty. No revisions were required.', id: 'Tugas selesai terlambat satu hari, mengakibatkan penalti. Tidak ada revisi yang diperlukan.' },
    reviewer: 'Leader Lena',
    assessmentDate: '2024-08-27',
  },
];
