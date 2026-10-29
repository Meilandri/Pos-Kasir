import { useState } from 'react'
import { parseRp } from '../lib.js'

export const DELIVERY = ['Kirim Ekspedisi Toko', 'Kurir Instan', 'Ambil Mandiri di Toko']
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
        if (!f.customer.trim()) return setErr('Nama pembeli wajib diisi.')
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

    const input = 'w-full bg-surface-container-low rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-container'
    const label = 'flex flex-col gap-1 text-xs font-semibold'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">Ubah Data Pembeli &amp; Pengiriman</span>
                    <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="px-5 pb-2 overflow-y-auto flex flex-col gap-3">
                    <label className={label}>Nama pembeli
                        <input className={input} value={f.customer} onChange={set('customer')} />
                    </label>
                    <label className={label}>No. telepon
                        <input className={input} value={f.phone} onChange={set('phone')} inputMode="tel" />
                    </label>
                    <label className={label}>Metode pengiriman
                        <select className={input} value={f.delivery} onChange={set('delivery')}>
                            {DELIVERY.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </label>
                    {!pickup && (
                        <>
                            <label className={label}>Alamat pengiriman
                                <textarea className={input + ' resize-none'} rows={3} value={f.address} onChange={set('address')} />
                            </label>
                            <label className={label}>Biaya pengiriman (Rp)
                                <input className={input} inputMode="numeric" placeholder="0" value={f.shipping}
                                    onChange={(e) => { const n = parseRp(e.target.value); setF({ ...f, shipping: n ? n.toLocaleString('id-ID') : '' }) }} />
                            </label>
                        </>
                    )}
                    {pickup && <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">Ambil mandiri di toko: alamat tidak diperlukan dan biaya pengiriman menjadi Rp 0.</p>}
                    {err && <p className="text-error text-xs font-semibold">{err}</p>}
                </div>
                <div className="p-5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-semibold">Batal</button>
                    <button onClick={save} className="flex-1 py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold">Simpan Perubahan</button>
                </div>
            </div>
        </div>
    )
}