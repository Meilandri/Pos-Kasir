import { useMemo, useState } from 'react'
import { catalog } from '../catalog.js'
import { rp } from '../lib.js'

export default function AddProductModal({ items, onAdd, onClose }) {
    const [q, setQ] = useState('')
    const list = useMemo(() => {
        const t = q.toLowerCase()
        return catalog.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(t))
    }, [q])
    const qtyOf = (sku) => items.find((i) => i.sku === sku)?.qty || 0

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">Tambah Barang</span>
                    <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="px-5 pb-3">
                    <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
                        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau SKU produk"
                            className="w-full bg-transparent outline-none" />
                    </div>
                </div>
                <div className="px-5 overflow-y-auto flex flex-col gap-2">
                    {list.length === 0 && <p className="text-center text-on-surface-variant py-8">Produk tidak ditemukan.</p>}
                    {list.map((p) => {
                        const n = qtyOf(p.sku)
                        return (
                            <div key={p.sku} className="flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-xl">
                                <div className="min-w-0">
                                    <div className="font-bold truncate">{p.name}</div>
                                    <div className="text-[11px] text-on-surface-variant">SKU: {p.sku} · {rp(p.price)}{n > 0 && <span className="text-primary font-bold"> · di pesanan: {n}</span>}</div>
                                </div>
                                <button onClick={() => onAdd(p)} className="shrink-0 px-3 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">add</span>Tambah
                                </button>
                            </div>
                        )
                    })}
                </div>
                <div className="p-5">
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-semibold">Selesai</button>
                </div>
            </div>
        </div>
    )
}