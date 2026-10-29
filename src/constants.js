// Alasan pembatalan pesanan. Ubah/tambah sesuai kebijakan toko (opsi "Lainnya" meminta keterangan).
export const CANCEL_REASONS = [
    'Pelanggan membatalkan pembelian',
    'Barang tidak tersedia / stok habis',
    'Salah input pesanan oleh sales',
    'Pembayaran tidak dapat diproses',
    'Pelanggan tidak datang ke kasir',
    'Lainnya',
]

// Daftar sales & pengajuan pembayaran untuk form antrean baru (ganti dengan data asli/API).
export const SALES_LIST = ['Kai Cenat', 'Dimas Aditya', 'Siti Rahma']
export const REQUEST_METHODS = ['Tunai (Cash)', 'QRIS Dinamis', 'EDC BCA', 'EDC Mandiri', 'Transfer BCA VA']