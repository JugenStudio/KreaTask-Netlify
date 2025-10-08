
import type { User, Task, LeaderboardEntry, DetailedReportEntry, UserRole } from './types';
import { TaskCategory } from './types';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const users: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: 'Direktur Utama' },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: 'Direktur Operasional' },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: 'Jurnalis' },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: 'Social Media Officer' },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: 'Desain Grafis' },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: 'Marketing' },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: 'Finance' },
];

export const allTasks: Task[] = [
  // Jurnalis Tasks
  {
    id: 'task-1',
    title: { en: 'Write article about Q3 tech trends', id: 'Tulis artikel tentang tren teknologi Q3' },
    description: { en: 'Draft a 2000-word article on the major technology trends of the third quarter.', id: 'Buat draf artikel 2000 kata tentang tren teknologi utama kuartal ketiga.' },
    status: 'Completed',
    assignees: [users.find(u => u.role === 'Jurnalis')!],
    dueDate: '2024-08-15',
    createdAt: '2024-07-20',
    category: TaskCategory.High,
    basePoints: 40, bonusPoints: 5, penaltyPoints: 0, totalPoints: 45,
    revisions: [], comments: [], files: [],
  },
  {
    id: 'task-6',
    title: { en: 'Research competitors for news feature', id: 'Riset kompetitor untuk fitur berita' },
    description: { en: 'Conduct research on three main competitors for an upcoming feature story.', id: 'Lakukan riset terhadap tiga kompetitor utama untuk sebuah fitur berita.' },
    status: 'In Progress',
    assignees: [users.find(u => u.role === 'Jurnalis')!],
    dueDate: '2024-09-18',
    createdAt: '2024-09-10',
    category: TaskCategory.Low,
    basePoints: 10, bonusPoints: 0, penaltyPoints: 0, totalPoints: 10,
    revisions: [], comments: [], files: [],
  },
  // Social Media Officer Tasks
  {
    id: 'task-2',
    title: { en: 'Create Instagram content for product launch', id: 'Buat konten Instagram untuk peluncuran produk' },
    description: { en: 'Design a 3-post Instagram carousel and 5 Instagram Stories for the new product launch.', id: 'Rancang 3 post carousel Instagram dan 5 Instagram Stories untuk peluncuran produk baru.' },
    status: 'Completed',
    assignees: [users.find(u => u.role === 'Social Media Officer')!],
    dueDate: '2024-08-10',
    createdAt: '2024-07-18',
    category: TaskCategory.Medium,
    basePoints: 20, bonusPoints: 5, penaltyPoints: 0, totalPoints: 25,
    revisions: [], comments: [], files: [],
  },
  // Desain Grafis Tasks
  {
    id: 'task-3',
    title: { en: 'Design promotional banner for webinar', id: 'Desain spanduk promosi untuk webinar' },
    description: { en: 'Create a set of digital banners (for website, social media, and email).', id: 'Buat satu set spanduk digital (untuk situs web, media sosial, dan email).' },
    status: 'Completed',
    assignees: [users.find(u => u.role === 'Desain Grafis')!],
    dueDate: '2024-08-05',
    createdAt: '2024-07-15',
    category: TaskCategory.Medium,
    basePoints: 20, bonusPoints: 5, penaltyPoints: 0, totalPoints: 25,
    revisions: [], comments: [], files: [],
  },
  // Marketing Tasks
  {
    id: 'task-4',
    title: { en: 'Develop Q4 marketing strategy', id: 'Kembangkan strategi pemasaran Q4' },
    description: { en: 'Outline the marketing strategy for the fourth quarter, including campaign ideas and budget.', id: 'Gariskan strategi pemasaran untuk kuartal keempat, termasuk ide kampanye dan anggaran.' },
    status: 'In Review',
    assignees: [users.find(u => u.role === 'Marketing')!],
    dueDate: '2024-08-25',
    createdAt: '2024-07-25',
    category: TaskCategory.High,
    basePoints: 40, bonusPoints: 0, penaltyPoints: 0, totalPoints: 40,
    revisions: [], comments: [], files: [],
  },
  // Finance Tasks
  {
    id: 'task-5',
    title: { en: 'Prepare monthly budget report', id: 'Siapkan laporan anggaran bulanan' },
    description: { en: 'Compile all departmental expenses and prepare the comprehensive budget report for July 2024.', id: 'Kompilasi semua pengeluaran departemen dan siapkan laporan anggaran komprehensif untuk Juli 2024.' },
    status: 'To-do',
    assignees: [users.find(u => u.role === 'Finance')!],
    dueDate: '2024-09-20',
    createdAt: '2024-09-15',
    category: TaskCategory.Critical,
    basePoints: 50, bonusPoints: 0, penaltyPoints: 0, totalPoints: 50,
    revisions: [], comments: [], files: [],
  },
];


// --- Duplicated data for other pages that might use it ---
export const tasks: Task[] = allTasks;

// Calculate scores for leaderboard
const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string } } = {};

users.forEach(user => {
  userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl };
});

tasks.forEach(task => {
  if (task.status === 'Completed') {
    task.assignees.forEach(assignee => {
      if (assignee && userScores[assignee.id]) {
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


export const detailedReportData: DetailedReportEntry[] = allTasks
  .filter(task => task.status === 'Completed' || new Date(task.dueDate) < new Date())
  .map((task, index): DetailedReportEntry | null => {
    const assignee = task.assignees[0];
    if (!assignee) return null;

    const isLate = new Date(task.dueDate) < new Date(task.createdAt); // Simplified logic
    const status = isLate ? 'Terlambat' : 'Selesai Tepat Waktu';

    return {
      id: `report-${index + 1}`,
      taskId: task.id,
      employeeName: assignee.name,
      role: assignee.role,
      taskTitle: task.title,
      priority: task.category,
      deadline: task.dueDate,
      completedOn: task.createdAt, // Simplified, assuming createdAt is completion date for completed tasks
      status: status,
      revisions: task.revisions.length,
      taskScore: task.totalPoints,
      aiJustification: { en: 'Justification placeholder', id: 'Placeholder justifikasi' },
      reviewer: 'Deva', // Direktur Operasional
      assessmentDate: new Date().toISOString().split('T')[0],
    };
  })
  .filter((item): item is DetailedReportEntry => item !== null);
