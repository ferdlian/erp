# 🔐 Panduan Manajemen Akses (RBAC) - NexusERP

NexusERP menggunakan sistem **Role-Based Access Control (RBAC)** untuk memastikan keamanan data dan efisiensi operasional. Berikut adalah rincian peran (roles) dan tingkat aksesnya.

---

## 1. Ringkasan Peran Pengguna

| Peran | Deskripsi Singkat | Fokus Utama |
| :--- | :--- | :--- |
| **Super Admin** | Pemegang akses penuh ke seluruh sistem. | Konfigurasi, Keamanan, Audit. |
| **Manajer Keuangan** | Bertanggung jawab atas kesehatan finansial. | Arus Kas, Faktur, Pajak. |
| **Manajer Operasional** | Mengelola stok dan logistik. | Inventaris, Pemasok, Pengiriman. |
| **Manajer SDM** | Mengelola talenta dan performa tim. | Karyawan, Rekrutmen, Penilaian. |
| **Manajer Penjualan** | Fokus pada pertumbuhan pendapatan. | CRM, Pipeline, Kontak Pelanggan. |
| **Staf (User)** | Pengguna operasional harian. | Input data, Update status tugas. |

---

## 2. Matriks Akses Modul (CRUD)

Keterangan:
- **C**: Create (Buat)
- **R**: Read (Lihat)
- **U**: Update (Ubah)
- **D**: Delete (Hapus)
- **AI**: Akses ke Wawasan AI & Rekomendasi

| Modul | Super Admin | Keuangan | Operasional | SDM | Penjualan | Staf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dasbor AI** | CRUD + AI | R + AI | R + AI | R + AI | R + AI | R |
| **Keuangan** | CRUD + AI | **CRUD + AI** | R | - | - | R |
| **Inventaris** | CRUD + AI | R | **CRUD + AI** | - | R | C U |
| **SDM** | CRUD + AI | R | - | **CRUD + AI** | - | R |
| **Penjualan (CRM)** | CRUD + AI | R | R | - | **CRUD + AI** | C U |
| **Rantai Pasok** | CRUD + AI | R | **CRUD + AI** | - | R | R |
| **Konfigurasi Sistem** | **CRUD** | - | - | - | - | - |

---

## 3. Detail Hak Akses per Peran

### 👑 Super Admin
- **Kontrol Penuh**: Bisa mereset data, menambah/menghapus pengguna, dan mengubah pengaturan global.
- **Audit**: Melihat log aktivitas semua pengguna secara detail.
- **Kecerdasan Lintas Modul**: Mendapatkan wawasan AI yang menggabungkan data dari semua departemen.

### 💰 Manajer Keuangan
- **Penuh (Keuangan)**: Menyetujui pengeluaran, membuat faktur, dan melihat laporan laba rugi.
- **Lihat Saja (Modul Lain)**: Bisa melihat data Inventaris dan Penjualan untuk keperluan audit arus kas, tapi tidak bisa mengubah data tersebut.

### 📦 Manajer Operasional (Inventaris & Supply Chain)
- **Penuh (Inventaris & Rantai Pasok)**: Menyetujui PO, mengubah stok aman, dan mengevaluasi pemasok.
- **Wawasan AI**: Mendapatkan prediksi restock dan optimasi rute logistik.

### 👥 Manajer SDM
- **Penuh (SDM)**: Mengubah gaji, memproses rekrutmen, dan mengisi ulasan kinerja.
- **Kerahasiaan**: Data gaji dan ulasan kinerja sensitif hanya bisa dilihat oleh peran ini dan Super Admin.

### 🤝 Manajer Penjualan
- **Penuh (CRM)**: Mengelola pipeline, mengubah probabilitas kesepakatan, dan menetapkan tugas ke staf sales.
- **Analitik**: Melihat performa tim penjualan dan prediksi pendapatan.

### 🛠️ Staf (Standard User)
- **Input Operasional**: Bisa membuat transaksi baru, memperbarui stok barang, atau menambah kontak prospek (tergantung departemen).
- **Terbatas**: Tidak bisa menghapus data (Delete) dan tidak bisa melihat wawasan strategis AI tingkat tinggi.

---

## 4. Keamanan & Kebijakan
- **Semua tindakan penghapusan (Delete)** akan dicatat dalam Log Audit secara permanen.
- **Otomasi AI Brain** akan menyesuaikan jawabannya berdasarkan peran pengguna yang sedang login.
- **Integrasi**: Perubahan peran hanya bisa dilakukan oleh Super Admin melalui menu Pengaturan Pengguna.

---

> [!IMPORTANT]
> Sistem ini dirancang untuk meminimalkan risiko kesalahan manusia (human error) dan memastikan data sensitif hanya diakses oleh yang berwenang.
