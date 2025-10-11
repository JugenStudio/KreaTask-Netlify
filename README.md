# Blueprint Aplikasi: KreaTask

Dokumen ini menguraikan arsitektur, fitur, dan desain aplikasi web KreaTask, sebuah platform manajemen tugas dinamis yang dirancang untuk tim kreatif.

## 1. Visi & Tujuan Aplikasi

KreaTask adalah aplikasi web *real-time* yang berfungsi sebagai pusat kolaborasi untuk mengelola tugas, melacak progres, dan menganalisis kinerja tim. Aplikasi ini dirancang dengan pendekatan modern, mengintegrasikan kecerdasan buatan (AI) untuk meningkatkan produktivitas, serta menyediakan antarmuka yang bersih dan intuitif yang dapat diakses dari perangkat apa pun.

## 2. Arsitektur & Teknologi

Aplikasi ini dibangun di atas tumpukan teknologi modern yang berpusat pada JavaScript/TypeScript.

-   **Frontend Framework:** **Next.js 15** dengan **App Router**. Ini memungkinkan rendering sisi server (SSR) dan komponen sisi klien yang optimal.
-   **Bahasa Pemrograman:** **TypeScript**. Memberikan keamanan tipe (*type-safety*) dan skalabilitas pada kode.
-   **Styling:**
    -   **Tailwind CSS:** Untuk utilitas CSS yang cepat dan konsisten.
    -   **ShadCN/UI:** Sebagai pustaka komponen UI yang dapat disesuaikan, menyediakan elemen-elemen seperti `Card`, `Button`, `Dialog`, `Select`, dll.
    -   **Skema Warna Dinamis:** Aplikasi mendukung tema **Terang (Light)** dan **Gelap (Dark)** yang dapat diganti oleh pengguna, dengan variabel warna CSS yang terpusat di `src/app/globals.css`.
-   **Backend & Database:** **Firebase**.
    -   **Firestore:** Digunakan sebagai database NoSQL *real-time* untuk menyimpan semua data aplikasi (pengguna, tugas, notifikasi).
    -   **Firebase Authentication:** Mengelola identitas pengguna.
-   **Integrasi AI:** **Genkit**. *Framework* dari Google untuk membangun fitur-fitur AI, seperti ringkasan, pembuatan saran, dan chatbot.
-   **Manajemen State:** Kombinasi dari **React Hooks** (`useState`, `useEffect`, `useContext`) dan *custom hooks* (seperti `useTaskData`) untuk mengelola state lokal dan global.
-   **Animasi:**
    -   **Framer Motion:** Digunakan untuk transisi halaman yang mulus.
    -   **WebGL (ogl):** Digunakan untuk efek latar belakang `Aurora` yang dinamis dan efisien.

## 3. Struktur Direktori & File Kunci

Struktur proyek mengikuti konvensi Next.js App Router.

-   `src/app/(app)/`: Direktori utama untuk halaman-halaman aplikasi yang memerlukan autentikasi dan *layout* utama (misalnya, Dasbor, Tugas).
-   `src/app/(auth)/`: Direktori untuk halaman autentikasi (Sign-In, Sign-Up) dengan *layout* terpisah.
-   `src/components/`: Berisi semua komponen React yang dapat digunakan kembali, diorganisir berdasarkan fitur (misalnya, `dashboard`, `tasks`, `ui`).
-   `src/hooks/`: Berisi *custom hooks* React, dengan `useTaskData.ts` sebagai *hook* utama untuk interaksi data dengan Firebase.
-   `src/lib/`: Berisi logika non-UI, definisi tipe (`types.ts`), data awal (`data.ts`), dan utilitas (`utils.ts`).
-   `src/ai/`: Semua logika terkait AI berada di sini, dengan `flows` yang mendefinisikan kemampuan spesifik dari Genkit.
-   `src/firebase/`: Berisi semua konfigurasi, *provider*, dan *hooks* untuk koneksi ke Firebase, mengikuti praktik terbaik untuk keamanan dan penanganan error.

## 4. Fitur-Fitur Utama (Detail)

### A. Autentikasi & Manajemen Pengguna
-   **Simulasi Login Berbasis Peran:** Pengguna dapat masuk dengan memilih salah satu dari tiga peran: **Karyawan**, **Direktur Operasional**, atau **Direktur Utama**.
-   **Manajemen Pengguna (Admin-Only):** Direktur dapat mengubah peran pengguna atau menghapus pengguna dari sistem melalui halaman Pengaturan.
-   **Izin Berbasis Peran (*Role-Based Permissions*):**
    -   **Karyawan:** Hanya dapat melihat dan mengelola tugas yang ditugaskan kepadanya.
    -   **Direktur:** Dapat melihat tugas timnya dan memvalidasi skor.
    -   **Direktur Utama:** Memiliki akses penuh ke semua tugas, pengguna, dan pengaturan.

### B. Manajemen Tugas
-   **Pembuatan Tugas:**
    1.  **Generator AI:** Pengguna mendeskripsikan tujuan, dan AI akan memberikan beberapa saran judul dan deskripsi tugas yang bisa langsung digunakan.
    2.  **Formulir Manual:** Pengguna dapat mengisi detail tugas secara manual, termasuk judul, deskripsi, kategori, batas waktu, lampiran file, dan *checklist* sub-tugas.
-   **Tampilan Tugas:**
    -   **Papan Kanban (`/tasks`):** Tampilan visual di mana tugas dapat diseret (*drag-and-drop*) antar kolom status (`To-do`, `In Progress`, dll.) untuk memperbarui progresnya.
    -   **Tampilan Tabel/Daftar (`/tasks`):** Tampilan yang lebih ringkas dan informatif, cocok untuk penyortiran dan pemfilteran cepat.
-   **Detail Tugas (`/tasks/[id]`):**
    -   Menampilkan semua informasi tugas, termasuk deskripsi, penerima tugas, batas waktu, dan lampiran.
    -   **Checklist Interaktif:** Sub-tugas dapat ditandai sebagai selesai, dengan *progress bar* yang otomatis diperbarui.
    -   **Manajemen Lampiran:** Pengguna dapat mengunggah file baru, mengunduh file yang ada, menambahkan catatan pada file, dan menghapusnya.
    -   **Kolom Komentar:** Ruang diskusi dengan fitur *pin*, *reply* (`@mention`), dan kemampuan untuk mengedit/menghapus komentar sendiri.
    -   **Ringkasan AI:** Tombol untuk meringkas seluruh utas komentar secara otomatis.
    -   **Riwayat Revisi:** Melacak semua perubahan yang dibuat pada tugas.

### C. Dasbor & Pelaporan
-   **Dasbor Dinamis (`/dashboard`):** Menampilkan ringkasan statistik kinerja berdasarkan peran pengguna (tugas selesai, skor, peringkat).
-   **Papan Peringkat (`/leaderboard`):** Menampilkan peringkat semua pengguna berdasarkan total skor yang diperoleh dari menyelesaikan tugas.
-   **Laporan Kinerja (`/performance-report`):**
    -   **Panel Validasi (Untuk Direktur):** Direktur dapat meninjau, mengubah nilai, dan menyetujui skor tugas yang telah diselesaikan oleh karyawan.
    -   **Riwayat Tugas:** Menampilkan riwayat semua tugas yang telah selesai, dengan kemampuan memfilter berdasarkan karyawan, status validasi, dan rentang tanggal.
    -   **Ekspor ke CSV:** Semua data laporan dapat diekspor menjadi file CSV.

### D. Fitur AI (ditenagai oleh Genkit)
-   **KreaBot:** *Chatbot* asisten yang dapat menjawab pertanyaan terkait data di dalam aplikasi, seperti "Siapa karyawan terbaik bulan ini?" atau "Tugas apa saja yang akan jatuh tempo?".
-   **Generator Saran Tugas:** Menganalisis tujuan proyek dan memecahnya menjadi tugas-tugas konkret.
-   **Peringkas Komentar:** Meringkas diskusi panjang pada sebuah tugas untuk menyoroti poin-poin penting.
-   **Penerjemah Konten:** Secara otomatis menerjemahkan judul dan deskripsi tugas ke dalam Bahasa Inggris dan Indonesia untuk mendukung multibahasa.

## 5. Desain UI/UX

-   **Estetika Modern & Gelap:** Desain utama menggunakan tema gelap dengan aksen hijau neon (`#16A34A`), menciptakan nuansa teknologi yang premium. Latar belakang `Aurora` yang dinamis memberikan sentuhan visual yang halus.
-   **Tipografi:**
    -   **Poppins:** Digunakan untuk judul (`font-headline`) untuk memberikan kesan modern dan tegas.
    -   **Montserrat:** Digunakan untuk teks isi (`font-body`) untuk keterbacaan yang optimal.
-   **Antarmuka Responsif:** Desain dioptimalkan untuk perangkat *desktop* dan *mobile*. Di perangkat *mobile*, navigasi utama beralih ke *bottom navigation bar* untuk akses yang mudah.
-   **Pengalaman Pengguna (UX):**
    -   **Umpan Balik Instan:** Penggunaan *skeleton loaders* saat data dimuat dan notifikasi *toast* untuk setiap aksi (misalnya, tugas dibuat, status diperbarui) memberikan umpan balik yang jelas kepada pengguna.
    -   **Navigasi Intuitif:** Struktur navigasi yang jelas melalui *sidebar* (desktop) dan *bottom nav* (mobile).
    -   **Pusat Notifikasi:** Semua pemberitahuan (tugas baru, penyebutan, dll.) dikumpulkan di satu tempat yang mudah diakses.