import { useMemo, useState } from 'react'
import { rp, METHODS } from '../lib.js'
import Receipt from '../components/Receipt.jsx'

const isCancelled = (h) => h.status === 'cancelled'

export default function History({ history }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | paid | cancelled
  const [open, setOpen] = useState(null)

  const paid = history.filter((h) => !isCancelled(h))
  const cancelled = history.filter(isCancelled)

  const rows = useMemo(() => {
    const t = q.toLowerCase()
    return history.filter((h) => {
      if (filter === 'paid' && isCancelled(h)) return false
      if (filter === 'cancelled' && !isCancelled(h)) return false
      return `${h.trx} ${h.order.id} ${h.order.customer} ${h.order.sales} ${h.reason || ''}`.toLowerCase().includes(t)
    })
  }, [history, q, filter])

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
    a.download = 'riwayat-transaksi.csv'; a.click()
  }

  const chip = (id) => `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`

  return (
    <div className="p-4 flex flex-col gap-4 max-w-[1720px] mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat l="Total Omset Kasir (Sesi Ini)" v={rp(omset)} />
        <Stat l="Total Transaksi Lunas" v={paid.length} />
        <Stat l="Item Terjual" v={`${units} Unit`} />
        <Stat l="Pesanan Dibatalkan" v={cancelled.length} />
      </div>
      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 justify-between md:items-center">
        <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 w-full max-w-sm">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari transaksi, pelanggan, sales, atau alasan..." className="w-full bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
            <button className={chip('all')} onClick={() => setFilter('all')}>Semua ({history.length})</button>
            <button className={chip('paid')} onClick={() => setFilter('paid')}>Lunas ({paid.length})</button>
            <button className={chip('cancelled')} onClick={() => setFilter('cancelled')}>Dibatalkan ({cancelled.length})</button>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg font-semibold text-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>Ekspor CSV
          </button>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-ink text-on-ink text-xs">
            <tr>{['No Transaksi', 'Sales', 'Pelanggan', 'Rincian Barang', 'Total Bayar', 'Metode', 'Status', 'Aksi'].map((h) => <th key={h} className="p-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="8" className="p-10 text-center text-on-surface-variant">Belum ada data. Selesaikan atau batalkan pesanan dari antrean untuk melihatnya di sini.</td></tr>}
            {rows.map((h) => {
              const x = isCancelled(h)
              return (
                <tr key={h.trx} className="hover:bg-surface-container-low/60 align-top">
                  <td className="p-3">
                    <div className={`font-mono font-bold ${x ? 'text-error' : 'text-on-surface'}`}>#{h.trx}</div>
                    <div className="text-xs text-on-surface-variant">{x && <>#{h.order.id} · </>}{h.time.toLocaleTimeString('id-ID')}</div>
                  </td>
                  <td className="p-3 font-semibold">{h.order.sales}</td>
                  <td className="p-3"><div className="font-semibold">{h.order.customer}</div><div className="font-mono text-xs text-on-surface-variant">{h.order.phone}</div></td>
                  <td className="p-3 text-xs">{h.order.items.map((i) => <div key={i.sku}>{i.qty}x {i.name}</div>)}</td>
                  <td className={`p-3 text-right font-bold whitespace-nowrap ${x ? 'text-on-surface-variant line-through' : ''}`}>{rp(h.total)}<div className="text-xs font-normal text-on-surface-variant no-underline">{h.units} Unit</div></td>
                  <td className="p-3 text-xs">{x ? '-' : METHODS.find((m) => m.id === h.method)?.label}</td>
                  <td className="p-3 min-w-[180px]">
                    {x ? (
                      <>
                        <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold">DIBATALKAN</span>
                        <div className="text-xs text-on-surface-variant mt-1.5 max-w-[220px]">Alasan: {h.reason}</div>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-success-container text-on-success-container text-xs font-bold">LUNAS</span>
                    )}
                  </td>
                  <td className="p-3">
                    {x ? <span className="text-xs text-on-surface-variant">-</span>
                      : <button onClick={() => setOpen(h)} className="px-3 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold">Struk</button>}
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
const Stat = ({ l, v }) => (
  <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm"><div className="text-xs font-semibold text-on-surface-variant">{l}</div><div className="text-[24px] font-bold">{v}</div></div>
)