# Dokumentasi Peran & Hak Akses Aplikasi KreaTask

Dokumen ini merinci hak akses (permissions) untuk setiap peran pengguna di dalam aplikasi KreaTask. Setiap peran memiliki wewenang yang berbeda tergantung pada fitur atau halaman yang diakses.

---

## Ringkasan Peran Pengguna

| Peran                  | Nama Internal             | Level Hirarki | Deskripsi Singkat                                                               |
| ---------------------- | ------------------------- | :-----------: | ------------------------------------------------------------------------------- |
| **Admin**              | `roles_super_admin`       |       L0      | **Pengelola Sistem Penuh**. Memiliki semua akses, termasuk mengelola Direktur Utama. |
| **Direktur Utama**      | `roles_admin`             |       L1      | **Pimpinan Tertinggi**. Mengelola semua aspek operasional, tim, dan validasi. |
| **Direktur Operasional** | `roles_team_leader`       |       L2      | **Manajer Tim**. Mengawasi tugas dan kinerja tim karyawan di bawahnya.          |
| **Karyawan**           | `roles_team_member`       |       L3      | **Pelaksana Tugas**. Mengerjakan dan melaporkan tugas yang diberikan.           |
| **Belum Ditugaskan**   | `Unassigned`              |       L3      | Peran awal dengan hak akses setara **Karyawan**. Menunggu penetapan peran formal. |

---

## Rincian Hak Akses per Halaman

### 1. Dasbor (`/dashboard`)
-   **Admin & Direktur Utama:**
    -   Melihat statistik agregat seluruh tim: Total tugas selesai, skor rata-rata tim, jumlah anggota tim, dan total tugas yang terlambat.
    -   Melihat papan peringkat ringkas (Top 3 Performer).
    -   Melihat kartu "Pegawai Terbaik" (Top Performer).
-   **Direktur Operasional:**
    -   Sama seperti Direktur Utama, melihat statistik dan peringkat seluruh tim.
-   **Karyawan & Unassigned:**
    -   Melihat statistik pribadi: Jumlah tugas yang diselesaikan, total skor pribadi, peringkat di leaderboard, dan jumlah tugas pribadi yang terlambat.
    -   Melihat grafik progres bulanan pribadi.
    -   Melihat kartu tugas prioritas milik sendiri.

### 2. Halaman Tugas (`/tasks`)
-   **Admin & Direktur Utama:**
    -   Melihat **semua tugas** dari semua pengguna di seluruh organisasi.
    -   Dapat memfilter tugas berdasarkan status dan karyawan mana pun.
    -   Dapat menggunakan tampilan Papan Kanban dan memindahkan tugas siapa pun.
-   **Direktur Operasional:**
    -   Melihat semua tugas yang ditugaskan kepada tim **Karyawan** (Jurnalis, Desainer, dll).
    -   Tidak dapat melihat tugas milik Direktur Utama atau sesama Direktur.
-   **Karyawan & Unassigned:**
    -   Hanya dapat melihat tugas yang **ditugaskan kepada dirinya sendiri**.

### 3. Halaman Unggah Tugas (`/submit`)
-   **Admin, Direktur Utama & Direktur Operasional:**
    -   Dapat membuat tugas baru.
    -   Dapat menugaskan tugas tersebut kepada **pengguna mana pun** di bawah level mereka (Admin dan Dir. Utama bisa menugaskan ke siapa saja, Dir. Operasional hanya ke Karyawan).
-   **Karyawan & Unassigned:**
    -   Dapat membuat tugas baru, tetapi kolom "Assign To" (Tugaskan Kepada) secara otomatis diatur **hanya untuk dirinya sendiri** dan tidak dapat diubah.

### 4. Papan Peringkat (`/leaderboard`)
-   **Semua Peran:**
    -   Semua pengguna dapat mengakses dan melihat halaman ini.
-   **Konten yang Ditampilkan:**
    -   Papan peringkat secara eksklusif menampilkan daftar **Karyawan** dan **Unassigned** yang diurutkan berdasarkan total skor mereka.
    -   Peran **Admin** dan **Direktur** tidak akan pernah muncul di dalam daftar peringkat.

### 5. Laporan Kinerja (`/performance-report`)
-   **Admin & Direktur Utama:**
    -   Memiliki akses penuh ke **Panel Validasi**.
    -   Dapat **menyetujui (approve)** tugas yang telah diselesaikan oleh karyawan.
    -   Dapat **mengubah nilai (skor)** tugas sebelum divalidasi.
    -   Melihat riwayat semua tugas yang telah selesai dari seluruh tim.
    -   Dapat mengekspor data laporan ke CSV.
-   **Direktur Operasional:**
    -   Dapat melihat riwayat tugas yang telah selesai dari timnya.
    -   **Tidak memiliki akses** ke Panel Validasi dan tidak bisa menyetujui atau mengubah nilai tugas.
-   **Karyawan & Unassigned:**
    -   Hanya melihat riwayat tugas yang telah diselesaikan **oleh dirinya sendiri**, beserta status validasinya (Menunggu atau Disetujui).

### 6. Notifikasi
-   **Semua Peran:**
    -   Menerima notifikasi yang relevan dengan akun mereka (misalnya, saat ditugaskan tugas baru atau tugasnya diperbarui).
    -   Direktur akan menerima notifikasi saat seorang karyawan mengirimkan tugas untuk ditinjau.
    -   Dapat menandai notifikasi sebagai "telah dibaca" atau menghapusnya.

### 7. Profil (`/profile`)
-   **Semua Peran:**
    -   Setiap pengguna dapat mengakses halaman profilnya sendiri.
    -   Dapat mengubah nama, alamat email, password, dan foto profil.
    -   Peran dan jabatan ditampilkan tetapi tidak dapat diubah dari halaman ini.

### 8. Pengaturan (`/settings`)
-   **Admin:**
    -   Memiliki akses penuh ke **Manajemen Pengguna**.
    -   Dapat mengubah peran **semua pengguna**, termasuk Direktur Utama.
    -   Dapat menghapus pengguna mana pun dari sistem.
-   **Direktur Utama:**
    -   Memiliki akses ke Manajemen Pengguna.
    -   Dapat mengubah peran semua pengguna **kecuali Admin**.
    -   Dapat menghapus pengguna mana pun **kecuali Admin**.
-   **Direktur Operasional:**
    -   Memiliki akses ke Manajemen Pengguna.
    -   Hanya dapat mengubah peran **Karyawan** dan **Unassigned**.
    -   Tidak dapat mengubah peran sesama Direktur atau atasan.
-   **Karyawan & Unassigned:**
    -   **Tidak memiliki akses** ke menu Manajemen Pengguna.
-   **Pengaturan Tampilan & Bahasa:**
    -   Semua pengguna dapat mengubah tema (Terang/Gelap) dan bahasa (ID/EN) aplikasi.

### 9. Halaman Lainnya
-   **Tentang (`/about`):** Dapat diakses oleh semua pengguna.
-   **Unduhan (`/downloads`):** Dapat diakses oleh semua pengguna untuk melihat riwayat unduhan file mereka.
-   **Keluar (`/logout`):** Dapat diakses oleh semua pengguna yang sedang login.

---
