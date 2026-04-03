# Checklist & History Tugas: Frontend State

## Riwayat Penyelesaian (Selesai)
- [x] Bangun struktur data store kompleks `lib/types.ts`.
- [x] Setup Zustand dengan dummy data di awal (sebelum transisi HTTP API).
- [x] Re-konstruksi *Mock Data* menjadi *Dynamic Fetching* dengan API `http://localhost:8000/`.
- [x] Parsing data seragam ke variabel reaktif secara rekursif (`store.ts`).
- [x] Terapkan global proteksi header Request dengan *JWT Access Token*.

## Rencana Masa Depan (Backlog)
- [ ] Transformasi arsitektural dari monolithic store Zustand menjadi sliced pattern.
- [ ] Setup `react-query` atau `SWR` untuk fitur *caching* dan revalidasi di tab *background*.
- [ ] Koneksi WebSocket `/wss` antara backend untuk live updates di _dashboard_ (notifikasi stok langsung berkurang).
