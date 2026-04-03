# Modul: API Backend & Database SQLite

## Deskripsi Fitur
Lapisan arsitektur data sistem ERP, menggunakan database relasional yang kuat, namun portabel berbasis SQLite, dijembatani dengan FastAPI (Python).

## Arsitektur Teknis
- **Framework Utama**: FastAPI (high-performance async framework).
- **ORM & DB Engine**: SQLAlchemy dipadukan dengan pengelola skema (engine berkonfigurasi `sqlite:///./nexuserp.db`).
- **File Utama**:
  - `database.py`: Menangani koneksi (sesi pembuatan factory `SessionLocal` dan deklarasi ORM Base). Disertai _dependency injection_ `get_db`.
  - `models.py`: Mengkonstruksi tabel (`transactions`, `products`, `employees`, dll).
  - `schemas.py`: *Data Validation Object* berbasis Pydantic yang mendefinisikan skema Request/Response sistem.
  - `crud.py`: Seluruh abstraksi kueri dieksekusi di sini untuk pemisahan _business logic_.
- **Sistem Inisialisasi Otomatis**:
  - File utama `main.py` akan memastikan `Base.metadata.create_all` jika _file base_ (`nexuserp.db`) tidak ditemukan atau butuh *update* model skema terbaru (namun Alembic lebih disarankan untuk migrasi jangka panjang).

## Panduan Penerusan (Engineer Selanjutnya)
1. **Migrasi Database (Alembic)**: Mengingat database menggunakan metode `create_all`, sangat krusial bagi arsitek selanjutnya untuk mengenalkan *migration management* (misalnya Alembic) agar skema SQLite atau PostgreSQL selanjutnya bisa berkembang tanpa hilangnya data.
2. **Pindah Database**: Untuk versi *Enterprise/Production*, SQLite direkomendasikan untuk diganti menjadi lingkungan PostgreSQL dengan mengubah konfigurasi DSN (_Data Source Name_) di `database.py`.
3. **Pagination & Query Optimizer**: Sistem `crud.py` saat ini menggunakan *basic offset pagination* (`skip`, `limit`). Silakan terapkan algoritma index dan *cursor-based pagination* untuk set data raksasa.
