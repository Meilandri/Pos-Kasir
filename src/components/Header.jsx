export default function Header({ page, setPage, cashier, queueCount, onLogout }) {
  const tab = (id, active) =>
    `relative px-3 py-2 rounded-lg transition-all flex items-center gap-1 font-semibold ${
      active ? 'bg-primary-container text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 px-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">chair</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold">FurniPOS</span>
              <span className="text-[10px] text-on-surface-variant">Kasir Cabang Senayan</span>
            </div>
          </div>
          <nav className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
            <button className={tab('queue', page !== 'history')} onClick={() => setPage('queue')}>
              Antrean Kasir
              {queueCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold">{queueCount}</span>}
            </button>
            <button className={tab('history', page === 'history')} onClick={() => setPage('history')}>Riwayat Transaksi</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold">{cashier.name}</span>
            <span className="text-[10px] text-on-surface-variant">{cashier.code}</span>
          </div>
          <button onClick={onLogout} className="px-3 py-2.5 rounded-lg bg-error-container hover:bg-error hover:text-on-error text-on-error-container text-xs font-semibold flex items-center gap-1.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            <span className="hidden lg:inline">Tutup Kasir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
