# KreaTask: Checklist Fitur & Fungsionalitas

Dokumen ini merinci fitur-fitur yang telah diimplementasikan dan berfungsi dalam aplikasi KreaTask.

---

## 1. Arsitektur & Antarmuka Pengguna (UI)

-   **[✅] Teknologi Inti:**
    -   Framework: **Next.js 15** dengan App Router.
    -   Bahasa: **TypeScript**.
    -   Styling: **Tailwind CSS** & **ShadCN/UI**.
    -   Animasi: **Framer Motion**.
-   **[✅] Desain Responsif:**
    -   **Desktop:** Tampilan dengan *sidebar* navigasi di sebelah kiri.
    -   **Mobile:** Tampilan dioptimalkan dengan *bottom navigation bar*.
-   **[✅] Tema (Appearance):**
    -   Pengguna dapat memilih antara tema **Terang (Light)**, **Gelap (Dark)**, atau **Sistem** melalui halaman Pengaturan.
    -   Pilihan tema tersimpan di *local storage* untuk konsistensi.
-   **[✅] Dukungan Multi-Bahasa:**
    -   Pengguna dapat mengganti bahasa antara **Indonesia** dan **Inggris** melalui halaman Pengaturan.
    -   Pilihan bahasa tersimpan di *local storage*.
-   **[✅] Efek Visual:**
    -   Efek "Spotlight" interaktif pada komponen kartu saat kursor digerakkan.
    -   Animasi "Blur & Slide Up" pada halaman awal (*landing page*) untuk memberikan kesan pertama yang dinamis.

## 2. Autentikasi & Manajemen Pengguna

-   **[✅] Autentikasi Pengguna (Firebase Auth):**
    -   **Pendaftaran:** Pengguna baru dapat mendaftar menggunakan Email/Password atau akun Google.
    -   **Login:** Pengguna yang sudah ada dapat masuk menggunakan Email/Password atau akun Google.
    -   Setelah *login*, pengguna secara otomatis diarahkan ke halaman Dasbor.
-   **[✅] Manajemen Sesi:**
    -   Aplikasi secara otomatis mendeteksi sesi *login* pengguna dan menjaga mereka tetap masuk.
    -   Pengguna dapat keluar (*logout*) dari akun mereka melalui menu di *header*.
-   **[✅] Manajemen Profil Pengguna (`/profile`):**
    -   Pengguna dapat melihat detail profil mereka (nama, email, peran).
    -   Pengguna dapat mengubah nama lengkap dan alamat email.
    -   Pengguna dapat mengganti *password* setelah melakukan re-autentikasi.
    -   Pengguna dapat mengunggah dan mengubah foto profil (terhubung dengan Firebase Storage).
-   **[✅] Manajemen Pengguna (Hanya Direktur & Admin di `/settings`):**
    -   Atasan dapat melihat daftar semua pengguna dalam format tabel.
    -   Atasan dapat mengubah peran (*role*) pengguna lain (misalnya dari "Unassigned" menjadi "Jurnalis").
    -   Atasan dapat menghapus pengguna dari sistem.

## 3. Manajemen Tugas

-   **[✅] Pembuatan Tugas (`/submit`):**
    -   Pengguna dapat membuat tugas baru melalui formulir manual.
    -   Formulir mencakup: Judul, Deskripsi, Kategori, Batas Waktu, dan Penerima Tugas.
    -   Pengguna dapat menambahkan *checklist* (sub-tugas) dan mengunggah lampiran file.
-   **[✅] Tampilan Tugas (`/tasks`):**
    -   **Tampilan Papan Kanban:** Tugas ditampilkan dalam kolom status (`To-do`, `In Progress`, dll.). Pengguna dapat memindahkan tugas antar kolom dengan *drag-and-drop* untuk memperbarui statusnya secara *real-time*.
    -   **Tampilan Daftar/Tabel:** Tugas juga dapat dilihat dalam format tabel yang ringkas, dioptimalkan untuk tampilan *mobile*.
    -   Pengguna dapat memfilter tugas berdasarkan status dan pencarian judul.
-   **[✅] Halaman Detail Tugas (`/tasks/[id]`):**
    -   Menampilkan semua informasi lengkap sebuah tugas.
    -   Pengguna dapat mengubah status tugas melalui menu *dropdown*.
    -   **Checklist Interaktif:** Pengguna dapat mencentang sub-tugas yang sudah selesai, dan *progress bar* akan diperbarui secara otomatis.
    -   **Manajemen Lampiran:** Pengguna dapat mengunduh, menambahkan catatan, dan menghapus lampiran file.
    -   **Kolom Komentar:** Pengguna dapat berdiskusi, membalas (`@mention`), menyematkan (*pin*), mengedit, dan menghapus komentar.

## 4. Dasbor, Peringkat & Laporan

-   **[✅] Dasbor Dinamis (`/dashboard`):**
    -   Menampilkan ringkasan statistik kinerja yang relevan berdasarkan peran pengguna.
    -   **Karyawan:** Melihat total tugas selesai, skor, peringkat, dan tugas terlambat milik pribadi.
    -   **Direktur:** Melihat total tugas tim yang selesai, skor rata-rata, jumlah anggota tim, dan tugas terlambat tim.
    -   Grafik "Progres Bulanan" menampilkan data tugas yang diselesaikan secara akurat, bukan data *dummy*.
-   **[✅] Papan Peringkat (`/leaderboard`):**
    -   Menampilkan peringkat semua **karyawan** (bukan direksi) berdasarkan total skor.
    -   Menghitung skor hanya dari tugas yang telah divalidasi oleh atasan.
-   **[✅] Laporan Kinerja (`/performance-report`):**
    -   **Panel Validasi (Untuk Direktur):** Atasan dapat meninjau tugas yang telah diselesaikan oleh karyawan, mengubah nilainya jika perlu, dan memberikan persetujuan (validasi).
    -   **Riwayat Tugas:** Menampilkan riwayat semua tugas yang telah selesai dengan kemampuan filter berdasarkan karyawan, status validasi, dan rentang tanggal.
    -   Data laporan dapat diekspor ke dalam format file **CSV**.

## 5. Fitur Berbasis AI (Genkit)

-   **[✅] Generator Saran Tugas (`/submit`):**
    -   AI dapat menganalisis tujuan umum yang dimasukkan pengguna dan memberikan beberapa saran judul dan deskripsi tugas yang relevan.
-   **[✅] Ringkasan Komentar AI (`/tasks/[id]`):**
    -   Di halaman detail tugas, AI dapat meringkas seluruh utas komentar untuk menyoroti poin-poin penting dan keputusan.
-   **[✅] Penerjemah Konten Otomatis:**
    -   Judul dan deskripsi tugas secara otomatis diterjemahkan ke dalam Bahasa Inggris dan Indonesia saat dibuat atau diubah untuk mendukung multibahasa.
-   **[✅] KreaBot (Asisten Chatbot):**
    -   Chatbot dapat diakses di seluruh aplikasi.
    -   Mampu menjawab pertanyaan kontekstual terkait data aplikasi, seperti "Siapa karyawan terbaik bulan ini?" atau "Tugas apa saja yang akan jatuh tempo?".
    -   Menyediakan jawaban berdasarkan data *real-time* dari tugas dan pengguna.

---
