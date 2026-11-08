import { useState } from 'react'
import { rp, METHODS } from '../lib.js'
import Receipt from '../components/Receipt.jsx'

const isCancelled = (h) => h.status === 'cancelled'

export default function History({ history }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | paid | cancelled
  const [open, setOpen] = useState(null)

  const paid = history.filter((h) => h.status !== 'cancelled')
  const cancelled = history.filter((h) => h.status === 'cancelled')

  const t = q.toLowerCase()
  const rows = history.filter((h) => {
    const isCanc = h.status === 'cancelled'
    if (filter === 'paid' && isCanc) return false
    if (filter === 'cancelled' && !isCanc) return false
    const searchStr = `${h.trx} ${h.order.id} ${h.order.customer} ${h.order.sales} ${h.reason || ''}`.toLowerCase()
    return searchStr.includes(t)
  })

  const omset = paid.reduce((s, h) => s + h.total, 0)
  const units = paid.reduce((s, h) => s + h.units, 0)

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const head = 'No Transaksi,Waktu,Sales,Pelanggan,Total,Metode,Status,Alasan Pembatalan\n'
    const body = rows.map((h) => [
      h.trx, h.time.toISOString(), h.order.sales, h.order.customer, h.total,
      isCancelled(h) ? '-' : h.method, isCancelled(h) ? 'Dibatalkan' : 'Lunas', h.reason || '',
    ].map(esc).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }))
    a.download = 'quarza-riwayat-transaksi.csv'; a.click()
  }

  const chip = (id) => `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === id ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`

  return (
    <div className="px-3 sm:px-6 py-5 flex flex-col gap-4 max-w-[1720px] mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat l="Total Omset Kasir" v={rp(omset)} accent />
        <Stat l="Transaksi Lunas" v={`${paid.length} Pesanan`} />
        <Stat l="Koleksi Terjual" v={`${units} Unit`} />
        <Stat l="Pesanan Dibatalkan" v={`${cancelled.length} Pesanan`} danger={cancelled.length > 0} />
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-3 justify-between md:items-center">
        <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 w-full max-w-sm border border-outline-variant/20 focus-within:border-accent/60 transition-all">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari transaksi, pelanggan, atau sales..." className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant/60" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button className={chip('all')} onClick={() => setFilter('all')}>Semua ({history.length})</button>
            <button className={chip('paid')} onClick={() => setFilter('paid')}>Lunas ({paid.length})</button>
            <button className={chip('cancelled')} onClick={() => setFilter('cancelled')}>Dibatalkan ({cancelled.length})</button>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-xl font-semibold text-xs border border-outline-variant/20 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>Ekspor CSV
          </button>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.length === 0 && (
          <div className="text-center text-on-surface-variant py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
            Belum ada transaksi di riwayat.
          </div>
        )}
        {rows.map((h) => {
          const x = isCancelled(h)
          return (
            <div key={h.trx} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-2.5">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className={`font-mono font-bold text-xs tracking-wide ${x ? 'text-error' : 'text-on-surface'}`}>#{h.trx}</div>
                  <div className="text-[11px] text-on-surface-variant">{h.time.toLocaleTimeString('id-ID')}</div>
                </div>
                {x
                  ? <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">DIBATALKAN</span>
                  : <span className="px-2.5 py-0.5 rounded-full bg-success-container text-on-success-container text-[10px] font-bold">LUNAS</span>}
              </div>
              <div>
                <div className="font-semibold text-sm text-on-surface">{h.order.customer || '-'}</div>
                <div className="text-xs text-on-surface-variant">Sales Consultant: {h.order.sales}</div>
              </div>
              <div className="text-xs text-on-surface-variant">{h.order.items.map((i) => <div key={i.sku}>• {i.name} ({i.qty}x)</div>)}</div>
              {x && <div className="text-xs text-on-surface-variant bg-error-container/40 p-2 rounded-lg">Alasan: {h.reason}</div>}
              <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20">
                <div>
                  <div className={`font-bold text-base ${x ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{rp(h.total)}</div>
                  {!x && <div className="text-[11px] text-on-surface-variant">{METHODS.find((m) => m.id === h.method)?.label}</div>}
                </div>
                {!x && (
                  <button onClick={() => setOpen(h)} className="px-4 py-2 bg-primary hover:bg-secondary text-on-primary rounded-xl text-xs font-semibold shadow-sm transition-all">
                    Lihat Struk
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tablet & Desktop Table */}
      <div className="hidden md:block bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ink text-on-ink text-xs uppercase tracking-wider">
            <tr>
              {['No Transaksi', 'Sales Consultant', 'Pelanggan', 'Rincian Furniture', 'Total Bayar', 'Metode', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="p-3.5 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-sm">
            {rows.length === 0 && (
              <tr>
                <td colSpan="8" className="p-12 text-center text-on-surface-variant">
                  Belum ada transaksi. Selesaikan atau batalkan pesanan dari antrean kasir untuk melihatnya di sini.
                </td>
              </tr>
            )}
            {rows.map((h) => {
              const x = isCancelled(h)
              return (
                <tr key={h.trx} className="hover:bg-surface-container-low/50 align-top transition-colors">
                  <td className="p-3.5">
                    <div className={`font-mono font-bold text-xs ${x ? 'text-error' : 'text-on-surface'}`}>#{h.trx}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{x && <>#{h.order.id} · </>}{h.time.toLocaleTimeString('id-ID')}</div>
                  </td>
                  <td className="p-3.5 font-medium">{h.order.sales}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-on-surface">{h.order.customer || '-'}</div>
                    <div className="font-mono text-xs text-on-surface-variant">{h.order.phone}</div>
                  </td>
                  <td className="p-3.5 text-xs">
                    <div className="space-y-0.5 max-w-[260px]">
                      {h.order.items.map((i) => (
                        <div key={i.sku} className="truncate">• {i.qty}x {i.name}</div>
                      ))}
                    </div>
                  </td>
                  <td className={`p-3.5 text-right font-bold whitespace-nowrap ${x ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {rp(h.total)}
                    <div className="text-xs font-normal text-on-surface-variant no-underline">{h.units} Unit</div>
                  </td>
                  <td className="p-3.5 text-xs">{x ? '-' : METHODS.find((m) => m.id === h.method)?.label}</td>
                  <td className="p-3.5 min-w-[160px]">
                    {x ? (
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">DIBATALKAN</span>
                        <div className="text-xs text-on-surface-variant mt-1.5 max-w-[200px] leading-snug">{h.reason}</div>
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-success-container text-on-success-container text-xs font-bold">LUNAS</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {x ? (
                      <span className="text-xs text-on-surface-variant">-</span>
                    ) : (
                      <button onClick={() => setOpen(h)} className="px-3.5 py-1.5 bg-primary hover:bg-secondary text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all">
                        Struk
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {open && <Receipt trx={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

const Stat = ({ l, v, accent, danger }) => (
  <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{l}</div>
    <div className={`text-[18px] sm:text-[24px] font-bold mt-1 ${accent ? 'text-accent' : danger ? 'text-error' : 'text-on-surface'}`}>{v}</div>
  </div>
)
