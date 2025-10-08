import type { User, Task, Notification, LocalizedString, LeaderboardEntry, DetailedReportEntry } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const users: User[] = [
  { id: 'user-1', name: 'Admin Ali', email: 'ali@kreatask.com', avatarUrl: getAvatarUrl(1), role: 'Administrator' },
  { id: 'user-2', name: 'Leader Lena', email: 'lena@kreatask.com', avatarUrl: getAvatarUrl(2), role: 'Team Leader' },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: 'Journalist' },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: 'Social Media Officer' },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: 'Graphic Designer' },
  { id: 'user-6', name: 'Rina', email: 'rina@kreatask.com', avatarUrl: getAvatarUrl(6), role: 'Team Member' },
  { id: 'user-7', name: 'Fadil', email: 'fadil@kreatask.com', avatarUrl: getAvatarUrl(7), role: 'Team Member' },
  { id: 'user-8', name: 'Andika', email: 'andika@kreatask.com', avatarUrl: getAvatarUrl(8), role: 'Team Member' },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: 'Marketing' },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: 'Finance' },
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    title: {
      en: 'Write article about Q3 tech trends',
      id: 'Tulis artikel tentang tren teknologi Q3'
    },
    description: {
      en: 'Draft a 2000-word article on the major technology trends of the third quarter. Include interviews with at least two industry experts.',
      id: 'Buat draf artikel 2000 kata tentang tren teknologi utama kuartal ketiga. Sertakan wawancara dengan setidaknya dua pakar industri.'
    },
    status: 'Completed',
    assignees: [users[2]], // Agus
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
      en: 'Create Instagram content for product launch',
      id: 'Buat konten Instagram untuk peluncuran produk'
    },
    description: {
      en: 'Design a 3-post Instagram carousel and 5 Instagram Stories for the new product launch. Must match brand guidelines.',
      id: 'Rancang 3 post carousel Instagram dan 5 Instagram Stories untuk peluncuran produk baru. Harus sesuai dengan pedoman merek.'
    },
    status: 'Completed',
    assignees: [users[3]], // Sasi
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
      en: 'Design promotional banner for webinar',
      id: 'Desain spanduk promosi untuk webinar'
    },
    description: {
      en: 'Create a set of digital banners (for website, social media, and email) to promote the upcoming webinar.',
      id: 'Buat satu set spanduk digital (untuk situs web, media sosial, dan email) untuk mempromosikan webinar yang akan datang.'
    },
    status: 'Completed',
    assignees: [users[4]], // Ariya
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
      en: 'Develop Q4 marketing strategy',
      id: 'Kembangkan strategi pemasaran Q4'
    },
    description: {
      en: 'Outline the marketing strategy for the fourth quarter, including campaign ideas, budget allocation, and target KPIs.',
      id: 'Gariskan strategi pemasaran untuk kuartal keempat, termasuk ide kampanye, alokasi anggaran, dan target KPI.'
    },
    status: 'In Progress',
    assignees: [users[8]], // Citra
    dueDate: '2024-08-25',
    createdAt: '2024-07-25',
    category: 'High',
    basePoints: 40,
    bonusPoints: 0,
    penaltyPoints: 0, 
    totalPoints: 40,
    revisions: [],
    comments: [],
    files: [],
  },
   {
    id: 'task-5',
    title: {
      en: 'Prepare monthly budget report',
      id: 'Siapkan laporan anggaran bulanan'
    },
    description: {
      en: 'Compile all departmental expenses and prepare the comprehensive budget report for July 2024.',
      id: 'Kompilasi semua pengeluaran departemen dan siapkan laporan anggaran komprehensif untuk Juli 2024.'
    },
    status: 'In Review',
    assignees: [users[9]], // Doni
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
      en: 'Research competitors for news feature',
      id: 'Riset kompetitor untuk fitur berita'
    },
    description: {
      en: 'Conduct research on three main competitors for an upcoming feature story on market disruption.',
      id: 'Lakukan riset terhadap tiga kompetitor utama untuk sebuah fitur berita yang akan datang tentang disrupsi pasar.'
    },
    status: 'Completed',
    assignees: [users[2]], // Agus
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
    employeeName: 'Agus',
    role: users.find(u => u.name === 'Agus')?.role || 'Team Member',
    taskTitle: tasks[0].title,
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
    employeeName: 'Sasi',
    role: users.find(u => u.name === 'Sasi')?.role || 'Team Member',
    taskTitle: tasks[1].title,
    priority: 'Medium',
    deadline: '2024-08-10',
    completedOn: '2024-08-10',
    status: 'Selesai Tepat Waktu',
    revisions: 0,
    taskScore: 25,
    aiJustification: { en: 'Task completed on the due date. Standard points awarded.', id: 'Tugas selesai pada tanggal jatuh tempo. Poin standar diberikan.' },
    reviewer: 'Leader Lena',
    assessmentDate: '2024-08-11',
  },
  {
    id: 'report-3',
    employeeName: 'Ariya',
    role: users.find(u => u.name === 'Ariya')?.role || 'Team Member',
    taskTitle: tasks[2].title,
    priority: 'Medium',
    deadline: '2024-08-05',
    completedOn: '2024-08-06',
    status: 'Terlambat',
    revisions: 1,
    taskScore: 15,
    aiJustification: { en: 'Task was completed one day late, resulting in a penalty. One revision was required.', id: 'Tugas selesai terlambat satu hari, mengakibatkan penalti. Diperlukan satu revisi.' },
    reviewer: 'Leader Lena',
    assessmentDate: '2024-08-07',
  },
];

    