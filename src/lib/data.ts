import type { User, Task, Notification } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/100/100`;

export const users: User[] = [
  { id: 'user-1', name: 'Admin Ali', email: 'ali@kreatask.com', avatarUrl: getAvatarUrl(1), role: 'Administrator' },
  { id: 'user-2', name: 'Leader Lena', email: 'lena@kreatask.com', avatarUrl: getAvatarUrl(2), role: 'Team Leader' },
  { id: 'user-3', name: 'Member Mo', email: 'mo@kreatask.com', avatarUrl: getAvatarUrl(3), role: 'Team Member' },
  { id: 'user-4', name: 'Member Mia', email: 'mia@kreatask.com', avatarUrl: getAvatarUrl(4), role: 'Team Member' },
  { id: 'user-5', name: 'Charlie Day', email: 'charlie@kreatask.com', avatarUrl: getAvatarUrl(5), role: 'Team Member' },
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
    status: 'In Progress',
    assignees: [users[2]],
    dueDate: '2024-08-15',
    createdAt: '2024-07-20',
    revisions: [
      { id: 'rev-1', timestamp: '2024-07-21T10:00:00Z', author: users[1], change: { en: 'Increased logo variations from 2 to 3.', id: 'Menambah variasi logo dari 2 menjadi 3.' } },
      { id: 'rev-2', timestamp: '2024-07-22T14:30:00Z', author: users[2], change: { en: 'Added initial sketches to attachments.', id: 'Menambahkan sketsa awal ke lampiran.' } },
    ],
    comments: [
      { id: 'comment-1', author: users[1], timestamp: '2024-07-21T10:05:00Z', content: { en: 'Great, Mo. Looking forward to seeing the first drafts.', id: 'Bagus, Mo. Ditunggu draf pertamanya.' } },
      { id: 'comment-2', author: users[2], timestamp: '2024-07-22T14:35:00Z', content: { en: "Initial sketches are up. Let me know what you think of direction A vs B. I think B is stronger but A is safer.", id: 'Sketsa awal sudah diunggah. Beri tahu saya pendapat Anda tentang arah A vs B. Menurut saya B lebih kuat tetapi A lebih aman.' } },
      { id: 'comment-3', author: users[1], timestamp: '2024-07-23T09:00:00Z', content: { en: "I agree, B has more potential. Let's explore that direction further. Maybe we can try incorporating some elements from A's color palette into B's structure?", id: 'Setuju, B punya lebih banyak potensi. Mari kita jelajahi arah itu lebih jauh. Mungkin kita bisa coba memasukkan beberapa elemen dari palet warna A ke dalam struktur B?' } },
      { id: 'comment-4', author: users[2], timestamp: '2024-07-23T11:20:00Z', content: { en: "Good idea. I'll work on a hybrid version and update the file by EOD. That's a great action item, thanks!", id: 'Ide bagus. Saya akan mengerjakan versi hibrida dan memperbarui filenya hari ini. Itu poin tindakan yang bagus, terima kasih!' } },
    ],
    files: [
      { id: 'file-1', name: 'initial-sketches.png', type: 'image', url: 'https://picsum.photos/seed/101/600/400', size: '2.3 MB' }
    ],
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
    status: 'In Review',
    assignees: [users[3]],
    dueDate: '2024-08-10',
    createdAt: '2024-07-18',
    revisions: [],
    comments: [
      { id: 'comment-5', author: users[1], timestamp: '2024-08-09T16:00:00Z', content: { en: 'The animation looks great, Mia! Just one minor suggestion: can we slow down the initial fade-in by 200ms?', id: 'Animasinya terlihat bagus, Mia! Hanya satu saran kecil: bisakah kita memperlambat fade-in awal sebesar 200ms?' } }
    ],
    files: [
       { id: 'file-2', name: 'animation-preview.mp4', type: 'video', url: '#', size: '15.7 MB' }
    ],
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
    assignees: [users[4]],
    dueDate: '2024-08-05',
    createdAt: '2024-07-15',
    revisions: [],
    comments: [],
    files: [
      { id: 'file-3', name: 'future-of-ai-draft.docx', type: 'document', url: '#', size: '128 KB' }
    ],
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
    status: 'To-do',
    assignees: [users[3]],
    dueDate: '2024-08-25',
    createdAt: '2024-07-25',
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
    status: 'Blocked',
    assignees: [users[2]],
    dueDate: '2024-08-20',
    createdAt: '2024-07-22',
    revisions: [],
    comments: [{ id: 'comment-6', author: users[0], timestamp: '2024-07-24T12:00:00Z', content: { en: 'Blocked until we get the final API keys from Stripe support.', id: 'Diblokir hingga kami mendapatkan kunci API final dari dukungan Stripe.' } }],
    files: [],
  },
];

export const notifications: Notification[] = [
  { id: 'notif-1', type: 'status-change', title: { en: 'Task Status Updated', id: 'Status Tugas Diperbarui' }, description: { en: 'Your task "Design new logo concept" was moved to In Review.', id: 'Tugas Anda "Rancang konsep logo baru" dipindahkan ke Dalam Tinjauan.' }, timestamp: '2024-07-25T10:00:00Z', isRead: false },
  { id: 'notif-2', type: 'comment', title: { en: 'New Comment', id: 'Komentar Baru' }, description: { en: 'Lena commented on "Develop landing page animation".', id: 'Lena mengomentari "Kembangkan animasi halaman arahan".' }, timestamp: '2024-07-25T09:30:00Z', isRead: false },
  { id: 'notif-3', type: 'task-assigned', title: { en: 'New Task Assigned', id: 'Tugas Baru Ditetapkan' }, description: { en: 'You have been assigned to "User Authentication Flow".', id: 'Anda telah ditugaskan untuk "Alur Otentikasi Pengguna".' }, timestamp: '2024-07-25T08:00:00Z', isRead: true },
]
