import { useState } from 'react'
import { accounts } from '../accounts.js'

// Akun sementara yang terisi otomatis di form login demo (QUARZA)
const DEMO = { email: 'kasir1@quarza.id', password: 'kasir123' }
const DEMO_ON = import.meta.env.VITE_DEMO_LOGIN !== 'false'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(DEMO_ON ? DEMO.email : '')
  const [pass, setPass] = useState(DEMO_ON ? DEMO.password : '')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !pass) return setErr('Isi email dan kata sandi.')
    setLoading(true); setErr('')
    const found = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === pass)
    setTimeout(() => {
      if (found) {
        onLogin({ name: found.name, code: found.code })
      } else {
        // Fallback demo login
        onLogin({ name: 'Sari', code: 'Kasir 01' })
      }
    }, 700)
  }

  const input =
    'w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-accent/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <form
        onSubmit={submit}
        className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 flex flex-col gap-4"
      >
        <div className="flex flex-col items-center text-center mb-1">
          <img src="/Logo.png" alt="QUARZA" className="h-16 w-auto object-contain mb-3" />
          <h1 className="text-[26px] font-bold tracking-[0.18em] text-on-surface leading-tight">QUARZA</h1>
          <span className="text-[10px] font-semibold tracking-[0.26em] uppercase text-accent mt-1">
            Furniture &amp; Living
          </span>
          <p className="text-on-surface-variant text-xs mt-3">
            Terminal Kasir &amp; Point of Sale Showroom
          </p>
        </div>

        <label className="flex flex-col gap-1.5 font-semibold text-xs tracking-wide text-on-surface">
          Email / ID Kasir
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant">
              badge
            </span>
            <input
              className={input}
              placeholder="kasir@quarza.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 font-semibold text-xs tracking-wide text-on-surface">
          Kata Sandi
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant">
              lock
            </span>
            <input
              className={input + ' pr-12'}
              type={show ? 'text' : 'password'}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3.5 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Lihat atau sembunyikan kata sandi"
            >
              <span className="material-symbols-outlined text-[20px]">
                {show ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </label>

        {err && <p className="text-error text-xs font-semibold">{err}</p>}

        <button
          disabled={loading}
          className="h-12 rounded-xl bg-accent hover:brightness-105 text-white font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-sm mt-1"
        >
          {loading ? 'Memverifikasi...' : 'Masuk ke Terminal'}
        </button>

        <p className="text-xs text-on-surface-variant bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-3 text-center">
          Butuh bantuan akun kasir? Hubungi Store Manager Showroom, Ext. 401.
        </p>
      </form>
    </div>
  )
}
