import { useMemo, useState } from 'react'
import { catalog } from '../catalog.js'
import { rp } from '../lib.js'
import QtyInput from '../components/QtyInput.jsx'

const ICON = { Meja: 'table_restaurant', Kursi: 'chair_alt', Sofa: 'weekend', Lemari: 'door_sliding', Rak: 'shelves', Aksesori: 'lightbulb' }
const stockOf = (sku) => catalog.find((p) => p.sku === sku)?.stock ?? 9999

// Halaman Buat Antrean Baru: pilih barang dari koleksi QUARZA, lalu lanjut ke pembayaran.
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
        <div className="px-3 sm:px-6 py-5 pb-28 lg:pb-6 max-w-[1720px] mx-auto flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-3 bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-sm border border-outline-variant/30">
                <button onClick={onBack} aria-label="Kembali" className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div>
                    <div className="text-base sm:text-lg font-bold leading-tight">Buat Antrean Baru Showroom</div>
                    <div className="text-xs text-on-surface-variant">Pilih koleksi furniture &amp; living untuk pesanan customer</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
                <div className="flex flex-col gap-4">
                    {/* Filter & Search */}
                    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
                        <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-outline-variant/20 focus-within:border-accent/60 transition-all">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama koleksi atau SKU produk..." className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant/60" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {categories.map((c) => (
                                <button key={c} onClick={() => setCat(c)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${cat === c ? 'bg-primary text-on-primary shadow-sm font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>{c}</button>
                            ))}
                        </div>
                    </div>

                    {list.length === 0 && (
                        <div className="text-center text-on-surface-variant py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                            <span className="material-symbols-outlined text-[44px] text-on-surface-variant/40 mb-2 block">search_off</span>
                            <p className="text-sm font-medium">Koleksi furniture tidak ditemukan.</p>
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {list.map((p) => {
                            const out = p.stock <= 0
                            const n = qtyOf(p.sku)
                            const stockCls = out ? 'text-error' : p.stock <= 5 ? 'text-accent' : 'text-success'
                            return (
                                <div key={p.sku} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col hover:shadow-md transition-all">
                                    <div className="relative aspect-[4/3] bg-surface-container-low flex items-center justify-center">
                                        {p.image
                                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            : <span className="material-symbols-outlined text-[52px] text-on-surface-variant/35">{ICON[p.category] || 'inventory_2'}</span>}
                                        {n > 0 && <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-ink text-on-ink text-[10px] font-bold shadow-sm">{n} di pesanan</span>}
                                        {out && <div className="absolute inset-0 bg-ink/60 flex items-center justify-center backdrop-blur-[1px]"><span className="font-bold text-white text-xs uppercase tracking-wider">Stok Habis</span></div>}
                                    </div>
                                    <div className={`p-3.5 flex flex-col gap-1.5 flex-1 ${out ? 'opacity-60' : ''}`}>
                                        <div className="text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">{p.category} · {p.sku}</div>
                                        <div className="font-bold text-sm leading-snug line-clamp-2 text-on-surface">{p.name}</div>
                                        <div className="text-[11px] text-on-surface-variant">{p.size}</div>
                                        <div className="flex items-end justify-between mt-auto pt-2 gap-2 border-t border-outline-variant/15">
                                            <div>
                                                <div className="font-bold text-sm text-on-surface">{rp(p.price)}</div>
                                                <div className={`text-[10.5px] font-semibold ${stockCls}`}>{out ? 'Habis' : `Stok: ${p.stock}`}</div>
                                            </div>
                                            <button onClick={() => add(p)} disabled={out || n >= p.stock} aria-label={`Tambah ${p.name}`}
                                                className="w-9 h-9 shrink-0 rounded-xl bg-primary hover:bg-secondary text-on-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pesanan Customer Cart Sidebar */}
                <aside className="lg:sticky lg:top-24 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
                    <div className="p-4 sm:p-5 flex items-start justify-between gap-2 border-b border-outline-variant/20">
                        <div>
                            <div className="font-bold text-base leading-tight">Keranjang Pesanan</div>
                            <div className="text-xs text-on-surface-variant">Koleksi terpilih untuk pelanggan</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold whitespace-nowrap">{cart.length} item</span>
                    </div>
                    <div className="max-h-[45vh] overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center text-center gap-2 px-6 py-12">
                                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                                </div>
                                <div className="font-bold text-sm text-on-surface">Belum ada barang</div>
                                <div className="text-xs text-on-surface-variant">Pilih produk furniture di sebelah kiri untuk menambahkannya ke pesanan.</div>
                            </div>
                        ) : cart.map((i) => (
                            <div key={i.sku} className="p-3.5 border-b border-outline-variant/20 last:border-b-0 flex flex-col gap-2">
                                <div className="flex justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs truncate text-on-surface">{i.name}</div>
                                        <div className="text-[11px] text-on-surface-variant">{rp(i.price)} / unit</div>
                                    </div>
                                    <div className="font-bold text-xs shrink-0 text-on-surface">{rp(i.price * i.qty)}</div>
                                </div>
                                <QtyInput value={i.qty} max={stockOf(i.sku)} onChange={(v) => setQty(i.sku, v)} onRemove={() => remove(i.sku)} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-outline-variant/20 p-4 sm:p-5 flex flex-col gap-2.5 text-sm bg-surface-container-low/40 rounded-b-2xl">
                        <div className="flex justify-between text-on-surface-variant text-xs"><span>Jumlah unit</span><span className="font-semibold text-on-surface">{units} unit</span></div>
                        <div className="flex justify-between items-baseline"><span className="font-semibold text-xs text-on-surface">Subtotal</span><span className="text-[20px] font-bold text-on-surface">{rp(subtotal)}</span></div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">PPN dan pengiriman dikonfirmasi di tahap kasir selanjutnya.</p>
                        <button onClick={submit} disabled={cart.length === 0}
                            className="mt-1 w-full py-3.5 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
                            Lanjut ke Pembayaran<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Sticky Bar */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest border-t border-outline-variant/40 shadow-lg p-3 sm:p-4 flex items-center gap-3">
                <div className="mr-auto">
                    <div className="text-[11px] text-on-surface-variant">{units} unit dipilih</div>
                    <div className="font-bold text-base text-on-surface">{rp(subtotal)}</div>
                </div>
                <button onClick={submit} disabled={cart.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                    Lanjut<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}
