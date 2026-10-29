import { useState } from 'react'
import { calcOrder, METHODS, parseRp, rp } from '../lib.js'

export default function Payment({ order, onBack, onComplete, onDone }) {
  const c = calcOrder(order)
  const [method, setMethod] = useState('cash')
  const [cash, setCash] = useState('')
  const [result, setResult] = useState(null) // { ok: true } atau { ok: false, msg }

  const received = method === 'cash' ? parseRp(cash) : c.total
  const diff = received - c.total
  const canPay = diff >= 0

  const fmtInput = (v) => { const n = parseRp(v); setCash(n ? n.toLocaleString('id-ID') : '') }

  const confirm = () => {
    if (!canPay) {
      return setResult({ ok: false, msg: `Uang diterima kurang ${rp(Math.abs(diff))} dari total tagihan.` })
    }
    setResult({ ok: true })
  }

  const closeResult = () => {
    if (result.ok) {
      onComplete(order, method, received) // pindahkan ke riwayat
      onDone()                            // kembali ke antrean
    } else {
      setResult(null)                     // tetap di halaman pembayaran
    }
  }

  return (
    <div className="px-3 py-4 flex flex-col gap-4 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-sm">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <span className="text-lg font-semibold">Validasi &amp; Pelunasan Kasir</span>
        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">Menunggu Pembayaran</span>
        <span className="ml-auto text-xs text-on-surface-variant">No. Pesanan: <strong className="text-on-surface">#{order.id}</strong> · Sales: <strong className="text-on-surface">{order.sales}</strong></span>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Kiri: data pelanggan & item */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-lg mb-2">Data Pelanggan</div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <div className="font-semibold">{order.customer}</div>
              <div className="text-xs text-on-surface-variant">{order.phone}</div>
              <div className="text-xs mt-2 p-2 bg-white/60 rounded-lg">{order.address}
                <span className="block text-tertiary font-semibold">Metode: {order.delivery}</span></div>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="font-semibold text-lg">Item Pesanan <span className="text-xs text-on-surface-variant">({c.units} unit)</span></div>
            {order.items.map((i) => (
              <div key={i.sku} className="flex justify-between p-3 bg-surface-container-low rounded-xl gap-3">
                <div className="min-w-0">
                  <div className="font-bold truncate">{i.name}</div>
                  <div className="text-[11px] text-on-surface-variant">SKU: {i.sku} · {rp(i.price)} / unit</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold">{rp(i.price * i.qty)}</div>
                  <div className="text-[11px] font-bold text-primary">{i.qty} Unit</div>
                </div>
              </div>
            ))}
            <div className="p-3 flex flex-col gap-2 text-xs text-on-surface-variant">
              <Row l={`Subtotal Produk (${c.units} Unit)`} v={rp(c.subtotal)} />
              <Row l="Biaya Pengiriman" v={rp(order.shipping)} />
              {order.discount > 0 && <Row l="Diskon Khusus Sales" v={'-' + rp(order.discount)} danger />}
              <Row l="PPN 11%" v={rp(c.ppn)} />
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg">
                <span className="text-lg font-semibold text-on-surface">Total Tagihan Final</span>
                <span className="text-[22px] font-bold text-primary">{rp(c.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan: pembayaran */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl p-4 shadow-md">
            <div className="text-sm font-semibold uppercase text-primary-fixed">Total Harus Dibayar</div>
            <div className="text-[36px] font-bold leading-tight">{rp(c.total)}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="font-semibold text-lg">Metode Pembayaran</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {METHODS.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center text-xs font-semibold transition-all ${method === m.id ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-[24px]">{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
            {method === 'cash' ? (
              <div className="flex flex-col gap-3 p-3 bg-surface-container-low rounded-xl">
                <label className="font-semibold text-xs">Nominal Uang Tunai Diterima (IDR)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-on-surface-variant">Rp</span>
                  <input value={cash} onChange={(e) => fmtInput(e.target.value)} placeholder="0" inputMode="numeric"
                    className="w-full bg-white text-[20px] font-bold pl-12 pr-4 py-3 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-primary-container" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[c.total, 700000, 1000000].map((n) => (
                    <button key={n} onClick={() => setCash(n.toLocaleString('id-ID'))} className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-xs font-semibold">{n === c.total ? 'Uang Pas' : rp(n)}</button>
                  ))}
                </div>
                <div className={`p-3 rounded-xl flex justify-between items-center ${canPay ? 'bg-secondary-container/50' : 'bg-error-container/60'}`}>
                  <span className="font-semibold text-xs">{canPay ? 'Uang Kembalian Pelanggan' : 'Pembayaran Kurang'}</span>
                  <span className="text-[26px] font-bold">{canPay ? rp(diff) : rp(Math.abs(diff))}</span>
                </div>
              </div>
            ) : (
              <p className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
                Pembayaran non-tunai dianggap lunas sebesar total tagihan. Hubungkan ke gateway/EDC Anda di <code>Payment.jsx</code>.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onBack} className="sm:w-1/3 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-semibold">Batal / Tahan</button>
              <button onClick={confirm}
                className="sm:w-2/3 py-3.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-lg font-bold shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>Konfirmasi &amp; Selesaikan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.ok ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
              <span className="material-symbols-outlined text-[40px]">{result.ok ? 'check_circle' : 'error'}</span>
            </div>
            <h2 className="text-[22px] font-bold">{result.ok ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'}</h2>
            <p className="text-on-surface-variant">
              {result.ok
                ? <>Pesanan #{order.id} lunas sebesar <strong className="text-on-surface">{rp(c.total)}</strong>.{method === 'cash' && <> Kembalian <strong className="text-on-surface">{rp(diff)}</strong>.</>}</>
                : result.msg}
            </p>
            <button onClick={closeResult} className="w-full mt-2 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

const Row = ({ l, v, danger }) => (
  <div className={`flex justify-between ${danger ? 'text-error' : ''}`}><span>{l}</span><span className="font-medium text-on-surface">{v}</span></div>
)