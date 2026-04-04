# Checklist & History Tugas: Workflow Engine Upgrade (ERP Ready)

## 🎯 Tujuan
Mengembangkan Workflow Dashboard saat ini (visual builder) menjadi **Workflow Engine berbasis event** yang dapat:
- menjalankan alur workflow
- mendukung approval ERP
- memiliki audit log
- scalable & modular

---

# ✅ Riwayat Penyelesaian (Selesai)
- [x] Integrasi React Flow v11
- [x] Pembuatan kanvas drag-and-drop berbasis mock
- [x] Translasi mock state → persistent state dari API
- [x] Sinkronisasi `nodes` & `edges` (ReactFlow ↔ SQLAlchemy)
- [x] Inspector Panel (edit label & description)
- [x] Split HTTP POST (Create) & PUT (Update)
- [x] UI enhancement (neon glow interaction)
- [x] Reset state workflow
- [x] Hapus node + edge terkait dari Inspector

📌 Status saat ini:
> ✔ Workflow Builder (Authoring Tool)  
> ❌ Belum Workflow Engine (Execution System)

---

# 🚧 Rencana Pengembangan (Backlog)

## 🔹 PHASE 1 — Workflow Definition Layer (WAJIB)

### 🧩 1. Workflow Status & Lifecycle
- [x] Tambahkan field `status`:
  - `draft`
  - `published`
  - `archived`

**Acceptance:**
- Workflow baru = `draft`
- Workflow `published` tidak bisa diedit langsung

---

### 🧩 2. Workflow Versioning
- [x] Buat tabel `workflow_versions`
- [x] Saat publish -> snapshot nodes + edges

**Acceptance:**
- Workflow punya versi aktif
- Versi lama tetap tersimpan
- Runtime tidak menggunakan draft

---

### 🧩 3. Node Config (WAJIB)
- [x] Tambahkan field `config` pada node

Contoh:
```json
{
  "type": "condition",
  "config": {
    "field": "amount",
    "operator": ">",
    "value": 5000000
  }
}
```

**Acceptance:**
- Semua node menyimpan `config` sesuai tipenya
- Backend menolak publish jika `config` wajib belum lengkap

---

### 🧩 4. Multi-Workflow Management (WAJIB)
- [ ] User bisa membuat **lebih dari satu workflow**
- [ ] Tambahkan daftar workflow (list view) dengan informasi:
  - `name`
  - `status`
  - `active_version`
  - `updated_at`
- [ ] User bisa pilih workflow aktif untuk diedit di builder
- [ ] User bisa duplikasi workflow sebagai draft baru
- [ ] User bisa arsipkan workflow tanpa menghapus histori versi

**Acceptance:**
- Minimal 10 workflow bisa tersimpan dan ditampilkan tanpa konflik data
- Perpindahan workflow di UI tidak mencampur `nodes/edges` antar workflow
- Save/Publish hanya mempengaruhi workflow yang sedang dipilih
- Workflow archived tidak muncul di default list (kecuali filter aktif)

---

## 🔹 PHASE 2 — Workflow Engine Runtime

### 🧩 5. Workflow Run & Execution
- [ ] Tambah entitas:
  - `workflow_runs`
  - `workflow_run_logs`
  - `workflow_approvals`
- [ ] Jalankan workflow published berdasarkan event ERP
- [ ] Pause/resume di node approval

**Acceptance:**
- Setiap run punya jejak log yang bisa diaudit
- Approval menghasilkan transisi state yang valid (`pending -> approved/rejected`)
