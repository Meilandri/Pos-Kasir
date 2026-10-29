import { useMemo, useState } from 'react'
import { rp, METHODS } from '../lib.js'
import Receipt from '../components/Receipt.jsx'

export default function History({ history }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const rows = useMemo(() => {
    const t = q.toLowerCase()
    return history.filter((h) => `${h.trx} ${h.order.customer} ${h.order.sales}`.toLowerCase().includes(t))
  }, [history, q])

  const omset = history.reduce((s, h) => s + h.total, 0)
  const units = history.reduce((s, h) => s + h.units, 0)

  const exportCsv = () => {
    const head = 'No Transaksi,Waktu,Sales,Pelanggan,Total,Metode\n'
    const body = rows.map((h) => [h.trx, h.time.toISOString(), h.order.sales, h.order.customer, h.total, h.method].join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }))
    a.download = 'riwayat-transaksi.csv'; a.click()
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-[1720px] mx-auto">
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat l="Total Omset Kasir (Sesi Ini)" v={rp(omset)} />
        <Stat l="Total Transaksi Lunas" v={history.length} />
        <Stat l="Item Terjual" v={`${units} Unit`} />
      </div>
      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex gap-3 justify-between">
        <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 w-full max-w-sm">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari No. Transaksi, Pelanggan, atau Sales..." className="w-full bg-transparent outline-none" />
        </div>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg font-semibold text-xs">
          <span className="material-symbols-outlined text-[18px]">download</span>Ekspor CSV
        </button>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant text-xs">
            <tr>{['No Transaksi', 'Sales', 'Pelanggan', 'Rincian Barang', 'Total Bayar', 'Metode', 'Status', 'Aksi'].map((h) => <th key={h} className="p-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="8" className="p-10 text-center text-on-surface-variant">Belum ada transaksi. Selesaikan pembayaran dari antrean untuk melihatnya di sini.</td></tr>}
            {rows.map((h) => (
              <tr key={h.trx} className="hover:bg-surface-container-low/60 align-top">
                <td className="p-3"><div className="font-mono font-bold text-primary">#{h.trx}</div><div className="text-xs text-on-surface-variant">{h.time.toLocaleTimeString('id-ID')}</div></td>
                <td className="p-3 font-semibold">{h.order.sales}</td>
                <td className="p-3"><div className="font-semibold">{h.order.customer}</div><div className="font-mono text-xs text-on-surface-variant">{h.order.phone}</div></td>
                <td className="p-3 text-xs">{h.order.items.map((i) => <div key={i.sku}>{i.qty}x {i.name}</div>)}</td>
                <td className="p-3 text-right font-bold whitespace-nowrap">{rp(h.total)}<div className="text-xs font-normal text-on-surface-variant">{h.units} Unit</div></td>
                <td className="p-3 text-xs">{METHODS.find((m) => m.id === h.method)?.label}</td>
                <td className="p-3"><span className="px-3 py-1 rounded-full bg-primary-container/20 text-on-primary-container text-xs font-bold">LUNAS</span></td>
                <td className="p-3"><button onClick={() => setOpen(h)} className="px-3 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold">Struk</button></td>
              </tr>
            ))}
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
