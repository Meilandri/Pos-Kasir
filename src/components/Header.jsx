import ThemeToggle from './ThemeToggle.jsx'

// Header hitam (porsi ~30%); merah hanya sebagai garis bawah tipis dan badge jumlah antrean.
export default function Header({ page, setPage, cashier, queueCount, onLogout }) {
  const tab = (active) =>
    `relative px-3 py-2 rounded-lg transition-all flex items-center gap-1 font-semibold ${active ? 'bg-on-ink text-ink font-bold shadow-sm' : 'text-on-ink/70 hover:bg-white/10 hover:text-on-ink'}`
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink text-on-ink border-b-2 border-accent shadow-md">
      <div className="h-20 px-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="HEXAPos" className="h-10 w-auto object-contain" />
            <span className="text-lg font-bold">HEXAPos</span>
          </div>
          <nav className="flex gap-1 bg-white/10 p-1 rounded-xl">
            <button className={tab(page !== 'history')} onClick={() => setPage('queue')}>
              Antrean Kasir
              {queueCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">{queueCount}</span>}
            </button>
            <button className={tab(page === 'history')} onClick={() => setPage('history')}>Riwayat Transaksi</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold">{cashier.name}</span>
            <span className="text-[10px] text-on-ink/60">{cashier.code}</span>
          </div>
          <button onClick={onLogout} className="px-3 py-2.5 rounded-lg bg-white/10 hover:bg-error hover:text-on-error text-on-ink text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            <span className="hidden lg:inline">Tutup Kasir</span>
          </button>
        </div>
      </div>
    </header>
  )
}