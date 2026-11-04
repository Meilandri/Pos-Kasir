import { useMemo, useState } from 'react'
import { catalog } from '../catalog.js'
import { rp } from '../lib.js'
import QtyInput from '../components/QtyInput.jsx'

const ICON = { Meja: 'table_restaurant', Kursi: 'chair_alt', Sofa: 'weekend', Lemari: 'door_sliding', Rak: 'shelves', Aksesori: 'lightbulb' }
const stockOf = (sku) => catalog.find((p) => p.sku === sku)?.stock ?? 9999

// Halaman Buat Antrean Baru: pilih barang dari katalog, lalu lanjut ke halaman pembayaran.
export default function NewOrder({ onBack, onCreate }) {
    const [q, setQ] = useState('')
    const [cat, setCat] = useState('Semua')
    const [cart, setCart] = useState([]) // { sku, name, price, qty }

    const categories = ['Semua', ...new Set(catalog.map((p) => p.category))]
    const list = useMemo(() => {
        const t = q.toLowerCase()
        return catalog.filter((p) => (cat === 'Semua' || p.category === cat) && `${p.name} ${p.sku}`.toLowerCase().includes(t))
    }, [q, cat])

    const qtyOf = (sku) => cart.find((i) => i.sku === sku)?.qty || 0
    const add = (p) => setCart((c) => c.some((i) => i.sku === p.sku)
        ? c.map((i) => (i.sku === p.sku ? { ...i, qty: Math.min(p.stock, i.qty + 1) } : i))
        : [...c, { sku: p.sku, name: p.name, price: p.price, qty: 1 }])
    const setQty = (sku, qty) => setCart((c) => c.map((i) => (i.sku === sku ? { ...i, qty } : i)))
    const remove = (sku) => setCart((c) => c.filter((i) => i.sku !== sku))

    const units = cart.reduce((s, i) => s + i.qty, 0)
    const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0)
    const submit = () => { if (cart.length) onCreate(cart) }

    return (
        <div className="px-3 py-4 pb-28 lg:pb-4 max-w-[1720px] mx-auto flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-sm">
                <button onClick={onBack} aria-label="Kembali" className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div>
                    <div className="text-base sm:text-lg font-semibold leading-tight">Buat Antrean Baru</div>
                    <div className="text-xs text-on-surface-variant">Pilih barang untuk pesanan customer</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
                <div className="flex flex-col gap-3">
                    <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col gap-3">
                        <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau SKU produk" className="w-full bg-transparent outline-none" />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto">
                            {categories.map((c) => (
                                <button key={c} onClick={() => setCat(c)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${cat === c ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>{c}</button>
                            ))}
                        </div>
                    </div>

                    {list.length === 0 && <p className="text-center text-on-surface-variant py-12">Produk tidak ditemukan.</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {list.map((p) => {
                            const out = p.stock <= 0
                            const n = qtyOf(p.sku)
                            const stockCls = out ? 'text-error' : p.stock <= 5 ? 'text-tertiary' : 'text-success'
                            return (
                                <div key={p.sku} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
                                    <div className="relative aspect-[4/3] bg-surface-container flex items-center justify-center">
                                        {p.image
                                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            : <span className="material-symbols-outlined text-[56px] text-on-surface-variant/40">{ICON[p.category] || 'inventory_2'}</span>}
                                        {n > 0 && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-ink text-on-ink text-[11px] font-bold">{n} di pesanan</span>}
                                        {out && <div className="absolute inset-0 bg-ink/55 flex items-center justify-center"><span className="font-bold text-white text-sm">Stok habis</span></div>}
                                    </div>
                                    <div className={`p-3 flex flex-col gap-1 flex-1 ${out ? 'opacity-60' : ''}`}>
                                        <div className="text-[10px] text-on-surface-variant">{p.category} · {p.sku}</div>
                                        <div className="font-semibold text-sm leading-tight">{p.name}</div>
                                        <div className="text-[11px] text-on-surface-variant">{p.size}</div>
                                        <div className="flex items-end justify-between mt-auto pt-2 gap-2">
                                            <div>
                                                <div className="font-bold text-sm">{rp(p.price)}</div>
                                                <div className={`text-[11px] font-semibold ${stockCls}`}>{out ? 'Habis' : `Stok ${p.stock}`}</div>
                                            </div>
                                            <button onClick={() => add(p)} disabled={out || n >= p.stock} aria-label={`Tambah ${p.name}`}
                                                className="w-10 h-10 shrink-0 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pesanan customer */}
                <aside className="lg:sticky lg:top-24 bg-surface-container-lowest rounded-xl shadow-sm flex flex-col">
                    <div className="p-4 flex items-start justify-between gap-2">
                        <div>
                            <div className="font-semibold text-lg leading-tight">Pesanan Customer</div>
                            <div className="text-xs text-on-surface-variant">Barang yang sudah dipilih</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-surface-container text-xs font-bold whitespace-nowrap">{cart.length} item</span>
                    </div>
                    <div className="border-t border-outline-variant/40 max-h-[45vh] overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center text-center gap-2 px-6 py-10">
                                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">shopping_bag</span></div>
                                <div className="font-semibold text-sm">Belum ada barang</div>
                                <div className="text-xs text-on-surface-variant">Barang pada daftar produk untuk menambahkannya ke pesanan.</div>
                            </div>
                        ) : cart.map((i) => (
                            <div key={i.sku} className="p-3 border-b border-outline-variant/30 last:border-b-0 flex flex-col gap-2">
                                <div className="flex justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{i.name}</div>
                                        <div className="text-[11px] text-on-surface-variant">{rp(i.price)} / unit</div>
                                    </div>
                                    <div className="font-bold text-sm shrink-0">{rp(i.price * i.qty)}</div>
                                </div>
                                <QtyInput value={i.qty} max={stockOf(i.sku)} onChange={(v) => setQty(i.sku, v)} onRemove={() => remove(i.sku)} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-outline-variant/40 p-4 flex flex-col gap-2 text-sm">
                        <div className="flex justify-between text-on-surface-variant"><span>Jumlah barang</span><span className="font-semibold text-on-surface">{units} item</span></div>
                        <div className="flex justify-between items-baseline"><span className="font-semibold">Total harga</span><span className="text-[20px] font-bold">{rp(subtotal)}</span></div>
                        <p className="text-[11px] text-on-surface-variant">PPN dan ongkir dihitung di halaman pembayaran. Data pembeli dan pengiriman diisi di sana.</p>
                        <button onClick={submit} disabled={cart.length === 0}
                            className="mt-1 w-full py-3 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                            Buat Pesanan<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Bar bawah khusus HP */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest border-t border-outline-variant/50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3 flex items-center gap-3">
                <div className="mr-auto">
                    <div className="text-[11px] text-on-surface-variant">{units} item</div>
                    <div className="font-bold">{rp(subtotal)}</div>
                </div>
                <button onClick={submit} disabled={cart.length === 0}
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    Buat Pesanan<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}