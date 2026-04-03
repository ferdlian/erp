# Panduan Operasional NexusERP

Gunakan panduan ini untuk menjalankan dan mematikan sistem NexusERP (Frontend & Backend) di komputer lokal Anda.

## 🚀 Cara Menjalankan Sistem

(cd /Users/m/Documents/product/erp/server && source venv/bin/activate && python3 main.py &) && (cd /Users/m/Documents/product/erp && npm run dev)

NexusERP terdiri dari dua bagian yang harus berjalan bersamaan:

### 1. Menjalankan Backend (Server API)
Layanan ini mengelola database SQL dan logika bisnis.
- **Buka Terminal baru** dan arahkan ke folder `server`:
  ```bash
  cd server
  ```
- **Aktifkan Virtual Environment**:
  ```bash
  source venv/bin/activate
  ```
- **Jalankan Server**:
  ```bash
  python main.py
  ```
  > [!NOTE]
  > Backend akan berjalan di: `http://localhost:8000`

### 2. Menjalankan Frontend (Antarmuka Web)
- **Buka Terminal baru** (jangan campur dengan terminal backend) di folder utama project:
  ```bash
  npm run dev
  ```
  > [!NOTE]
  > Frontend akan berjalan di: `http://localhost:3000`

---

## 🛑 Cara Mematikan Sistem
kill -9 $(lsof -ti:8000) 2>/dev/null || true && kill -9 $(lsof -ti:3000) 2>/dev/null || true && kill -9 $(lsof -ti:3001) 2>/dev/null || true && echo "Sistem telah dimatikan."
### Cara Cepat (Rekomendasi)
- Klik pada jendela terminal yang sedang berjalan (yang menjalankan Backend atau Frontend).
- Tekan tombol **`Ctrl + C`** pada keyboard untuk menghentikan proses secara paksa namun aman.

### Cara Paksa (Jika Port "Nyangkut")
Jika Anda mendapatkan error "Port already in use", gunakan perintah berikut:

- **Mematikan Backend (Port 8000)**:
  ```bash
  kill -9 $(lsof -ti:8000)
  ```
- **Mematikan Frontend (Port 3000)**:
  ```bash
  kill -9 $(lsof -ti:3000)
  ```

---

## 🛠️ Tips Berguna
- **Database**: Pastikan file `server/nexuserp.db` sudah ada. Jika ingin mengosongkan data secara visual, gunakan tombol **Reset Data Sistem** di sidebar aplikasi.
- **Log**: Periksa terminal backend untuk melihat jika ada error pada koneksi database atau API.
