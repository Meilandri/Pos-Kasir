import { useEffect, useState } from 'react'

// Pengatur jumlah: bisa klik − / + atau langsung ketik angkanya.
// - Mengetik langsung memperbarui total (selama angka >= min).
// - Jika onRemove diberikan: saat jumlah = min, tombol − berubah jadi ikon hapus dan memanggil onRemove.
// - Kolom dikosongkan sementara saat mengetik; saat keluar kolom (blur) kembali ke angka valid.
export default function QtyInput({ value, onChange, onRemove, min = 1, max = 9999 }) {
    const [draft, setDraft] = useState(String(value))
    useEffect(() => { setDraft(String(value)) }, [value])

    const handleChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, String(max).length)
        setDraft(digits)
        const n = parseInt(digits, 10)
        if (n >= min) onChange(Math.min(max, n))
    }

    const handleBlur = () => {
        const n = parseInt(draft, 10)
        const v = Number.isNaN(n) ? min : Math.min(max, Math.max(min, n))
        onChange(v)
        setDraft(String(v))
    }

    const atMin = value <= min
    const removable = atMin && !!onRemove
    const btn = 'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed'
    return (
        <div className="flex items-center bg-surface-container-lowest rounded-lg">
            <button type="button" onClick={() => (removable ? onRemove() : onChange(Math.max(min, value - 1)))}
                disabled={atMin && !onRemove} aria-label={removable ? 'Hapus barang' : 'Kurangi jumlah'}
                className={btn + (removable ? ' text-error' : '')}>
                <span className="material-symbols-outlined text-[18px]">{removable ? 'delete' : 'remove'}</span>
            </button>
            <input
                value={draft}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                inputMode="numeric"
                aria-label="Jumlah barang"
                className="w-12 h-8 text-center font-bold bg-transparent outline-none focus:ring-2 focus:ring-primary-container rounded"
            />
            <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Tambah jumlah" className={btn}>
                <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
        </div>
    )
}