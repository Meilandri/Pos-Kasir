import { useEffect, useState } from 'react'
import { initialOrders } from './data.js'
import { calcOrder } from './lib.js'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Queue from './pages/Queue.jsx'
import Payment from './pages/Payment.jsx'
import History from './pages/History.jsx'

// Simpan sesi login & halaman aktif di browser agar tidak hilang saat refresh
const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)) } catch { /* abaikan */ } }

export default function App() {
  const [cashier, setCashier] = useState(() => read('pos.cashier', null))      // { name, code }
  const [page, setPage] = useState(() => read('pos.page', 'queue'))         // queue | payment | history
  // Antrean & riwayat disimpan di browser (localStorage) agar tidak hilang saat di-refresh
  const [orders, setOrders] = useState(() => {
    const saved = read('pos.orders', null)
    return Array.isArray(saved) ? saved
      : initialOrders.map((o) => ({ ...o, delivery: o.delivery === 'Kirim Ekspedisi Toko' ? 'Cargo' : o.delivery }))
  })
  const [history, setHistory] = useState(() => {
    const saved = read('pos.history', [])
    // waktu disimpan sebagai teks, ubah kembali menjadi Date
    return Array.isArray(saved) ? saved.map((h) => ({ ...h, time: new Date(h.time) })) : []
  })
  const [activeId, setActiveId] = useState(null)

  // Halaman pembayaran tidak dipulihkan (butuh pesanan aktif), jadi kembali ke antrean
  useEffect(() => { write('pos.page', page === 'payment' ? 'queue' : page) }, [page])
  useEffect(() => { if (page === 'payment' && !activeId) setPage('queue') }, [page, activeId])
  useEffect(() => { write('pos.orders', orders) }, [orders])
  useEffect(() => { write('pos.history', history) }, [history])

  const login = (c) => { write('pos.cashier', c); setCashier(c) }
  const logout = () => { write('pos.cashier', null); setCashier(null); setPage('queue') }

  if (!cashier) return <Login onLogin={login} />

  const active = orders.find((o) => o.id === activeId)

  const startPayment = (id) => { setActiveId(id); setPage('payment') }

  // Simpan perubahan detail pesanan (pembeli, pengiriman, barang) agar ikut tampil di antrean
  const updateOrder = (updated) =>
    setOrders((os) => os.map((o) => (o.id === updated.id ? updated : o)))

  // Catat transaksi ke riwayat. Pesanan BELUM dihapus dari antrean,
  // supaya halaman pembayaran tetap ada selama struk ditampilkan.
  const completePayment = (order, method, received) => {
    const trx = {
      trx: `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(90 + history.length).padStart(3, '0')}`,
      status: 'paid', time: new Date(), method, received, cashier, order, ...calcOrder(order),
    }
    setHistory((h) => [trx, ...h])
    return trx
  }

  // Buat antrean baru dari kasir (muncul paling atas)
  const createOrder = (data) => {
    const nums = [...orders, ...history.map((h) => h.order)].map((o) => parseInt(o.id.replace(/\D/g, '')) || 0)
    const n = Math.max(21102800, ...nums) + 1
    setOrders((os) => [{ id: `SLS-${n}`, spk: `OGN-${n}`, ago: 'Baru saja', ...data }, ...os])
  }

  // Batalkan pesanan: hapus dari antrean, catat ke riwayat beserta alasan
  const cancelOrder = (order, reason) => {
    const entry = {
      trx: `BTL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(90 + history.length).padStart(3, '0')}`,
      status: 'cancelled', reason, time: new Date(), cashier, order, ...calcOrder(order),
    }
    setHistory((h) => [entry, ...h])
    setOrders((os) => os.filter((o) => o.id !== order.id))
    setActiveId(null)
  }

  // Dipanggil saat struk ditutup: hapus dari antrean lalu kembali ke antrean
  const finishPayment = (id) => {
    setOrders((os) => os.filter((o) => o.id !== id))
    setActiveId(null)
    setPage('queue')
  }

  return (
    <>
      <Header page={page} setPage={setPage} cashier={cashier} queueCount={orders.length}
        onLogout={logout} />
      <main className="pt-20 min-h-screen">
        {page === 'queue' && <Queue orders={orders} onPay={startPayment} onCreate={createOrder} onCancel={cancelOrder} />}
        {page === 'payment' && active && (
          <Payment order={active} onBack={() => setPage('queue')} onUpdate={updateOrder}
            onCancel={(o, reason) => { cancelOrder(o, reason); setPage('queue') }}
            onComplete={completePayment} onDone={() => finishPayment(active.id)} />
        )}
        {page === 'history' && <History history={history} />}
      </main>
    </>
  )
}