# Modul: Otomatisasi Alur Kerja (Workflow)

## Deskripsi Fitur
Modul interaktif dengan kanvas drag-and-drop untuk merancang logika bisnis visual. Didukung oleh React Flow di frontend, dan manajemen data JSON atomik di backend SQLite.

## Arsitektur Teknis
- **Backend**:
  - `server/main.py`: Rute `/workflows` (GET, POST, PUT, DELETE).
  - `server/models.py`: Relasi one-to-many. `Workflow` memiliki daftar `WorkflowNode` dan `WorkflowEdge`. Data struktur disimpan bertipe `JSON`.
  - `server/crud.py`: Penyimpanan data dan pembaharuan graf. Endpoint `PUT /workflows/{id}` menghapus relasi node & edge lama dan menyisipkan representasi baru secara transaksional (`cascade delete`).
- **Frontend**:
  - `src/app/(dashboard)/workflows/page.tsx`: Layout utama 3-kolom (Toolbar Kiri, Canvas Tengah, Inspector Kanan).
  - `src/components/workflow/CustomNodes.tsx`: Desain visual Custom Nodes (Trigger, Aksi, AI) terintegrasi dengan style `neon-outline` (status selected).
  - Menggunakan library `reactflow` untuk rendering nodes di virtual viewport.

## Interaksi UI
1. **Drag-and-Drop**: Pengguna dapat menambahkan titik ke dalam graf.
2. **Live Editing**: Mengklik node menampilkan *Inspector Panel* untuk mengubah _label_ dan konfigurasi metadata seketika.
3. **Save/Update Logic**: Sistem dapat membedakan data baru (dikirim via POST) dan data lama (via PUT) melalui evaluasi state *workflow_id*.

## Panduan Penerusan (Engineer Selanjutnya)
1. **Engine Eksekusi Backend**: Saat ini hanya menyimpan struktur _flow_. Engine *execution* (yang membaca struktur JSON dan benar-benar mengeksekusinya terhadap API riil dan rule base logic) masih harus dikembangkan (contoh: mengadopsi _Celery_ atau engine workflow lainnya).
2. **Validasi Graf**: Buat validasi (mencegah perulangan tiada henti, *dangling edges*) sebelum disimpan.
