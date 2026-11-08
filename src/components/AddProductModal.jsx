import { useMemo, useState } from 'react'
import { catalog } from '../catalog.js'
import { rp } from '../lib.js'
import QtyInput from './QtyInput.jsx'

export default function AddProductModal({ items, onAdd, onSetQty, onRemove, minItems = 0, onClose }) {
    const [q, setQ] = useState('')

    const list = useMemo(() => {
        const t = q.toLowerCase()
        return catalog.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(t))
    }, [q])
    const qtyOf = (sku) => items.find((i) => i.sku === sku)?.qty || 0

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[92dvh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/20">
                    <div>
                        <span className="text-base font-bold text-on-surface">Tambah Koleksi Furniture</span>
                        <span className="text-xs text-on-surface-variant block">Pilih produk showroom untuk ditambahkan</span>
                    </div>
                    <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                <div className="px-5 pt-3.5 pb-2">
                    <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-outline-variant/20 focus-within:border-accent/60 transition-all">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
                        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama koleksi atau SKU..."
                            className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant/60" />
                    </div>
                </div>
                <div className="px-5 py-2 overflow-y-auto flex flex-col gap-2.5">
                    {list.length === 0 && <p className="text-center text-on-surface-variant py-8 text-sm">Produk tidak ditemukan.</p>}
                    {list.map((p) => {
                        const n = qtyOf(p.sku)
                        return (
                            <div key={p.sku} className={`flex items-center justify-between gap-3 p-3.5 bg-surface-container-low/70 rounded-xl border transition-all ${n > 0 ? 'border-accent/50 ring-1 ring-accent/30' : 'border-outline-variant/15'}`}>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm truncate text-on-surface">{p.name}</div>
                                    <div className="text-[11px] text-on-surface-variant">SKU: {p.sku} · {rp(p.price)}</div>
                                </div>
                                <div className="shrink-0">
                                    {n > 0 ? (
                                        <QtyInput value={n} onChange={(v) => onSetQty(p.sku, v)}
                                            onRemove={items.length > minItems ? () => onRemove(p.sku) : undefined} />
                                    ) : (
                                        <button onClick={() => onAdd(p)} className="px-3.5 py-2 rounded-xl bg-primary hover:bg-secondary text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm transition-all">
                                            <span className="material-symbols-outlined text-[16px]">add</span>Tambah
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low/40 rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold text-sm shadow-sm transition-all">
                        Selesai Menambahkan
                    </button>
                </div>
            </div>
        </div>
    )
}
