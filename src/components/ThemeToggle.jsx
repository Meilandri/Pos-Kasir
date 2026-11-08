import { useEffect, useState } from 'react'

// Tema disimpan di localStorage; default mengikuti pengaturan sistem.
export default function ThemeToggle() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light')
        } catch {
            // Abaikan kesalahan akses localStorage
        }
    }, [dark])

    return (
        <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            title={dark ? 'Tema terang' : 'Tema gelap'}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-on-ink flex items-center justify-center transition-colors"
        >
            <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>
    )
}
