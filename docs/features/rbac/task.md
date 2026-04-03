# Checklist & History Tugas: RBAC

## Riwayat Penyelesaian (Selesai)
- [x] Inisialisasi tabel `User` pada SQLite.
- [x] Tambah dependensi backend: `python-jose`, `passlib`, `multipart`.
- [x] Buat endpoint login dan generate JWT.
- [x] Rancang halaman login premium di `/login`.
- [x] Modifikasi `store.ts` untuk melampirkan header `Authorization`.
- [x] Proteksi menu di `Sidebar.tsx`.
- [x] Wrapping aplikasi menggunakan `AuthGuard`.

## Rencana Masa Depan (Backlog)
- [ ] Ubah struktur token JWT di backend untuk mencakup `role` di sisi *payload* agar tidak perlu fetch `/auth/me` terlalu sering.
- [ ] Implementasi *Forgot Password* dengan mekanisme email.
- [ ] Amankan penyimpanan token (Gunakan HttpOnly Cookes alih-alih local storage).
