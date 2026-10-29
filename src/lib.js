export const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID')
export const parseRp = (s) => parseInt(String(s).replace(/[^0-9]/g, '')) || 0
export const PPN = 0.11

// Hitung rincian tagihan: PPN 11% dari (subtotal + ongkir - diskon)
export function calcOrder(o) {
  const subtotal = o.items.reduce((s, i) => s + i.qty * i.price, 0)
  const units = o.items.reduce((s, i) => s + i.qty, 0)
  const base = subtotal + o.shipping - o.discount
  const ppn = Math.round(base * PPN)
  return { subtotal, units, ppn, total: base + ppn }
}

export const METHODS = [
  { id: 'cash', label: 'Tunai (Cash)', icon: 'payments' },
  { id: 'qris', label: 'QRIS Dinamis', icon: 'qr_code_scanner' },
  { id: 'card', label: 'Debit / Kartu', icon: 'credit_card' },
  { id: 'va', label: 'Transfer Virtual', icon: 'account_balance' },
]
