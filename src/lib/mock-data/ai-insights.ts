import { AIInsight, ModuleHealth } from '../types';

export const moduleHealthScores: ModuleHealth[] = [
  { module: 'finance', score: 87, trend: 'up', issues: 2, label: 'Keuangan' },
  { module: 'inventory', score: 72, trend: 'down', issues: 5, label: 'Inventaris' },
  { module: 'hr', score: 91, trend: 'up', issues: 1, label: 'SDM' },
  { module: 'crm', score: 78, trend: 'stable', issues: 3, label: 'Penjualan' },
  { module: 'supply-chain', score: 84, trend: 'up', issues: 2, label: 'Rantai Pasok' },
];

export const globalInsights: AIInsight[] = [
  {
    id: 'g-1',
    type: 'recommendation',
    module: 'dashboard',
    title: 'Optimalisasi Lintas Modul',
    description: 'AI mendeteksi bahwa tingginya penutupan kesepakatan CRM berkorelasi dengan kekurangan inventaris di 3 lini produk. Disarankan menyiapkan stok item terlaris sebelum dorongan penjualan Q2.',
    impact: 'high',
    confidence: 0.91,
    timestamp: '2026-04-02T10:30:00Z',
    actionable: true,
    action: 'Lihat analisis terkait',
  },
  {
    id: 'g-2',
    type: 'alert',
    module: 'dashboard',
    title: 'Peringatan Arus Kas',
    description: 'Analisis gabungan: 3 faktur jatuh tempo (Rp770 juta) + 2 PO besar yang tertunda (Rp1,07 miliar) dapat menciptakan celah arus kas dalam 14 hari. Perlu tindakan dari Keuangan + Rantai Pasok.',
    impact: 'high',
    confidence: 0.88,
    timestamp: '2026-04-02T09:00:00Z',
    actionable: true,
    action: 'Lihat rencana arus kas',
  },
  {
    id: 'g-3',
    type: 'prediction',
    module: 'dashboard',
    title: 'Pembaruan Prakiraan Pendapatan',
    description: 'Berdasarkan pipeline CRM (Rp12,5 miliar) dan tingkat konversi saat ini 32,5%, AI memprediksi pendapatan Rp4,06 miliar kuartal ini. Naik 8% dari kuartal lalu.',
    impact: 'medium',
    confidence: 0.82,
    timestamp: '2026-04-01T15:00:00Z',
    actionable: false,
  },
  {
    id: 'g-4',
    type: 'recommendation',
    module: 'dashboard',
    title: 'Penyelarasan Tenaga Kerja-Penjualan',
    description: 'Data SDM menunjukkan tim Penjualan kekurangan 2 anggota saat memiliki nilai pipeline tertinggi per orang. Mempercepat perekrutan untuk 2 posisi penjualan yang terbuka dapat meningkatkan pendapatan Q2 sebesar Rp850 juta.',
    impact: 'high',
    confidence: 0.76,
    timestamp: '2026-04-01T11:00:00Z',
    actionable: true,
    action: 'Lihat dampak perekrutan',
  },
  {
    id: 'g-5',
    type: 'anomaly',
    module: 'dashboard',
    title: 'Lonjakan Biaya Rantai Pasok',
    description: 'Biaya logistik meningkat 23% bulan ini sementara volume pesanan hanya tumbuh 8%. Penyelidikan menunjukkan inefisiensi rute dan biaya tambahan bahan bakar 15% dari 2 kurir.',
    impact: 'medium',
    confidence: 0.85,
    timestamp: '2026-04-01T08:00:00Z',
    actionable: true,
    action: 'Optimalkan rute',
  },
];

export const companyMetrics = {
  overallHealth: 82,
  healthTrend: 'up' as const,
  revenue: { value: 8475000000, change: 12.5, period: 'vs kuartal lalu' },
  activeDeals: { value: 47, change: 8.2, period: 'vs bulan lalu' },
  employeeCount: { value: 87, change: 3.5, period: 'vs kuartal lalu' },
  inventoryValue: { value: 2340000000, change: -2.1, period: 'vs bulan lalu' },
  customerSatisfaction: { value: 94.2, change: 1.8, period: 'vs kuartal lalu' },
  openOrders: { value: 18, change: -5.3, period: 'vs minggu lalu' },
};

export const recentActivity = [
  { id: 'a1', module: 'finance' as const, action: 'Faktur #INV-2026-042 dibuat', detail: 'PT Maju Bersama - Rp250.000.000', time: '10 mnt yang lalu', icon: 'receipt' },
  { id: 'a2', module: 'crm' as const, action: 'Kesepakatan dipindah ke Negosiasi', detail: 'Paket Analitik Data - PT Ritel Modern', time: '25 mnt yang lalu', icon: 'handshake' },
  { id: 'a3', module: 'inventory' as const, action: 'Peringatan stok rendah dipicu', detail: 'USB-C Hub 7-in-1 (8 unit tersisa)', time: '1 jam yang lalu', icon: 'package' },
  { id: 'a4', module: 'hr' as const, action: 'Ulasan kinerja selesai', detail: 'Dewi Lestari - Skor: 95/100', time: '2 jam yang lalu', icon: 'user-check' },
  { id: 'a5', module: 'supply-chain' as const, action: 'PO-2026-089 dikirim', detail: 'PT Komponen Prima - 5 item', time: '3 jam yang lalu', icon: 'truck' },
  { id: 'a6', module: 'finance' as const, action: 'Pembayaran diterima', detail: 'CV Teknologi Mandiri - Rp185.000.000', time: '4 jam yang lalu', icon: 'credit-card' },
  { id: 'a7', module: 'crm' as const, action: 'Prospek baru ditangkap', detail: 'Bambang Susilo - PT Pabrik Pintar', time: '5 jam yang lalu', icon: 'user-plus' },
  { id: 'a8', module: 'hr' as const, action: 'Penawaran dikirim ke kandidat', detail: 'DevOps Engineer - Hendro W.', time: '6 jam yang lalu', icon: 'send' },
];

export const chatResponses: Record<string, { answer: string; data?: Record<string, unknown> }> = {
  'revenue': {
    answer: 'Total pendapatan kuartal ini adalah **Rp8,475 Miliar**, yang mana **12,5% lebih tinggi** dari kuartal lalu. Penjualan Produk adalah kontributor utama dengan Rp3,85 Miliar (45,4%), diikuti oleh Layanan Jasa sebesar Rp2,25 Miliar (26,5%). AI memprediksi pertumbuhan berkelanjutan 8-12% kuartal depan berdasarkan kekuatan pipeline saat ini.',
  },
  'inventory': {
    answer: 'Ringkasan inventaris saat ini: **156 produk** dengan total nilai **Rp2,34 Miliar**. ⚠️ **3 produk habis stok** dan **12 berada di bawah level minimum**. Saya telah membuat saran pemesanan otomatis untuk item kritis. Yang paling mendesak: Webcam HD 1080p (0 unit) perlu restock segera sebanyak 35 unit.',
  },
  'employees': {
    answer: 'Kita memiliki **87 karyawan aktif** di 7 departemen. Skor kinerja rata-rata adalah **78/100** (tren meningkat). Performa terbaik: Dewi Lestari (95), Budi Santoso (92), Siti Nurhaliza (88). ⚠️ AI telah menandai 3 karyawan dengan risiko resign — disarankan meninjau strategi retensi.',
  },
  'deals': {
    answer: 'Pipeline aktif: **47 kesepakatan** senilai **Rp12,5 Miliar**. Bulan ini: **8 kesepakatan dimenangkan**. Tingkat konversi saat ini: **32,5%**. ⚠️ Peringatan AI: Kesepakatan "Platform Enterprise - PT Garuda" (Rp450 Juta) menunjukkan penurunan keterlibatan — probabilitas penutupan turun menjadi 42%. Disarankan segera dihubungi.',
  },
  'suppliers': {
    answer: 'Bekerja dengan **34 pemasok**, **18 pesanan aktif**. Tingkat pengiriman tepat waktu: **87,3%**. Pemasok teratas: PT Komponen Prima (skor reliabilitas 95). AI menyarankan konsolidasi 3 pemasok yang tumpang tindih dapat menghemat **18% biaya logistik**.',
  },
  'default': {
    answer: 'Saya dapat membantu Anda dengan wawasan di semua modul! Coba tanyakan tentang:\n\n• **Pendapatan** — Performa keuangan & prakiraan\n• **Inventaris** — Level stok & saran restock\n• **Karyawan** — Performa tim & analitik SDM\n• **Penjualan** — Pipeline penjualan & wawasan CRM\n• **Pemasok** — Performa rantai pasok\n\nAtau tanya apa pun seperti "Apa yang butuh perhatian saya hari ini?"',
  },
  'attention': {
    answer: '🔴 **Item prioritas yang membutuhkan perhatian Anda:**\n\n1. **Keuangan**: 1 faktur jatuh tempo dari PT Digital Nusantara (Rp320.000.000) — terlambat 5 hari\n2. **Inventaris**: 3 produk habis stok, 4 permintaan pemesanan otomatis menunggu persetujuan\n3. **CRM**: Kesepakatan Enterprise berisiko — keterlibatan PT Garuda turun drastis\n4. **SDM**: 3 karyawan berkinerja tinggi ditandai risiko resign\n5. **Rantai Pasok**: PO-2026-089 memiliki probabilitas penundaan 78%\n\nKesehatan sistem secara keseluruhan: **82/100** (Baik)',
  },
};
