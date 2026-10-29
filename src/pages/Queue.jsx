import { useMemo, useState } from 'react'
import { calcOrder, rp } from '../lib.js'
import NewOrderModal from '../components/NewOrderModal.jsx'
import CancelOrderModal from '../components/CancelOrderModal.jsx'

export default function Queue({ orders, onPay, onCreate, onCancel }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [newOpen, setNewOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const list = useMemo(() => {
    const term = q.toLowerCase()
    const rows = orders.filter((o) => `${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(term))
    if (sort === 'amount') rows.sort((a, b) => calcOrder(b).total - calcOrder(a).total)
    if (sort === 'oldest') rows.reverse()
    return rows
  }, [orders, q, sort])

  const totalValue = orders.reduce((s, o) => s + calcOrder(o).total, 0)

  return (
    <div className="px-3 py-4 flex flex-col gap-4 max-w-[1720px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-on-surface-variant">Antrean Menunggu Kasir</span>
          <div className="text-[28px] font-bold">{orders.length}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-on-surface-variant">Total Nilai Antrean</span>
          <div className="text-[22px] font-bold">{rp(totalValue)}</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 flex-1 max-w-xl">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari Order ID, nama customer, atau no. telepon"
            className="w-full bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-surface-container-low font-semibold py-2.5 px-3 rounded-lg outline-none">
            <option value="newest">Paling Baru Masuk</option>
            <option value="oldest">Waktu Antrean Terlama</option>
            <option value="amount">Nominal Tertinggi</option>
          </select>
          <button onClick={() => setNewOpen(true)} className="px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-bold flex items-center gap-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined text-[20px]">add</span>Buat Antrean Baru
          </button>
        </div>
      </div>

      {list.length === 0 && <p className="text-center text-on-surface-variant py-16">Tidak ada pesanan di antrean.</p>}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {list.map((o) => {
          const c = calcOrder(o)
          return (
            <div key={o.id} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg bg-surface-container-high font-mono font-bold text-xs">#{o.id}</span>
                <span className="text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-lg">{o.ago}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 p-2 rounded-xl bg-surface-container-low/40">
                <div>
                  <div className="font-bold">{o.customer}</div>
                  <div className="font-mono text-xs text-on-surface-variant">{o.phone}</div>
                </div>
                <div className="text-xs text-on-surface-variant sm:text-right">
                  Sales: <strong className="text-on-surface">{o.sales}</strong>
                </div>
              </div>
              <div className="text-xs text-on-surface-variant">
                <div className="font-semibold text-on-surface mb-0.5">{o.items.length} Jenis Produk ({c.units} Unit Total)</div>
                {o.items.map((i) => <div key={i.sku}>• {i.name} ({i.qty}x)</div>)}
              </div>
              <div className="flex items-center justify-between bg-surface-container-low/30 -mx-4 -mb-4 px-4 py-3 rounded-b-xl border-t border-surface-container">
                <div>
                  <div className="text-[10px] text-on-surface-variant">Total Tagihan</div>
                  <div className="text-[22px] font-extrabold">{rp(c.total)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCancelTarget(o)} className="px-3 py-2.5 rounded-lg text-error hover:bg-error-container/60 font-semibold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>Batalkan
                  </button>
                  <button onClick={() => onPay(o.id)} className="px-4 py-2.5 rounded-lg bg-primary hover:brightness-105 active:scale-[0.98] text-on-primary font-bold shadow-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px]">payments</span>Proses Pembayaran
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {newOpen && <NewOrderModal onClose={() => setNewOpen(false)} onSave={(data) => { onCreate(data); setNewOpen(false) }} />}
      {cancelTarget && (
        <CancelOrderModal order={cancelTarget} onClose={() => setCancelTarget(null)}
          onConfirm={(reason) => { onCancel(cancelTarget, reason); setCancelTarget(null) }} />
      )}
    </div>
  )
}