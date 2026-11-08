import { useState } from 'react'
import { parseRp } from '../lib.js'
import { DELIVERY } from '../constants.js'

const PICKUP = 'Ambil Mandiri di Toko'

export default function EditCustomerModal({ order, onSave, onClose }) {
    const [f, setF] = useState({
        customer: order.customer,
        phone: order.phone,
        delivery: order.delivery,
        address: order.address === '-' ? '' : order.address,
        shipping: order.shipping ? order.shipping.toLocaleString('id-ID') : '',
    })
    const [err, setErr] = useState('')
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
    const pickup = f.delivery === PICKUP

    const save = () => {
        if (!f.customer.trim()) return setErr('Nama pelanggan wajib diisi.')
        if (!f.phone.trim()) return setErr('Nomor telepon wajib diisi.')
        if (!pickup && !f.address.trim()) return setErr('Alamat pengiriman wajib diisi.')
        onSave({
            customer: f.customer.trim(),
            phone: f.phone.trim(),
            delivery: f.delivery,
            address: pickup ? '-' : f.address.trim(),
            shipping: pickup ? 0 : parseRp(f.shipping),
        })
    }

    const input = 'w-full bg-surface-container-low rounded-xl px-3.5 py-2.5 outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent text-sm transition-all'
    const label = 'flex flex-col gap-1.5 text-xs font-semibold text-on-surface'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[92dvh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/20">
                    <div>
                        <span className="text-base font-bold text-on-surface">Ubah Data Pelanggan &amp; Pengiriman</span>
                        <span className="text-xs text-on-surface-variant block">Pesanan #{order.id}</span>
                    </div>
                    <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3.5">
                    <label className={label}>Nama Pelanggan
                        <input className={input} value={f.customer} onChange={set('customer')} />
                    </label>
                    <label className={label}>No. Telepon / WhatsApp
                        <input className={input} value={f.phone} onChange={set('phone')} inputMode="tel" />
                    </label>
                    <label className={label}>Metode Pengiriman
                        <select className={input} value={f.delivery} onChange={set('delivery')}>
                            {DELIVERY.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </label>
                    {!pickup && (
                        <>
                            <label className={label}>Alamat Pengiriman
                                <textarea className={input + ' resize-none'} rows={3} value={f.address} onChange={set('address')} />
                            </label>
                            <label className={label}>Biaya Pengiriman (Rp)
                                <input className={input} inputMode="numeric" placeholder="0" value={f.shipping}
                                    onChange={(e) => { const n = parseRp(e.target.value); setF({ ...f, shipping: n ? n.toLocaleString('id-ID') : '' }) }} />
                            </label>
                        </>
                    )}
                    {pickup && <p className="text-xs text-on-surface-variant bg-surface-container-low/70 border border-outline-variant/20 rounded-xl p-3 leading-relaxed">Ambil mandiri di showroom: alamat tidak diperlukan dan biaya pengiriman otomatis Rp 0.</p>}
                    {err && <p className="text-error text-xs font-semibold">{err}</p>}
                </div>
                <div className="p-4 sm:p-5 flex gap-3 border-t border-outline-variant/20 bg-surface-container-low/40 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors">Batal</button>
                    <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold text-sm shadow-sm transition-all">Simpan Perubahan</button>
                </div>
            </div>
        </div>
    )
}
