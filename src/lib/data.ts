
import type { User, Task, LeaderboardEntry, DetailedReportEntry, Notification } from './types';
import { TaskCategory, UserRole } from './types';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

const users: User[] = [
  { id: 'user-1', name: 'Naufal', email: 'naufal@kreatask.com', avatarUrl: getAvatarUrl(1), role: UserRole.DIREKTUR_UTAMA },
  { id: 'user-2', name: 'Deva', email: 'deva@kreatask.com', avatarUrl: getAvatarUrl(2), role: UserRole.DIREKTUR_OPERASIONAL },
  { id: 'user-3', name: 'Agus', email: 'agus@kreatask.com', avatarUrl: getAvatarUrl(3), role: UserRole.JURNALIS },
  { id: 'user-4', name: 'Sasi', email: 'sasi@kreatask.com', avatarUrl: getAvatarUrl(4), role: UserRole.SOCIAL_MEDIA_OFFICER },
  { id: 'user-5', name: 'Ariya', email: 'ariya@kreatask.com', avatarUrl: getAvatarUrl(5), role: UserRole.DESAIN_GRAFIS },
  { id: 'user-9', name: 'Citra', email: 'citra@kreatask.com', avatarUrl: getAvatarUrl(9), role: UserRole.MARKETING },
  { id: 'user-10', name: 'Doni', email: 'doni@kreatask.com', avatarUrl: getAvatarUrl(10), role: UserRole.FINANCE },
  { id: 'user-11', name: 'Budi', email: 'budi@kreatask.com', avatarUrl: getAvatarUrl(11), role: UserRole.UNASSIGNED },
];

const allTasks: Task[] = [
  // Completed Tasks - Approved
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
    evaluator: "AI",
    approvedBy: "Direktur Utama",
    revisions: [], comments: [], files: [],
    subtasks: [
      { id: 'sub-1-1', title: 'Gather assets', isCompleted: true },
      { id: 'sub-1-2', title: 'Create initial draft', isCompleted: true },
      { id: 'sub-1-3', title: 'Finalize design', isCompleted: true },
    ],
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
    evaluator: "AI",
    approvedBy: "Direktur Utama",
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-15-deva',
    title: { en: 'Review Operational Workflows', id: 'Tinjau Alur Kerja Operasional' },
    description: { en: 'Review and optimize the current operational workflows for Q4.', id: 'Tinjau dan optimalkan alur kerja operasional saat ini untuk Q4.' },
    assignees: [users.find(u => u.name === "Deva")!],
    status: 'Completed',
    category: TaskCategory.High,
    dueDate: '2024-09-05',
    createdAt: '2024-09-01',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: "Direktur Utama",
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  // Completed Tasks - Pending Validation
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
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-6',
    title: { en: 'Create Social Media Content Plan', id: 'Buat Rencana Konten Media Sosial' },
    description: { en: 'Develop a content plan for all social media channels for the next month.', id: 'Mengembangkan rencana konten untuk semua saluran media sosial untuk bulan depan.' },
    assignees: [users.find(u => u.role === UserRole.SOCIAL_MEDIA_OFFICER)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-18',
    createdAt: '2024-09-10',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-7',
    title: { en: 'Analyze Competitor Keywords', id: 'Analisis Kata Kunci Kompetitor' },
    description: { en: 'Research and analyze the top keywords used by main competitors.', id: 'Riset dan analisis kata kunci utama yang digunakan oleh kompetitor utama.' },
    assignees: [users.find(u => u.role === UserRole.MARKETING)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-22',
    createdAt: '2024-09-15',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-8',
    title: { en: 'Create Infographic for Social Media', id: 'Buat Infografis untuk Media Sosial' },
    description: { en: 'Design an infographic about the impact of our latest project.', id: 'Rancang infografis tentang dampak proyek terbaru kami.' },
    assignees: [users.find(u => u.role === UserRole.DESAIN_GRAFIS)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-21',
    createdAt: '2024-09-14',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-9',
    title: { en: 'Publish Press Release', id: 'Publikasikan Siaran Pers' },
    description: { en: 'Write and publish a press release for the new product launch.', id: 'Tulis dan publikasikan siaran pers untuk peluncuran produk baru.' },
    assignees: [users.find(u => u.role === UserRole.JURNALIS)!],
    status: 'Completed',
    category: TaskCategory.High,
    dueDate: '2024-09-20',
    createdAt: '2024-09-12',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-10',
    title: { en: 'Verify September Invoices', id: 'Verifikasi Faktur September' },
    description: { en: 'Check and verify all incoming and outgoing invoices for September.', id: 'Periksa dan verifikasi semua faktur masuk dan keluar untuk bulan September.' },
    assignees: [users.find(u => u.role === UserRole.FINANCE)!],
    status: 'Completed',
    category: TaskCategory.Low,
    dueDate: '2024-09-19',
    createdAt: '2024-09-18',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-11',
    title: { en: 'Update Company Website FAQ', id: 'Perbarui FAQ Situs Web Perusahaan' },
    description: { en: 'Update the Frequently Asked Questions page on the company website with new information.', id: 'Perbarui halaman Pertanyaan yang Sering Diajukan di situs web perusahaan dengan informasi baru.' },
    assignees: [users.find(u => u.role === UserRole.JURNALIS)!],
    status: 'Completed',
    category: TaskCategory.Low,
    dueDate: '2024-09-25',
    createdAt: '2024-09-20',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-12',
    title: { en: 'Design social media campaign visuals', id: 'Desain visual kampanye media sosial' },
    description: { en: 'Create visuals for the upcoming Q4 social media campaign.', id: 'Buat visual untuk kampanye media sosial Q4 mendatang.' },
    assignees: [users.find(u => u.role === UserRole.DESAIN_GRAFIS)!],
    status: 'Completed',
    category: TaskCategory.High,
    dueDate: '2024-09-28',
    createdAt: '2024-09-22',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-13',
    title: { en: 'Organize team building event', id: 'Atur acara membangun tim' },
    description: { en: 'Plan and organize a team building event for the end of the quarter.', id: 'Rencanakan dan atur acara membangun tim untuk akhir kuartal.' },
    assignees: [users.find(u => u.role === UserRole.SOCIAL_MEDIA_OFFICER)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-27',
    createdAt: '2024-09-21',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  {
    id: 'task-14',
    title: { en: 'Research new marketing channels', id: 'Riset saluran pemasaran baru' },
    description: { en: 'Identify and research potential new marketing channels to reach a wider audience.', id: 'Identifikasi dan riset saluran pemasaran baru yang potensial untuk menjangkau audiens yang lebih luas.' },
    assignees: [users.find(u => u.role === UserRole.MARKETING)!],
    status: 'Completed',
    category: TaskCategory.High,
    dueDate: '2024-09-26',
    createdAt: '2024-09-20',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
  // In-Progress / To-do Tasks
  {
    id: 'task-4',
    title: { en: 'Produce Client Presentation Video', id: 'Produksi Video Presentasi Klien' },
    description: { en: 'Produce a short video for a marketing client presentation.', id: 'Produksi video pendek untuk presentasi client marketing.' },
    assignees: [users.find(u => u.name === "Citra")!],
    status: 'In Progress',
    category: TaskCategory.High,
    dueDate: '2024-09-30',
    createdAt: '2024-09-01',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI", 
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [
      { id: 'sub-4-1', title: 'Write script', isCompleted: true },
      { id: 'sub-4-2', title: 'Record voiceover', isCompleted: false },
      { id: 'sub-4-3', title: 'Edit video footage', isCompleted: false },
    ],
  },
  {
    id: 'task-5',
    title: { en: 'Prepare Monthly Budget Report', id: 'Siapkan Laporan Anggaran Bulanan' },
    description: { en: 'Compile all departmental expenses and prepare the comprehensive budget report for August 2024.', id: 'Kompilasi semua pengeluaran departemen dan siapkan laporan anggaran komprehensif untuk Agustus 2024.' },
    status: 'To-do',
    assignees: [users.find(u => u.role === UserRole.FINANCE)!],
    dueDate: '2024-09-29',
    createdAt: '2024-09-15',
    category: TaskCategory.Critical,
    valueCategory: "Tinggi",
    value: 50,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], comments: [], files: [],
    subtasks: [],
  },
];

const mockNotifications: Notification[] = [
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
    message: 'Top performer bulan ini adalah Ariya dengan 60 poin. Lihat papan peringkat untuk detailnya.',
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
    message: 'Tugas Anda "Design Promotional Banner" telah disetujui dengan nilai 20 Poin.',
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


export const initialData = {
    users,
    allTasks,
    mockNotifications
}

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
