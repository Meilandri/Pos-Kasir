import { useState } from 'react'
import { calcOrder, METHODS, parseRp, rp } from '../lib.js'
import Receipt from '../components/Receipt.jsx'
import AddProductModal from '../components/AddProductModal.jsx'
import CancelOrderModal from '../components/CancelOrderModal.jsx'
import QtyInput from '../components/QtyInput.jsx'
import { sameCustomer } from '../mergeOrders.js'
import { DELIVERY } from '../constants.js'

const PICKUP = 'Ambil Mandiri di Toko'
const DELIVERY_ICON = { 'Ambil Mandiri di Toko': 'storefront', 'Kurir Instan': 'two_wheeler', Cargo: 'local_shipping' }

export default function Payment({ order, orders = [], onBack, onUpdate, onMerge, onCancel, onComplete, onDone }) {
  const c = calcOrder(order)
  const pickup = order.delivery === PICKUP
  const [method, setMethod] = useState('cash')
  const [cash, setCash] = useState('')
  const [result, setResult] = useState(null) // { ok: true } atau { ok: false, msg }
  const [trx, setTrx] = useState(null)        // data transaksi untuk struk
  const [addOpen, setAddOpen] = useState(false)
  const [mergeNote, setMergeNote] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)

  const received = method === 'cash' ? parseRp(cash) : c.total
  const diff = received - c.total
  const canPay = diff >= 0

  const fmtInput = (v) => { const n = parseRp(v); setCash(n ? n.toLocaleString('id-ID') : '') }

  // ---- Ubah detail pesanan (tersimpan langsung ke antrean) ----
  const setItems = (items) => onUpdate({ ...order, items })
  const setQty = (sku, qty) =>
    setItems(order.items.map((i) => (i.sku === sku ? { ...i, qty } : i)))
  const removeItem = (sku) => {
    if (order.items.length > 1) setItems(order.items.filter((i) => i.sku !== sku))
  }
  const addProduct = (p, qty = 1) => {
    const exists = order.items.some((i) => i.sku === p.sku)
    setItems(exists
      ? order.items.map((i) => (i.sku === p.sku ? { ...i, qty: i.qty + qty } : i))
      : [...order.items, { sku: p.sku, name: p.name, qty, price: p.price }])
  }
  // ---- Pengiriman (tersimpan langsung ke pesanan) ----
  const setDelivery = (d) =>
    onUpdate({ ...order, delivery: d, ...(d === PICKUP ? { address: '-', shipping: 0 } : { address: order.address === '-' ? '' : order.address }) })
  const setAddress = (address) => onUpdate({ ...order, address })
  const setShipping = (v) => onUpdate({ ...order, shipping: parseRp(v) })

  // Jika nama + telepon sama dengan pesanan lain di antrean, gabungkan otomatis jadi 1 struk
  const tryMerge = () => {
    const other = orders.find((o) => o.id !== order.id && sameCustomer(o, order))
    if (!other) return
    onMerge(other.id, order.id)
    setMergeNote(`Pelanggan ini sudah punya pesanan #${other.id}. Pesanan digabung menjadi 1 struk (Sales Consultant: ${other.sales}).`)
  }

  const confirm = () => {
    if (!order.customer.trim() || !order.phone.trim()) {
      return setResult({ ok: false, msg: 'Nama pelanggan dan nomor telepon wajib diisi.' })
    }
    if (!pickup && !(order.address || '').trim()) {
      return setResult({ ok: false, msg: 'Alamat pengiriman wajib diisi untuk Kurir Instan / Cargo.' })
    }
    if (!canPay) {
      return setResult({ ok: false, msg: `Nominal diterima kurang ${rp(Math.abs(diff))} dari total tagihan.` })
    }
    setResult({ ok: true })
  }

  const closeResult = () => {
    if (result.ok) {
      const t = onComplete(order, method, received) // catat ke riwayat, dapat data trx
      setTrx(t)                                     // simpan untuk struk
      setResult(null)
    } else {
      setResult(null)                               // tetap di halaman pembayaran
    }
  }

  const editBtn = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-xs font-semibold border border-outline-variant/20 transition-colors'

  return (
    <>
      <div className="px-3 sm:px-6 py-5 flex flex-col gap-4 max-w-[1600px] mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-sm border border-outline-variant/30">
          <button onClick={onBack} aria-label="Kembali" className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold tracking-tight">Validasi &amp; Pelunasan Kasir</span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase tracking-wider">
              Menunggu Pelunasan
            </span>
          </div>
          <span className="ml-auto text-xs text-on-surface-variant flex items-center gap-2">
            <span>No. Pesanan: <strong className="text-on-surface font-mono font-bold">#{order.id}</strong></span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Sales: <strong className="text-on-surface">{order.sales}</strong></span>
          </span>
          <button onClick={() => setCancelOpen(true)} className="px-3 py-2 rounded-xl text-error hover:bg-error-container/60 text-xs font-semibold flex items-center gap-1 transition-all">
            <span className="material-symbols-outlined text-[18px]">cancel</span>Batalkan Pesanan
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 items-start">
          {/* Kiri: Data Pelanggan & Item */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-base tracking-wide">Data Pelanggan &amp; Pengiriman</div>
              </div>
              {mergeNote && <div className="mb-3 p-3 rounded-xl bg-success-container text-on-success-container text-xs font-semibold border border-success/20">{mergeNote}</div>}
              <div className="p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 flex flex-col gap-3">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface">Nama Pelanggan
                    <input value={order.customer} onChange={(e) => onUpdate({ ...order, customer: e.target.value })} placeholder="Nama pelanggan" onBlur={tryMerge}
                      className="w-full bg-surface-container-lowest rounded-xl px-3 py-2 text-sm font-normal outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface">No. Telepon / WhatsApp
                    <input value={order.phone} onChange={(e) => onUpdate({ ...order, phone: e.target.value })} placeholder="+62 ..." inputMode="tel" onBlur={tryMerge}
                      className="w-full bg-surface-container-lowest rounded-xl px-3 py-2 text-sm font-normal outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </label>
                </div>
                <div className="p-2.5 bg-surface-container-lowest/80 rounded-xl flex flex-col gap-2.5 border border-outline-variant/15">
                  <div className="text-xs font-semibold text-on-surface">Pilih Metode Pengiriman</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DELIVERY.map((d) => (
                      <button key={d} onClick={() => setDelivery(d)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-semibold text-center transition-all ${order.delivery === d ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                        <span className="material-symbols-outlined text-[20px]">{DELIVERY_ICON[d]}</span>{d}
                      </button>
                    ))}
                  </div>
                  {!pickup && (
                    <>
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface mt-1">Alamat Pengiriman
                        <textarea rows={2} value={order.address === '-' ? '' : order.address} onChange={(e) => setAddress(e.target.value)}
                          placeholder="Tulis alamat lengkap pengiriman hunian/apartemen"
                          className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-xs font-normal outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all" />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-on-surface">Biaya Pengiriman (Rp)
                        <input value={order.shipping ? order.shipping.toLocaleString('id-ID') : ''} onChange={(e) => setShipping(e.target.value)}
                          inputMode="numeric" placeholder="0"
                          className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-xs font-normal outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-base tracking-wide">Koleksi Furniture <span className="text-xs font-normal text-on-surface-variant">({c.units} unit)</span></div>
                <button onClick={() => setAddOpen(true)} className={editBtn}>
                  <span className="material-symbols-outlined text-[16px] text-accent">add</span>Tambah Produk
                </button>
              </div>
              <div className="space-y-2">
                {order.items.map((i) => (
                  <div key={i.sku} className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/15 flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate text-on-surface">{i.name}</div>
                        <div className="text-[11px] text-on-surface-variant">SKU: {i.sku} · {rp(i.price)} / unit</div>
                      </div>
                      <div className="font-bold text-sm shrink-0 text-on-surface">{rp(i.price * i.qty)}</div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <QtyInput value={i.qty} onChange={(n) => setQty(i.sku, n)} />
                      <button onClick={() => removeItem(i.sku)} disabled={order.items.length <= 1}
                        title={order.items.length <= 1 ? 'Pesanan minimal berisi satu barang' : 'Hapus barang'}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-error hover:bg-error-container/60 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 flex flex-col gap-2 text-xs text-on-surface-variant bg-surface-container-low/40 rounded-xl border border-outline-variant/15">
                <Row l={`Subtotal Produk (${c.units} Unit)`} v={rp(c.subtotal)} />
                <Row l="Biaya Pengiriman / Cargo" v={rp(order.shipping)} />
                {order.discount > 0 && <Row l="Diskon Khusus Sales" v={'- ' + rp(order.discount)} danger />}
                <Row l="PPN (11%)" v={rp(c.ppn)} />
                <div className="flex justify-between items-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 mt-1">
                  <span className="text-sm font-semibold text-on-surface">Total Tagihan Final</span>
                  <span className="text-[20px] font-bold text-on-surface">{rp(c.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Pembayaran */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-ink text-on-ink border-l-4 border-accent rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between">
              <div className="text-xs font-semibold tracking-widest uppercase text-accent">Total Harus Dibayar</div>
              <div className="text-[32px] sm:text-[40px] font-bold leading-tight mt-1">{rp(c.total)}</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="font-bold text-base tracking-wide">Pilih Metode Pembayaran</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {METHODS.map((m) => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl text-center text-xs font-semibold transition-all ${method === m.id ? 'bg-primary text-on-primary ring-2 ring-accent shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                    <span className="material-symbols-outlined text-[24px]">{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              {method === 'cash' ? (
                <div className="flex flex-col gap-3 p-4 bg-surface-container-low/70 rounded-xl border border-outline-variant/20">
                  <label className="font-semibold text-xs text-on-surface">Nominal Uang Tunai Diterima (IDR)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-bold text-on-surface-variant">Rp</span>
                    <input value={cash} onChange={(e) => fmtInput(e.target.value)} placeholder="0" inputMode="numeric"
                      className="w-full bg-surface-container-lowest text-[22px] font-bold pl-12 pr-4 py-3 rounded-xl shadow-inner outline-none border border-outline-variant/30 focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
                  </div>
                  <div className={`p-3.5 rounded-xl flex justify-between items-center transition-colors ${canPay ? 'bg-success-container text-on-success-container border border-success/20' : 'bg-error-container/60 text-on-error-container border border-error/20'}`}>
                    <span className="font-semibold text-xs">{canPay ? 'Uang Kembalian Pelanggan' : 'Kekurangan Pembayaran'}</span>
                    <span className="text-[24px] font-bold">{canPay ? rp(diff) : rp(Math.abs(diff))}</span>
                  </div>
                </div>
              ) : (
                <p className="p-4 bg-surface-container-low/60 rounded-xl text-xs text-on-surface-variant border border-outline-variant/20 leading-relaxed">
                  Pembayaran non-tunai diverifikasi lunas melalui EDC / QRIS terminal showroom sebesar total tagihan.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={onBack} className="sm:w-1/3 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors">
                  Tahan Antrean
                </button>
                <button onClick={confirm}
                  className="sm:w-2/3 py-3.5 rounded-xl bg-primary hover:bg-secondary text-on-primary text-base font-bold shadow-md flex items-center justify-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>Konfirmasi &amp; Selesaikan Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 p-6 flex flex-col items-center text-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.ok ? 'bg-success-container text-success' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined text-[40px]">{result.ok ? 'check_circle' : 'error'}</span>
              </div>
              <h2 className="text-[22px] font-bold text-on-surface">{result.ok ? 'Pembayaran Berhasil' : 'Pembayaran Gagal'}</h2>
              <p className="text-on-surface-variant text-sm">
                {result.ok
                  ? <>Pesanan #{order.id} lunas sebesar <strong className="text-on-surface">{rp(c.total)}</strong>.{method === 'cash' && <> Kembalian <strong className="text-on-surface">{rp(diff)}</strong>.</>}</>
                  : result.msg}
              </p>
              <button onClick={closeResult} className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold flex items-center justify-center gap-2 shadow-sm transition-all">
                <span className="material-symbols-outlined text-[20px]">{result.ok ? 'receipt_long' : 'arrow_back'}</span>
                {result.ok ? 'Cetak Struk Pembayaran' : 'Kembali'}
              </button>
            </div>
          </div>
        )}
      </div>

      {addOpen && <AddProductModal items={order.items} onAdd={addProduct} onSetQty={setQty} onRemove={removeItem} minItems={1} onClose={() => setAddOpen(false)} />}
      {cancelOpen && <CancelOrderModal order={order} onConfirm={(r) => onCancel(order, r)} onClose={() => setCancelOpen(false)} />}
      {trx && <Receipt trx={trx} onClose={onDone} />}
    </>
  )
}

const Row = ({ l, v, danger }) => (
  <div className={`flex justify-between ${danger ? 'text-error' : ''}`}><span>{l}</span><span className="font-medium text-on-surface">{v}</span></div>
)
