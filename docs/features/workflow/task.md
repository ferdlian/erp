# Checklist & History Tugas: Workflow Engine Upgrade (ERP Ready)

## Tujuan
Mengembangkan workflow builder menjadi workflow engine berbasis event yang:
- dapat menjalankan alur bisnis,
- mendukung approval,
- memiliki audit log,
- mudah dikembangkan lintas modul.

---

## Status Saat Ini
- ? Workflow Builder (Authoring Tool)
- ? Workflow Engine Runtime Dasar (Event Trigger, Run, Log, Approval)

---

## PHASE 1 — Workflow Definition Layer

### 1. Workflow Status & Lifecycle
- [x] Tambah status `draft`, `published`, `archived`
- [x] Workflow baru default `draft`
- [x] Publish membuat versi aktif
- [x] Archive workflow tanpa hapus histori
- [x] Publish ulang dari archived diperbolehkan

### 2. Workflow Versioning
- [x] Tabel `workflow_versions`
- [x] Snapshot nodes + edges saat publish
- [x] Runtime memakai active version, bukan draft

### 3. Node Config
- [x] Semua node menyimpan `config`
- [x] Editor menyediakan input JSON config

### 4. Multi-Workflow Management
- [x] Buat banyak workflow
- [x] Workflow list dengan status dan versi aktif
- [x] Pilih workflow aktif untuk diedit
- [x] Duplikasi workflow
- [x] Archive workflow
- [x] Delete workflow
- [x] Search workflow list
- [x] Sidebar list bisa open/close

### 4.1. Penyederhanaan Node Builder (UX)
- [x] Node library disederhanakan menjadi 4 node inti:
  - `trigger`
  - `task`
  - `approval`
  - `end`
- [x] Tetap kompatibel dengan node legacy (`action`, `ai`, `condition`)

---

## PHASE 2 — Workflow Engine Runtime

### 5. Workflow Run & Execution
- [x] Entitas runtime:
  - `workflow_runs`
  - `workflow_run_logs`
  - `workflow_approvals`
- [x] Trigger workflow by event
- [x] Jalankan node per langkah
- [x] Pause/resume pada approval
- [x] Logging run untuk audit

### 5.1. Config-Driven Task Action (Lintas Modul)
- [x] Eksekusi task/action berbasis `config.action_type` (tidak hardcode inventory)
- [x] Dukungan action format:
  - `notification.create`
  - `<module>.notification.create`
- [x] Dukungan condition gate via `config.when`
- [x] Dukungan template notifikasi (`title`, `message_template`) berbasis payload
- [x] Fallback default notifikasi dari `label`/`description` node task

### 5.2. Integrasi Event dari Sistem
- [x] Modul inventory mengirim event domain otomatis saat create/update produk
- [x] Event yang dipakai saat ini: `inventory.product.changed`
- [x] Payload menyertakan data produk (`product_name`, `stock`, `min_stock`, dll)

---

## Acceptance Terkonfirmasi
- [x] Workflow dapat dijalankan oleh event sistem
- [x] Approval menghasilkan transisi valid (`pending -> approved/rejected`)
- [x] Run memiliki log audit yang dapat diakses API
- [x] Rule bisnis utama dapat diatur dari config node tanpa ubah kode backend per use case

---

## Backlog Lanjutan
- [ ] Emitter event generik untuk semua modul ERP (finance, hr, crm, supply-chain)
- [ ] Validasi graph lebih ketat sebelum publish
- [ ] Action executor ke service ERP nyata (bukan hanya notification)
