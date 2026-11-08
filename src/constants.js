// Alasan pembatalan pesanan di kasir QUARZA.
export const CANCEL_REASONS = [
    'Pelanggan membatalkan pembelian',
    'Barang tidak tersedia / stok habis',
    'Salah input pesanan oleh sales consultant',
    'Pembayaran tidak dapat diproses',
    'Pelanggan tidak datang ke kasir',
    'Lainnya',
]

// Pilihan pengiriman: 'Ambil Mandiri di Toko' tidak memerlukan alamat; Kurir Instan & Cargo wajib alamat.
export const DELIVERY = ['Ambil Mandiri di Toko', 'Kurir Instan', 'Cargo']

// Daftar sales consultant & pengajuan pembayaran untuk form antrean baru.
export const SALES_LIST = ['Dimas Aditya', 'Siti Rahma', 'Keira Cenat']
export const REQUEST_METHODS = ['Tunai (Cash)', 'QRIS Dinamis', 'EDC BCA', 'EDC Mandiri', 'Transfer BCA VA']
