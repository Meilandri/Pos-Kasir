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
  const [orders, setOrders] = useState(initialOrders)
  const [history, setHistory] = useState([])
  const [activeId, setActiveId] = useState(null)

  if (!cashier) return <Login onLogin={setCashier} />

  const active = orders.find((o) => o.id === activeId)

  const startPayment = (id) => { setActiveId(id); setPage('payment') }

  // Catat transaksi ke riwayat. Pesanan BELUM dihapus dari antrean,
  // supaya halaman pembayaran tetap ada selama struk ditampilkan.
  const completePayment = (order, method, received) => {
    const trx = {
      trx: `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(90 + history.length).padStart(3, '0')}`,
      time: new Date(), method, received, cashier, order, ...calcOrder(order),
    }
    setHistory((h) => [trx, ...h])
    return trx
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
        {page === 'queue' && <Queue orders={orders} onPay={startPayment} />}
        {page === 'payment' && active && (
          <Payment order={active} onBack={() => setPage('queue')}
            onComplete={completePayment} onDone={() => finishPayment(active.id)} />
        )}
        {page === 'history' && <History history={history} />}
      </main>
    </>
  )
}