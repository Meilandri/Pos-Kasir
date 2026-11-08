import ThemeToggle from './ThemeToggle.jsx'

// Header bernuansa Modern Minimalist + Premium (Warm Earthy)
export default function Header({ page, setPage, cashier, queueCount, onLogout }) {
  const tab = (active) =>
    `relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide ${
      active
        ? 'bg-accent text-white font-bold shadow-sm'
        : 'text-on-ink/75 hover:bg-white/10 hover:text-on-ink'
    }`

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink text-on-ink border-b border-accent/40 shadow-sm backdrop-blur-md">
      <div className="h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <img src="/Logo.png" alt="QUARZA" className="h-9 sm:h-11 w-auto object-contain" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-lg font-bold tracking-[0.18em]">QUARZA</span>
              <span className="text-[9.5px] uppercase tracking-[0.24em] text-accent font-semibold mt-1">
                Furniture &amp; Living
              </span>
            </div>
          </div>
          <nav className="flex gap-1 bg-white/10 p-1 rounded-2xl">
            <button className={tab(page !== 'history')} onClick={() => setPage('queue')}>
              <span className="sm:hidden">Antrean</span>
              <span className="hidden sm:inline">Antrean Kasir</span>
              {queueCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-ink text-[10px] font-bold">
                  {queueCount}
                </span>
              )}
            </button>
            <button className={tab(page === 'history')} onClick={() => setPage('history')}>
              <span className="sm:hidden">Riwayat</span>
              <span className="hidden sm:inline">Riwayat Transaksi</span>
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3.5">
          <ThemeToggle />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold">{cashier.name}</span>
            <span className="text-[10px] text-on-ink/65 tracking-wider uppercase font-medium">{cashier.code}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-error hover:text-on-error text-on-ink text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            <span className="hidden lg:inline">Tutup Kasir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
