import { useMemo, useState } from 'react'
import { calcOrder, rp } from '../lib.js'
import CancelOrderModal from '../components/CancelOrderModal.jsx'

export default function Queue({ orders, onPay, onNew, onCancel }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
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
    <div className="px-3 sm:px-6 py-5 flex flex-col gap-4 max-w-[1720px] mx-auto">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">
            Antrean Menunggu Kasir
          </span>
          <div className="text-[28px] sm:text-[32px] font-bold text-on-surface mt-1">{orders.length}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">
            Total Nilai Antrean Showroom
          </span>
          <div className="text-[22px] sm:text-[26px] font-bold text-accent mt-1">{rp(totalValue)}</div>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 flex-1 max-w-xl border border-outline-variant/20 focus-within:border-accent/60 transition-all">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari Order ID, nama pelanggan, atau no. telepon..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant/60"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:flex lg:items-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-surface-container-low font-semibold text-xs sm:text-sm py-2.5 px-3 rounded-xl outline-none border border-outline-variant/20 cursor-pointer"
          >
            <option value="newest">Paling Baru Masuk</option>
            <option value="oldest">Waktu Antrean Terlama</option>
            <option value="amount">Nominal Tertinggi</option>
          </select>
          <button
            onClick={onNew}
            className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="sm:hidden">Antrean Baru</span>
            <span className="hidden sm:inline">Buat Antrean Baru</span>
          </button>
        </div>
      </div>

      {list.length === 0 && (
        <div className="text-center text-on-surface-variant py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-2 block">inbox</span>
          <p className="font-medium text-sm">Tidak ada pesanan di antrean kasir saat ini.</p>
        </div>
      )}

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {list.map((o) => {
          const c = calcOrder(o)
          return (
            <div
              key={o.id}
              className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md border border-outline-variant/30 transition-all flex flex-col gap-3.5"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container font-mono font-bold text-xs tracking-wide">
                    #{o.id}
                  </span>
                  {o.mergedFrom?.length > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-success-container text-on-success-container text-[11px] font-bold">
                      Gabungan {o.mergedFrom.length + 1} pesanan
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg font-medium">
                  {o.ago}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/15">
                <div>
                  <div className={`font-bold text-sm ${o.customer ? 'text-on-surface' : 'text-on-surface-variant italic'}`}>
                    {o.customer || 'Pelanggan belum diisi'}
                  </div>
                  <div className="font-mono text-xs text-on-surface-variant mt-0.5">{o.phone}</div>
                </div>
                <div className="text-xs text-on-surface-variant sm:text-right flex flex-col justify-center">
                  <span>Sales Consultant</span>
                  <strong className="text-on-surface font-semibold">{o.sales}</strong>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant">
                <div className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-accent">chair</span>
                  {o.items.length} Koleksi Furniture ({c.units} Unit Total)
                </div>
                <div className="space-y-0.5 pl-1">
                  {o.items.map((i) => (
                    <div key={i.sku} className="truncate">
                      • {i.name} <span className="font-semibold">({i.qty}x)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-container-low/40 -mx-5 -mb-5 px-5 py-3.5 rounded-b-2xl border-t border-outline-variant/20">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">Total Tagihan Final</div>
                  <div className="text-[22px] font-extrabold text-on-surface">{rp(c.total)}</div>
                </div>
                <div className="flex items-center gap-2 [&>button:last-child]:flex-1 sm:[&>button:last-child]:flex-none">
                  <button
                    onClick={() => setCancelTarget(o)}
                    className="px-3 py-2.5 rounded-xl text-error hover:bg-error-container/60 font-semibold text-xs flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>Batalkan
                  </button>
                  <button
                    onClick={() => onPay(o.id)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-secondary active:scale-[0.98] text-on-primary font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">payments</span>Proses Pembayaran
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={(reason) => {
            onCancel(cancelTarget, reason)
            setCancelTarget(null)
          }}
        />
      )}
    </div>
  )
}
