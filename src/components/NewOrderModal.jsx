import { useState } from 'react'
import { calcOrder, parseRp, rp } from '../lib.js'
import { DELIVERY, REQUEST_METHODS, SALES_LIST } from '../constants.js'
import AddProductModal from './AddProductModal.jsx'
import QtyInput from './QtyInput.jsx'

const PICKUP = 'Ambil Mandiri di Toko'

export default function NewOrderModal({ onSave, onClose }) {
    const [f, setF] = useState({
        customer: '', phone: '', sales: SALES_LIST[0], requested: REQUEST_METHODS[0],
        delivery: PICKUP, address: '', shipping: '',
    })
    const [items, setItems] = useState([])
    const [addOpen, setAddOpen] = useState(false)
    const [err, setErr] = useState('')
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
    const pickup = f.delivery === PICKUP

    const addProduct = (p, qty = 1) =>
        setItems((its) => its.some((i) => i.sku === p.sku)
            ? its.map((i) => (i.sku === p.sku ? { ...i, qty: i.qty + qty } : i))
            : [...its, { sku: p.sku, name: p.name, qty, price: p.price }])
    const setQty = (sku, qty) => setItems((its) => its.map((i) => (i.sku === sku ? { ...i, qty } : i)))
    const removeItem = (sku) => setItems((its) => its.filter((i) => i.sku !== sku))

    const shipping = pickup ? 0 : parseRp(f.shipping)
    const draft = { items, shipping, discount: 0 }
    const total = items.length ? calcOrder(draft).total : 0

    const save = () => {
        if (!f.customer.trim()) return setErr('Nama pembeli wajib diisi.')
        if (!f.phone.trim()) return setErr('Nomor telepon wajib diisi.')
        if (!pickup && !f.address.trim()) return setErr('Alamat pengiriman wajib diisi.')
        if (items.length === 0) return setErr('Tambahkan minimal satu barang.')
        onSave({
            customer: f.customer.trim(), phone: f.phone.trim(), sales: f.sales, counter: 'Dibuat di kasir',
            requested: f.requested, delivery: f.delivery, address: pickup ? '-' : f.address.trim(),
            shipping, discount: 0, items,
        })
    }

    const input = 'w-full bg-surface-container-low rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-container'
    const label = 'flex flex-col gap-1 text-xs font-semibold'

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
                <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="px-5 py-4 flex items-center justify-between">
                        <span className="text-lg font-semibold">Buat Antrean Baru</span>
                        <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="px-5 pb-2 overflow-y-auto flex flex-col gap-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <label className={label}>Nama pembeli<input className={input} value={f.customer} onChange={set('customer')} /></label>
                            <label className={label}>No. telepon<input className={input} value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="+62 ..." /></label>
                            <label className={label}>Sales
                                <select className={input} value={f.sales} onChange={set('sales')}>{SALES_LIST.map((s) => <option key={s}>{s}</option>)}</select>
                            </label>
                            <label className={label}>Pengajuan pembayaran
                                <select className={input} value={f.requested} onChange={set('requested')}>{REQUEST_METHODS.map((s) => <option key={s}>{s}</option>)}</select>
                            </label>
                            <label className={label}>Metode pengiriman
                                <select className={input} value={f.delivery} onChange={set('delivery')}>{DELIVERY.map((d) => <option key={d}>{d}</option>)}</select>
                            </label>
                            {!pickup && (
                                <label className={label}>Biaya pengiriman (Rp)
                                    <input className={input} inputMode="numeric" placeholder="0" value={f.shipping}
                                        onChange={(e) => { const n = parseRp(e.target.value); setF({ ...f, shipping: n ? n.toLocaleString('id-ID') : '' }) }} />
                                </label>
                            )}
                        </div>
                        {!pickup && (
                            <label className={label}>Alamat pengiriman
                                <textarea className={input + ' resize-none'} rows={2} value={f.address} onChange={set('address')} />
                            </label>
                        )}

                        <div className="flex items-center justify-between pt-1">
                            <span className="font-semibold">Barang <span className="text-xs text-on-surface-variant">({items.reduce((s, i) => s + i.qty, 0)} unit)</span></span>
                            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-xs font-semibold">
                                <span className="material-symbols-outlined text-[16px]">add</span>Tambah Barang
                            </button>
                        </div>
                        {items.length === 0 && <p className="text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl py-6">Belum ada barang. Klik "Tambah Barang".</p>}
                        {items.map((i) => (
                            <div key={i.sku} className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-bold truncate">{i.name}</div>
                                    <div className="text-[11px] text-on-surface-variant">{rp(i.price)} / unit · <strong className="text-on-surface">{rp(i.price * i.qty)}</strong></div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <QtyInput value={i.qty} onChange={(n) => setQty(i.sku, n)} />
                                    <button onClick={() => removeItem(i.sku)} aria-label="Hapus barang" className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error-container/60"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                </div>
                            </div>
                        ))}
                        {err && <p className="text-error text-xs font-semibold">{err}</p>}
                    </div>
                    <div className="p-5 flex items-center gap-3">
                        <div className="mr-auto">
                            <div className="text-[10px] text-on-surface-variant">Total (termasuk PPN 11%)</div>
                            <div className="text-[20px] font-extrabold">{rp(total)}</div>
                        </div>
                        <button onClick={onClose} className="px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-semibold">Batal</button>
                        <button onClick={save} className="px-5 py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold">Simpan Antrean</button>
                    </div>
                </div>
            </div>
            {addOpen && <AddProductModal items={items} onAdd={addProduct} onSetQty={setQty} onRemove={removeItem} onClose={() => setAddOpen(false)} />}
        </>
    )
}