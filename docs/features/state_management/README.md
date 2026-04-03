# Modul: State Management & UI Shell

## Deskripsi Fitur
Sistem kontrol reaktivitas utama di frontend yang menggabungkan integrasi data dari API langsung ke komponen UI secara asinkron dan efisien. Diarsiteki layaknya SPA (*Single Page Application*).

## Arsitektur Teknis
- **Framework State**: Zustand (`useERPStore`).
- **File Inti (`src/lib/store.ts`)**:
  - Konsep: *Monolithic Store Design*. Satu pusat komando untuk menyimpan relasi data Inventory, Human Resources, Finance, dll.
  - Alur Kerja (Workflow): Saat berhasil login, metode `initializeStore()` memanggil 5 *endpoints* backend secara paralel (via `Promise.all`), yang men-trigger kalkulasi matrix finansial seketika, dan mengemas datanya kembali pada hirarki komprehensif.
  - Setiap API *mutator* (`addProduct`, `deleteTransaction`) dieksekusi secara optimistik disusul dengan *re-fetch* `initializeStore` atau _diff calculation_ internal.
- **Komponen Penunjang**:
  - `Sidebar.tsx`: Sistem rendering navigasi interaktif, memanfaatkan `useERPStore` untuk ekstraksi kredensial login (RBAC Filter) dan tombol _Reset Cache Database_.
  - Komponen lain hanya menerima data, memastikan _re-rendering_ yang minimum dan performa transisi memukau.

## Panduan Penerusan (Engineer Selanjutnya)
1. **Dekoupling Zustand**: Jika sistem membesar terlalu parah, disarankan memecah Zustand API ke *sliced patterns* (seperti `createAuthSlice`, `createInventorySlice`) agar `store.ts` tidak terlalu berat.
2. **Implementasi SWR / React Query**: Meskipun Zustand bagus untuk global store UI, untuk interaksi server side state (seperti _caching/polling_) bisa beralih memadukan `SWR` (Vercel) atau `React Query`.
3. **Realtime Sockets**: Jika dibutuhkan fitur seperti update _Inventory real-time_ ketika user lain mengubah, hubungkan Zustand dengan Event Listeners bawaan *WebSockets* FastAPI.
