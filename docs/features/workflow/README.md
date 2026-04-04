# Modul: Otomatisasi Alur Kerja (Workflow)

## Deskripsi Fitur
Modul ini menyediakan workflow builder + runtime engine berbasis event.

Tujuan utamanya:
- menyusun alur bisnis secara visual,
- publish versi workflow yang immutable,
- mengeksekusi workflow dari event sistem,
- mencatat run, log, dan approval untuk audit.

## Arsitektur Teknis
- **Backend**:
  - `server/main.py`: endpoint authoring, lifecycle, runtime, approvals.
  - `server/models.py`: definisi `workflows`, `workflow_versions`, `workflow_runs`, `workflow_run_logs`, `workflow_approvals`.
  - `server/crud.py`: CRUD workflow + engine eksekusi runtime.
- **Frontend**:
  - `src/app/(dashboard)/workflows/page.tsx`: builder UI (list workflow, canvas, inspector).
  - `src/components/workflow/CustomNodes.tsx`: visual custom nodes.

## Node Library (Mode Sederhana)
Library default disederhanakan jadi 4 node inti:
- `trigger`
- `task`
- `approval`
- `end`

Kompatibilitas tetap dijaga untuk workflow lama (`action`, `ai`, `condition`).

## Konfigurasi Node
### Trigger
Contoh config trigger:
```json
{
  "event_name": "inventory.product.changed"
}
```

### Task
Task bersifat **config-driven** lintas modul (tidak hardcode per modul).

Contoh config task notifikasi stok rendah:
```json
{
  "action_type": "inventory.notification.create",
  "module": "inventory",
  "module_mention": "@inventory",
  "when": {
    "field": "stock",
    "operator": "<",
    "value": 10
  },
  "notification": {
    "title": "Stok Kritis",
    "message_template": "{{product_name}} tersisa {{stock}} unit (min {{min_stock}}).",
    "type": "warning"
  }
}
```

Catatan:
- `action_type` didukung dalam bentuk:
  - `notification.create`
  - `<module>.notification.create` (contoh: `inventory.notification.create`, `finance.notification.create`)
- Jika `notification.title` / `notification.message_template` tidak diisi, engine memakai default dari `label` / `description` node task.

## Runtime API Ringkas
- Trigger event manual: `POST /workflows/events`
- List run: `GET /workflows/runs`
- Detail run: `GET /workflows/runs/{run_id}`
- Log run: `GET /workflows/runs/{run_id}/logs`
- Pending approval: `GET /workflows/approvals/pending`
- Approve run: `POST /workflows/runs/{run_id}/approve`
- Reject run: `POST /workflows/runs/{run_id}/reject`

## Event dari Sistem (Otomatis)
Saat ini modul inventory sudah mengirim event domain otomatis ketika data produk berubah:
- `event_name`: `inventory.product.changed`
- terjadi saat create/update produk.

Dengan ini, workflow bisa berjalan tanpa curl/postman, selama trigger workflow memakai event yang sama.

## Panduan Penerusan (Engineer Selanjutnya)
1. Tambah emitter event generik lintas modul (`finance`, `hr`, `crm`, dll.) dengan pola domain event yang konsisten.
2. Tambah validasi graph yang lebih ketat (orphan node, branch wajib, dsb).
3. Tambah action executor nyata (integrasi ke service ERP riil), bukan hanya notification.
