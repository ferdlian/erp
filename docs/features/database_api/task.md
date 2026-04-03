# Checklist & History Tugas: DB & Lapisan API

## Riwayat Penyelesaian (Selesai)
- [x] Buat backend container menggunakan FastAPI.
- [x] Setup Engine SQLAlchemy, base deklaratif.
- [x] Terapkan semua skema Pydantic utama.
- [x] Pembangunan fungsi standar CRUD.
- [x] Registrasi *routing* modular di file utama `main.py`.
- [x] Pengamanan _route_ via *dependency injection*.
- [x] Implementasi Endpoint Delete & Endpoint System Reset.

## Rencana Masa Depan (Backlog)
- [ ] Meng-instalasikan `alembic` untuk manajemen versi basis data.
- [ ] Optimasi SQL (N+1 query detection) pada tabel relasi (*misalnya pada* workflows *dan* workflow_nodes).
- [ ] Ubah konfigurasi port/engine ke file konfigurasi `.env`.
- [ ] Eksekusi log sistem secara asinkron atau menggunakan RabbitMQ/Celery untuk beban berat.
