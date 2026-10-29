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
            <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 pt-5 pb-2">
                    <div className="text-lg font-semibold">Batalkan Pesanan</div>
                    <p className="text-xs text-on-surface-variant mt-1">
                        #{order.id} · {order.customer} · {rp(calcOrder(order).total)}
                    </p>
                </div>
                <div className="px-5 py-2 overflow-y-auto flex flex-col gap-2">
                    <div className="text-xs font-semibold">Pilih alasan pembatalan</div>
                    {CANCEL_REASONS.map((r) => (
                        <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${reason === r ? 'bg-error-container/60' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                            <input type="radio" name="cancel-reason" checked={reason === r} onChange={() => { setReason(r); setErr('') }} className="accent-primary" />
                            <span className="text-sm font-medium">{r}</span>
                        </label>
                    ))}
                    {reason === 'Lainnya' && (
                        <textarea autoFocus rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis alasan pembatalan"
                            className="w-full bg-surface-container-low rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary-container resize-none" />
                    )}
                    {err && <p className="text-error text-xs font-semibold">{err}</p>}
                    <p className="text-[11px] text-on-surface-variant">Pesanan akan dihapus dari antrean dan dicatat di Riwayat Transaksi sebagai dibatalkan.</p>
                </div>
                <div className="p-5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-semibold">Kembali</button>
                    <button onClick={submit} className="flex-1 py-3 rounded-xl bg-error hover:brightness-110 text-on-error font-bold">Batalkan Pesanan</button>
                </div>
            </div>
        </div>
    )
}