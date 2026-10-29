import { useState } from 'react'
import { initialOrders } from './data.js'
import { calcOrder } from './lib.js'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Queue from './pages/Queue.jsx'
import Payment from './pages/Payment.jsx'
import History from './pages/History.jsx'

export default function App() {
  const [cashier, setCashier] = useState(null)      // { name, code }
  const [page, setPage] = useState('queue')         // queue | payment | history
  const [orders, setOrders] = useState(initialOrders.map((o) => ({ ...o, delivery: o.delivery === 'Kirim Ekspedisi Toko' ? 'Cargo' : o.delivery })))
  const [history, setHistory] = useState([])
  const [activeId, setActiveId] = useState(null)

  if (!cashier) return <Login onLogin={setCashier} />

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
        onLogout={() => { setCashier(null); setPage('queue') }} />
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