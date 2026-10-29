import { useState } from 'react'
import { accounts } from '../accounts.js'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim() || !pass) return setErr('Isi email dan kata sandi.')
    setLoading(true); setErr('')
    // TODO: ganti dengan request ke API autentikasi
    setTimeout(() => onLogin({ name: 'Sari', code: 'Kasir 01' }), 800)
  }

  const input = 'w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container'
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-xl p-8 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container mb-3">
            <span className="material-symbols-outlined text-[32px]">point_of_sale</span>
          </div>
          <h1 className="text-[22px] font-bold">Masuk ke Sistem Kasir</h1>
          <p className="text-on-surface-variant">Masukkan email dan kata sandi untuk membuka terminal kasir.</p>
        </div>
        <label className="flex flex-col gap-1.5 font-semibold">Email / ID Kasir
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant">badge</span>
            <input className={input} placeholder="kasir@furnipos.id" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
        </label>
        <label className="flex flex-col gap-1.5 font-semibold">Kata Sandi
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant">lock</span>
            <input className={input + ' pr-12'} type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 text-on-surface-variant" aria-label="Lihat atau sembunyikan kata sandi">
              <span className="material-symbols-outlined text-[20px]">{show ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </label>
        {err && <p className="text-error text-xs font-semibold">{err}</p>}
        <button disabled={loading} className="h-12 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all">
          {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
        </button>
        <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">Butuh bantuan akun? Hubungi Supervisor Toko atau IT Helpdesk, Ext. 401.</p>
      </form>
    </div>
  )
}
