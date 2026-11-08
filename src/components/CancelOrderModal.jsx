import { useState } from 'react'
import { CANCEL_REASONS } from '../constants.js'
import { calcOrder, rp } from '../lib.js'

export default function CancelOrderModal({ order, onConfirm, onClose }) {
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')
    const [err, setErr] = useState('')

    const submit = () => {
        if (!reason) return setErr('Pilih alasan pembatalan.')
        if (reason === 'Lainnya' && !note.trim()) return setErr('Tulis alasan pembatalan.')
        onConfirm(reason === 'Lainnya' ? `Lainnya: ${note.trim()}` : reason)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[92dvh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 pt-5 pb-3 border-b border-outline-variant/20">
                    <div className="text-lg font-bold text-on-surface">Batalkan Pesanan</div>
                    <p className="text-xs text-on-surface-variant mt-1">
                        #{order.id} · {order.customer || 'Tanpa nama'} · <strong className="text-on-surface">{rp(calcOrder(order).total)}</strong>
                    </p>
                </div>
                <div className="px-5 py-3 overflow-y-auto flex flex-col gap-2.5">
                    <div className="text-xs font-semibold text-on-surface">Pilih alasan pembatalan:</div>
                    {CANCEL_REASONS.map((r) => (
                        <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${reason === r ? 'bg-error-container/60 border-error/40 text-on-error-container' : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/15 text-on-surface'}`}>
                            <input type="radio" name="cancel-reason" checked={reason === r} onChange={() => { setReason(r); setErr('') }} className="accent-accent" />
                            <span className="text-sm font-medium">{r}</span>
                        </label>
                    ))}
                    {reason === 'Lainnya' && (
                        <textarea autoFocus rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis alasan pembatalan pesanan..."
                            className="w-full bg-surface-container-low rounded-xl px-3.5 py-2.5 outline-none border border-outline-variant/20 focus:border-accent focus:ring-1 focus:ring-accent resize-none text-sm transition-all" />
                    )}
                    {err && <p className="text-error text-xs font-semibold">{err}</p>}
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">Pesanan akan dihapus dari antrean kasir aktif dan dicatat di Riwayat Transaksi sebagai dibatalkan.</p>
                </div>
                <div className="p-4 sm:p-5 flex gap-3 border-t border-outline-variant/20 bg-surface-container-low/40 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors">
                        Kembali
                    </button>
                    <button onClick={submit} className="flex-1 py-3 rounded-xl bg-error hover:brightness-110 text-on-error font-bold text-sm shadow-sm transition-all">
                        Batalkan Pesanan
                    </button>
                </div>
            </div>
        </div>
    )
}
