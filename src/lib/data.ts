

import type { User, Task, LeaderboardEntry, DetailedReportEntry } from './types';
import { TaskCategory, UserRole } from './types';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const users: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE },
];

export const allTasks: Task[] = [
  // Completed Tasks
  {
    id: 'task-1',
    title: { en: 'Design Promotional Banner', id: 'Desain Banner Promosi' },
    description: { en: 'Create a promotional banner for the upcoming event.', id: 'Membuat desain banner untuk event promo bulan ini.' },
    assignees: [users.find(u => u.name === "Ariya")!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-08-12',
    createdAt: '2024-08-01',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "Direktur Operasional",
    approvedBy: "Direktur Utama",
    revisions: [], comments: [], files: [],
  },
  {
    id: 'task-2',
    title: { en: 'Revise Weekly Article', id: 'Revisi Artikel Mingguan' },
    description: { en: 'Perform revisions on the weekly article for the company blog.', id: 'Melakukan revisi artikel mingguan untuk blog perusahaan.' },
    assignees: [users.find(u => u.name === "Agus")!],
    status: 'Completed',
    category: TaskCategory.Low,
    dueDate: '2024-08-10',
    createdAt: '2024-08-02',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null, // Pending approval
    revisions: [], comments: [], files: [],
  },
  {
    id: 'task-3',
    title: { en: 'Write Q3 Tech Trends Article', id: 'Tulis Artikel Tren Teknologi Q3' },
    description: { en: 'Draft a 2000-word article on the major technology trends of the third quarter.', id: 'Buat draf artikel 2000 kata tentang tren teknologi utama kuartal ketiga.' },
    status: 'Completed',
    assignees: [users.find(u => u.role === UserRole.JURNALIS)!],
    dueDate: '2024-08-15',
    createdAt: '2024-07-20',
    category: TaskCategory.High,
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "Direktur Utama",
    approvedBy: "Direktur Utama",
    revisions: [], comments: [], files: [],
  },
  // In-Progress / To-do Tasks
  {
    id: 'task-4',
    title: { en: 'Produce Client Presentation Video', id: 'Produksi Video Presentasi Klien' },
    description: { en: 'Produce a short video for a marketing client presentation.', id: 'Produksi video pendek untuk presentasi client marketing.' },
    assignees: [users.find(u => u.name === "Citra")!],
    status: 'In Progress',
    category: TaskCategory.High,
    dueDate: '2024-09-20',
    createdAt: '2024-09-01',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "Direktur Utama", // Placeholder, as it's not completed
    approvedBy: null,
    revisions: [], comments: [], files: [],
  },
  {
    id: 'task-5',
    title: { en: 'Prepare Monthly Budget Report', id: 'Siapkan Laporan Anggaran Bulanan' },
    description: { en: 'Compile all departmental expenses and prepare the comprehensive budget report for August 2024.', id: 'Kompilasi semua pengeluaran departemen dan siapkan laporan anggaran komprehensif untuk Agustus 2024.' },
    status: 'To-do',
    assignees: [users.find(u => u.role === UserRole.FINANCE)!],
    dueDate: '2024-09-25',
    createdAt: '2024-09-15',
    category: TaskCategory.Critical,
    valueCategory: "Tinggi",
    value: 50, // Critical tasks can have higher value
    evaluator: "Direktur Utama",
    approvedBy: null,
    revisions: [], comments: [], files: [],
  },
];


// --- Duplicated data for other pages that might use it ---
export const tasks: Task[] = allTasks;

// Calculate scores for leaderboard based on the new 'value' system
const userScores: { [key: string]: { name: string; score: number; tasksCompleted: number; avatarUrl: string; role: UserRole; } } = {};

users.forEach(user => {
  userScores[user.id] = { name: user.name, score: 0, tasksCompleted: 0, avatarUrl: user.avatarUrl, role: user.role };
});

tasks.forEach(task => {
  // Only count completed tasks for the score
  if (task.status === 'Completed') {
    task.assignees.forEach(assignee => {
      if (assignee && userScores[assignee.id]) {
        userScores[assignee.id].score += task.value; // Use 'value' instead of 'totalPoints'
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
  avatarUrl: data.avatarUrl,
  role: data.role,
}));

// This data is now legacy and might be removed or refactored.
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
      taskScore: task.value,
      aiJustification: { en: 'Justification placeholder', id: 'Placeholder justifikasi' },
      reviewer: task.evaluator,
      assessmentDate: new Date().toISOString().split('T')[0],
    };
  })
  .filter((item): item is DetailedReportEntry => item !== null);
