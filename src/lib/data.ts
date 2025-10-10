

import type { User, Task, LeaderboardEntry, DetailedReportEntry, Notification, Comment } from './types';
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
    revisions: [
      {
        id: 'rev-1-1',
        timestamp: new Date('2024-08-11T10:00:00Z').toISOString(),
        author: users.find(u => u.name === 'Ariya')!,
        change: { en: 'Changed status from In Progress to In Review', id: 'Mengubah status dari Dikerjakan menjadi Ditinjau' },
      },
      {
        id: 'rev-1-2',
        timestamp: new Date('2024-08-12T09:00:00Z').toISOString(),
        author: users.find(u => u.name === 'Deva')!,
        change: { en: 'Changed status from In Review to Completed', id: 'Mengubah status dari Ditinjau menjadi Selesai' },
      },
    ], 
    comments: [
        {
          id: 'comment-1-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-08-10T10:00:00Z').toISOString(),
          isPinned: true,
          content: { en: 'Ariya, the draft looks good, but can we try a different color palette? Something more vibrant to match the summer theme.', id: 'Ariya, drafnya sudah bagus, tapi bisakah kita coba palet warna lain? Yang lebih cerah agar sesuai dengan tema musim panas.' },
        },
        {
          id: 'comment-1-2',
          author: users.find(u => u.name === 'Ariya')!,
          timestamp: new Date('2024-08-10T11:30:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Sure, Deva. I will prepare two new options with more vibrant colors, focusing on orange and turquoise gradients. I will send them over by EOD.', id: 'Tentu, Deva. Saya akan siapkan dua opsi baru dengan warna yang lebih cerah, fokus pada gradasi oranye dan toska. Akan saya kirimkan sore ini.' },
        },
        {
          id: 'comment-1-3',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-08-11T17:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Option 2 is perfect. Please finalize and mark as complete.', id: 'Opsi 2 sempurna. Silakan selesaikan dan tandai sebagai selesai.' },
        },
    ], 
    files: [
      { id: 'file-1-1', name: 'Banner_Draft_v1.png', type: 'image', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop', size: '1.2 MB', note: "Initial draft with the blue theme." },
      { id: 'file-1-2', name: 'Brand_Guidelines.pdf', type: 'document', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '850 KB' },
    ],
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
    revisions: [
       {
        id: 'rev-3-1',
        timestamp: new Date('2024-08-14T17:00:00Z').toISOString(),
        author: users.find(u => u.name === 'Agus')!,
        change: { en: 'Marked the task as Completed', id: 'Menandai tugas sebagai Selesai' },
      },
      {
        id: 'rev-3-2',
        timestamp: new Date('2024-08-16T10:00:00Z').toISOString(),
        author: users.find(u => u.name === 'Naufal')!,
        change: { en: 'Approved the task value of 40 points', id: 'Menyetujui nilai tugas sebesar 40 poin' },
      },
    ], 
    comments: [
        {
          id: 'comment-3-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-08-13T10:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Agus, how is the progress on this article? The deadline is approaching, and we need it for the newsletter.', id: 'Agus, bagaimana progres artikel ini? Batas waktunya sudah dekat, dan kita membutuhkannya untuk buletin.' },
        },
        {
          id: 'comment-3-2',
          author: users.find(u => u.name === 'Agus')!,
          timestamp: new Date('2024-08-13T11:30:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Hi Deva, the draft is 80% complete. I am just verifying some data with the research team regarding the AI adoption rate. I will submit it tomorrow morning.', id: 'Halo Deva, drafnya sudah 80% selesai. Saya sedang memverifikasi beberapa data dengan tim riset mengenai tingkat adopsi AI. Akan saya kirim besok pagi.' },
        },
        {
          id: 'comment-3-3',
          author: users.find(u => u.name === 'Naufal')!,
          timestamp: new Date('2024-08-16T14:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'This is a very insightful article. The section on decentralized finance is particularly strong. Great work, Agus!', id: 'Ini artikel yang sangat berwawasan. Bagian tentang keuangan terdesentralisasi sangat kuat. Kerja bagus, Agus!' },
        },
    ], 
    files: [
       { id: 'file-3-1', name: 'Tech_Trends_Article_Draft.docx', type: 'document', url: 'https://file-examples.com/storage/fe52cb0c4862dc67d7da9a3/2017/02/file-sample_100kB.docx', size: '100 KB', note: 'Final Draft submitted' },
    ],
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
    revisions: [], 
    comments: [
        {
            id: 'comment-deva-1',
            author: users.find(u => u.name === 'Naufal')!,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            isPinned: false,
            content: { en: 'How is the progress on the workflow review? Any bottlenecks identified?', id: 'Bagaimana progres tinjauan alur kerjanya? Ada kendala yang teridentifikasi?' },
        },
        {
            id: 'comment-deva-2',
            author: users.find(u => u.name === 'Deva')!,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
            isPinned: false,
            content: { en: 'Almost done. Just finalizing the documentation. I have identified a significant delay in the content approval process. I will propose a new streamlined workflow.', id: 'Hampir selesai. Tinggal finalisasi dokumentasi. Saya telah mengidentifikasi penundaan signifikan dalam proses persetujuan konten. Saya akan mengusulkan alur kerja baru yang lebih ramping.' },
        }
    ], 
    files: [
        { id: 'file-15-1', name: 'Workflow_Analysis_Q4.pdf', type: 'document', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '21 KB', note: 'Q4 operational workflow analysis.' },
    ],
    subtasks: [],
  },
  // Completed Tasks - Pending Validation
  {
    id: 'task-2',
    title: { en: 'Revise Weekly Article', id: 'Revisi Artikel Mingguan' },
    description: { en: 'Perform revisions on the weekly article for the company blog based on the editor\'s feedback.', id: 'Melakukan revisi artikel mingguan untuk blog perusahaan berdasarkan umpan balik editor.' },
    assignees: [users.find(u => u.name === "Agus")!],
    status: 'Completed',
    category: TaskCategory.Low,
    dueDate: '2024-08-10',
    createdAt: '2024-08-02',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
        {
          id: 'comment-2-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-08-09T15:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'The revision is good, but I think the conclusion can be stronger. Please elaborate on the impact on small businesses.', id: 'Revisinya bagus, tapi menurut saya kesimpulannya bisa lebih kuat. Tolong jelaskan lebih lanjut dampaknya pada bisnis kecil.' },
        },
        {
          id: 'comment-2-2',
          author: users.find(u => u.name === 'Agus')!,
          timestamp: new Date('2024-08-09T16:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Understood. I will add a paragraph with specific examples for small businesses and resubmit.', id: 'Mengerti. Saya akan menambahkan paragraf dengan contoh spesifik untuk bisnis kecil dan mengirimkannya kembali.' },
        },
    ], 
    files: [],
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
    revisions: [], 
    comments: [
        {
          id: 'comment-6-1',
          author: users.find(u => u.name === 'Sasi')!,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          isPinned: false,
          content: { en: 'The content plan is ready for review. I focused on video content for this month to increase engagement on Instagram Reels and TikTok.', id: 'Rencana konten sudah siap ditinjau. Saya fokus pada konten video untuk bulan ini untuk meningkatkan keterlibatan di Instagram Reels dan TikTok.' },
        },
        {
          id: 'comment-6-2',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          isPinned: false,
          content: { en: 'Looks good, Sasi. The focus on video is a great strategy. Please proceed with the production. I have marked this as completed, pending final value approval.', id: 'Bagus, Sasi. Fokus pada video adalah strategi yang bagus. Silakan lanjutkan ke produksi. Saya sudah menandainya sebagai selesai, menunggu persetujuan nilai akhir.' },
        },
    ], 
    files: [
      { id: 'file-6-1', name: 'Social_Media_Plan.xlsx', type: 'document', url: 'https://go.microsoft.com/fwlink/?LinkID=521962', size: '12 KB', note: 'Monthly content calendar' },
    ],
    subtasks: [],
  },
  {
    id: 'task-7',
    title: { en: 'Analyze Competitor Keywords', id: 'Analisis Kata Kunci Kompetitor' },
    description: { en: 'Research and analyze the top keywords used by main competitors in the SEA region.', id: 'Riset dan analisis kata kunci utama yang digunakan oleh kompetitor utama di wilayah Asia Tenggara.' },
    assignees: [users.find(u => u.role === UserRole.MARKETING)!],
    status: 'In Progress',
    category: TaskCategory.Medium,
    dueDate: '2024-09-22',
    createdAt: '2024-09-15',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
      {
        id: 'comment-7-1',
        author: users.find(u => u.name === 'Naufal')!,
        timestamp: new Date('2024-09-20T10:00:00Z').toISOString(),
        isPinned: false,
        content: { en: 'Citra, please focus on SEO competitors from the SEA region. I want to see how we stack up against them specifically.', id: 'Citra, tolong fokus pada kompetitor SEO dari wilayah Asia Tenggara. Saya ingin melihat perbandingan kita secara spesifik dengan mereka.' },
      },
      {
        id: 'comment-7-2',
        author: users.find(u => u.name === 'Citra')!,
        timestamp: new Date('2024-09-20T11:00:00Z').toISOString(),
        isPinned: false,
        content: { en: 'Understood, Mr. Naufal. I will adjust my research scope. I am currently using SEMrush for the analysis, is that sufficient or should I use Ahrefs as well?', id: 'Mengerti, Pak Naufal. Saya akan menyesuaikan cakupan riset saya. Saat ini saya menggunakan SEMrush untuk analisis, apakah itu cukup atau perlu menggunakan Ahrefs juga?' },
      },
      {
        id: 'comment-7-3',
        author: users.find(u => u.name === 'Naufal')!,
        timestamp: new Date('2024-09-20T11:15:00Z').toISOString(),
        isPinned: false,
        content: { en: 'SEMrush is fine for now. Let\'s focus on getting the initial report done.', id: 'SEMrush cukup untuk saat ini. Mari fokus menyelesaikan laporan awalnya dulu.' },
      },
    ], 
    files: [],
    subtasks: [],
  },
  {
    id: 'task-8',
    title: { en: 'Create Infographic for Social Media', id: 'Buat Infografis untuk Media Sosial' },
    description: { en: 'Design an infographic about the impact of our latest project, summarizing key metrics in a visually appealing way.', id: 'Rancang infografis tentang dampak proyek terbaru kami, rangkum metrik utama dengan cara yang menarik secara visual.' },
    assignees: [users.find(u => u.role === UserRole.DESAIN_GRAFIS)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-21',
    createdAt: '2024-09-14',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
        {
          id: 'comment-8-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-09-20T09:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Ariya, please make sure the infographic follows our latest brand guidelines. The color codes and fonts were updated last week.', id: 'Ariya, tolong pastikan infografisnya mengikuti pedoman merek terbaru kita. Kode warna dan font diperbarui minggu lalu.' },
        },
        {
          id: 'comment-8-2',
          author: users.find(u => u.name === 'Ariya')!,
          timestamp: new Date('2024-09-20T14:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Noted, Deva. I have the new guidelines. I have completed the infographic and submitted it for review.', id: 'Baik, Deva. Saya sudah punya pedoman baru. Saya telah menyelesaikan infografisnya dan sudah saya kirim untuk ditinjau.' },
        },
    ], 
    files: [
      { id: 'file-8-1', name: 'Infographic_Final.png', type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', size: '980 KB' },
    ],
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
    revisions: [], 
    comments: [
        {
            id: 'comment-9-1',
            author: users.find(u => u.name === 'Naufal')!,
            timestamp: new Date('2024-09-19T10:00:00Z').toISOString(),
            isPinned: false,
            content: { en: 'Agus, please send me the draft before publishing. I want to do a final review to ensure the messaging is aligned with our quarterly goals.', id: 'Agus, tolong kirimkan saya drafnya sebelum dipublikasikan. Saya ingin melakukan tinjauan akhir untuk memastikan pesannya sejalan dengan tujuan kuartalan kita.' },
        },
        {
            id: 'comment-9-2',
            author: users.find(u => u.name === 'Agus')!,
            timestamp: new Date('2024-09-19T11:00:00Z').toISOString(),
            isPinned: false,
            content: { en: 'Of course, Mr. Naufal. The draft has been sent to your email. I have also attached the list of media contacts we are targeting.', id: 'Tentu, Pak Naufal. Drafnya sudah dikirim ke email Anda. Saya juga sudah melampirkan daftar kontak media yang kita targetkan.' },
        }
    ], 
    files: [],
    subtasks: [],
  },
  {
    id: 'task-10',
    title: { en: 'Verify September Invoices', id: 'Verifikasi Faktur September' },
    description: { en: 'Check and verify all incoming and outgoing invoices for September to ensure accuracy before closing the books.', id: 'Periksa dan verifikasi semua faktur masuk dan keluar untuk bulan September untuk memastikan akurasi sebelum tutup buku.' },
    assignees: [users.find(u => u.role === UserRole.FINANCE)!],
    status: 'Completed',
    category: TaskCategory.Low,
    dueDate: '2024-09-19',
    createdAt: '2024-09-18',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
      {
        id: 'comment-10-1',
        author: users.find(u => u.name === 'Doni')!,
        timestamp: new Date('2024-09-19T16:00:00Z').toISOString(),
        isPinned: false,
        content: { en: 'All invoices for September have been verified and processed. Ready for closing.', id: 'Semua faktur untuk bulan September telah diverifikasi dan diproses. Siap untuk tutup buku.' },
      },
    ], 
    files: [],
    subtasks: [],
  },
  {
    id: 'task-11',
    title: { en: 'Update Company Website FAQ', id: 'Perbarui FAQ Situs Web Perusahaan' },
    description: { en: 'Update the Frequently Asked Questions page on the company website with new information about our services and return policy.', id: 'Perbarui halaman Pertanyaan yang Sering Diajukan di situs web perusahaan dengan informasi baru tentang layanan dan kebijakan pengembalian kami.' },
    assignees: [users.find(u => u.role === UserRole.JURNALIS)!],
    status: 'To-do',
    category: TaskCategory.Low,
    dueDate: '2024-09-25',
    createdAt: '2024-09-20',
    valueCategory: "Rendah",
    value: 10,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
      {
          id: 'comment-11-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-09-21T11:00:00Z').toISOString(),
          isPinned: true,
          content: { en: 'Agus, please add the new return policy to the FAQ. Marketing will provide you with the final text.', id: 'Agus, tolong tambahkan kebijakan pengembalian baru ke FAQ. Tim Pemasaran akan memberikan teks finalnya.' },
      },
    ], 
    files: [],
    subtasks: [],
  },
  {
    id: 'task-12',
    title: { en: 'Design social media campaign visuals', id: 'Desain visual kampanye media sosial' },
    description: { en: 'Create visuals for the upcoming Q4 social media campaign, including posts, stories, and cover images.', id: 'Buat visual untuk kampanye media sosial Q4 mendatang, termasuk post, story, dan gambar sampul.' },
    assignees: [users.find(u => u.role === UserRole.DESAIN_GRAFIS)!],
    status: 'In Review',
    category: TaskCategory.High,
    dueDate: '2024-09-28',
    createdAt: '2024-09-22',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: null,
    revisions: [
      {
        id: 'rev-12-1',
        timestamp: new Date('2024-09-27T10:00:00Z').toISOString(),
        author: users.find(u => u.name === 'Ariya')!,
        change: { en: 'Changed status from In Progress to In Review', id: 'Mengubah status dari Dikerjakan menjadi Ditinjau' },
      }
    ], 
    comments: [
        {
          id: 'comment-12-1',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-09-26T11:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Ariya, how is the progress on the Q4 campaign visuals? The campaign starts next week.', id: 'Ariya, bagaimana progres visual kampanye Q4? Kampanyenya dimulai minggu depan.' },
        },
        {
          id: 'comment-12-2',
          author: users.find(u => u.name === 'Ariya')!,
          timestamp: new Date('2024-09-26T15:30:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Hi Deva, the initial concepts are ready. I have uploaded them for you to see. Let me know what you think. I am leaning towards Concept B.', id: 'Halo Deva, konsep awalnya sudah siap. Sudah saya unggah untuk Anda lihat. Beri tahu saya pendapat Anda. Saya lebih condong ke Konsep B.' },
        },
         {
          id: 'comment-12-3',
          author: users.find(u => u.name === 'Deva')!,
          timestamp: new Date('2024-09-27T10:00:00Z').toISOString(),
          isPinned: true,
          content: { en: 'Concept B looks promising. Please proceed with that one and finalize it for all required dimensions. I\'m marking this for review.', id: 'Konsep B terlihat menjanjikan. Silakan lanjutkan dengan yang itu dan selesaikan untuk semua dimensi yang diperlukan. Saya menandai ini untuk ditinjau.' },
        }
    ], 
    files: [
      { id: 'file-12-1', name: 'Campaign_Concept_A.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1611162617213-6ddef1e2ca3b?q=80&w=600&auto=format&fit=crop', size: '2.5 MB', note: 'First concept, more corporate style.' },
      { id: 'file-12-2', name: 'Campaign_Concept_B.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=600&auto=format&fit=crop', size: '2.8 MB', note: 'Second concept, more modern and colorful.' },
    ],
    subtasks: [],
  },
  {
    id: 'task-13',
    title: { en: 'Organize team building event', id: 'Atur acara membangun tim' },
    description: { en: 'Plan and organize a team building event for the end of the quarter. This includes venue booking, activity planning, and budget management.', id: 'Rencanakan dan atur acara membangun tim untuk akhir kuartal. Ini termasuk pemesanan tempat, perencanaan kegiatan, dan manajemen anggaran.' },
    assignees: [users.find(u => u.role === UserRole.SOCIAL_MEDIA_OFFICER)!],
    status: 'Completed',
    category: TaskCategory.Medium,
    dueDate: '2024-09-27',
    createdAt: '2024-09-21',
    valueCategory: "Menengah",
    value: 20,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
        {
          id: 'comment-13-1',
          author: users.find(u => u.name === 'Naufal')!,
          timestamp: new Date('2024-09-26T11:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'Sasi, please make sure the budget for this event does not exceed the allocated amount. Send the proposal to finance by Friday.', id: 'Sasi, tolong pastikan anggaran untuk acara ini tidak melebihi jumlah yang dialokasikan. Kirim proposal ke bagian keuangan paling lambat hari Jumat.' },
        },
        {
          id: 'comment-13-2',
          author: users.find(u => u.name === 'Sasi')!,
          timestamp: new Date('2024-09-26T14:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'All planning is complete and the proposal has been sent to Doni in finance. Marking this as completed.', id: 'Semua perencanaan sudah selesai dan proposal sudah dikirim ke Doni di bagian keuangan. Saya menandai ini sebagai selesai.' },
        },
    ], 
    files: [],
    subtasks: [],
  },
  {
    id: 'task-14',
    title: { en: 'Research new marketing channels', id: 'Riset saluran pemasaran baru' },
    description: { en: 'Identify and research potential new marketing channels to reach a wider audience, focusing on emerging platforms.', id: 'Identifikasi dan riset saluran pemasaran baru yang potensial untuk menjangkau audiens yang lebih luas, fokus pada platform yang sedang berkembang.' },
    assignees: [users.find(u => u.role === UserRole.MARKETING)!],
    status: 'Blocked',
    category: TaskCategory.High,
    dueDate: '2024-09-26',
    createdAt: '2024-09-20',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI",
    approvedBy: null,
    revisions: [], 
    comments: [
        {
          id: 'comment-14-1',
          author: users.find(u => u.name === 'Citra')!,
          timestamp: new Date('2024-09-25T16:00:00Z').toISOString(),
          isPinned: true,
          content: { en: 'This task is blocked. The budget for new channel experiments has not been approved yet. I cannot proceed with trial campaigns.', id: 'Tugas ini terhambat. Anggaran untuk eksperimen saluran baru belum disetujui. Saya tidak bisa melanjutkan dengan kampanye uji coba.' },
        },
        {
          id: 'comment-14-2',
          author: users.find(u => u.name === 'Naufal')!,
          timestamp: new Date('2024-09-26T09:00:00Z').toISOString(),
          isPinned: false,
          content: { en: 'I see. I will follow up with the finance department regarding the budget approval. Please prepare the presentation of your findings so far.', id: 'Saya mengerti. Saya akan menindaklanjuti dengan departemen keuangan mengenai persetujuan anggaran. Tolong siapkan presentasi dari temuanmu sejauh ini.' },
        },
    ], 
    files: [],
    subtasks: [],
  },
  // In-Progress / To-do Tasks
  {
    id: 'task-4',
    title: { en: 'Produce Client Presentation Video', id: 'Produksi Video Presentasi Klien' },
    description: { en: 'Produce a short, 2-minute video for a key client presentation. It needs to be polished and professional.', id: 'Produksi video pendek 2 menit untuk presentasi klien utama. Video harus terlihat rapi dan profesional.' },
    assignees: [users.find(u => u.name === "Citra")!],
    status: 'In Progress',
    category: TaskCategory.High,
    dueDate: '2024-09-30',
    createdAt: '2024-09-01',
    valueCategory: "Tinggi",
    value: 40,
    evaluator: "AI", 
    approvedBy: null,
    revisions: [], 
    comments: [
        {
            id: 'comment-4-1',
            author: users.find(u => u.name === 'Naufal')!,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            isPinned: true,
            content: { en: 'Please prioritize this, Citra. The client presentation is scheduled for next week. The storyboard looks great, let\'s move to production.', id: 'Tolong prioritaskan ini, Citra. Presentasi klien dijadwalkan minggu depan. Papan ceritanya bagus, mari kita lanjut ke produksi.' },
        },
        {
            id: 'comment-4-2',
            author: users.find(u => u.name === 'Citra')!,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
            isPinned: false,
            content: { en: 'Understood. I am currently rendering the first draft. I should have something for initial review by tomorrow afternoon.', id: 'Mengerti. Saya sedang me-render draf pertama. Seharusnya sudah ada yang bisa ditinjau besok sore.' },
        },
    ], 
    files: [
      { id: 'file-4-1', name: 'Script_Final_v2.docx', type: 'document', url: 'https://file-examples.com/storage/fe52cb0c4862dc67d7da9a3/2017/02/file-sample_100kB.docx', size: '100 KB', note: 'Final approved script.' },
      { id: 'file-4-2', name: 'Storyboard_Draft.pdf', type: 'document', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '21 KB', note: 'Storyboard visuals for client review.' },
    ],
    subtasks: [
      { id: 'sub-4-1', title: 'Finalize script', isCompleted: true },
      { id: 'sub-4-2', title: 'Record voiceover', isCompleted: true },
      { id: 'sub-4-3', title: 'Edit video and add graphics', isCompleted: false },
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
    revisions: [], 
    comments: [
      {
        id: 'comment-5-1',
        author: users.find(u => u.name === 'Naufal')!,
        timestamp: new Date('2024-09-20T10:00:00Z').toISOString(),
        isPinned: false,
        content: { en: 'Doni, please make sure to include the projected vs. actual spending analysis in this month\'s report.', id: 'Doni, tolong pastikan untuk menyertakan analisis pengeluaran yang diproyeksikan vs. aktual dalam laporan bulan ini.' },
      },
    ], 
    files: [],
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
    mockNotifications,
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
      taskTitle: task.title,
      role: assignee.role,
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

    






    



