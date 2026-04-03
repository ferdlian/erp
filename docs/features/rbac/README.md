# Modul: Role-Based Access Control (RBAC) & Otentikasi

## Deskripsi Fitur
Sistem keamanan dan kontrol akses pengguna menggunakan JSON Web Token (JWT). Memastikan pengguna hanya dapat mengakses modul berdasarkan peran mereka.

## Arsitektur Teknis
- **Backend (FastAPI)**:
  - `server/auth.py`: Logika enkripsi password (`bcrypt`), pembuatan dan verifikasi JWT token (`HS256`).
  - `server/main.py`: Endpoint `/auth/login` dan `/auth/me`. Middleware yang memeriksa token dan memvalidasi `role`.
  - `server/models.py` & `schemas.py`: Model `User` (id, username, hashed_password, role, dll.) dan Pydantic models.
- **Frontend (Next.js)**:
  - `src/app/login/page.tsx`: UI Login (form kredensial) dengan efek glassmorphism.
  - `src/components/auth/AuthGuard.tsx`: Komponen pelindung rute yang memverifikasi sinkronisasi state.
  - `src/lib/store.ts`: Zustand store yang menyimpan JWT token pada `localStorage` dan melampirkannya di header setiap _request_ API.
  - `src/components/ui/Sidebar.tsx`: _Rendering_ menu dinamis. Memfilter daftar menu berdasarkan properti `user.role`.

## Roles Tersedia
- `ADMIN` (Akses Penuh)
- `FINANCE`
- `INVENTORY`
- `HR`
- `SALES`
- `MANAGER`

## Panduan Penerusan (Engineer Selanjutnya)
1. **SSO / OAuth**: Pertimbangkan untuk mengintegrasikan Google Workspace atau Microsoft Entra ID.
2. **Refresh Token**: Implementasikan mekanisme JWT Refresh Token karena saat ini akses token digunakan secara berkelanjutan sampai diganti/dihapus.
3. **Session Management**: Pertimbangkan migrasi dari `localStorage` ke `HttpOnly Cookies` untuk perlindungan terhadap XSS.
