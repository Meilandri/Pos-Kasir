import { createPortal } from 'react-dom'
import { rp, METHODS } from '../lib.js'
import { store } from '../storeInfo.js'
import './ReceiptPrint.css'

const Dash = () => <div className="border-t border-dashed border-black/40 my-2" />
const L = ({ l, v, bold }) => (
  <div className={`flex justify-between gap-3 ${bold ? 'font-bold' : ''}`}>
    <span>{l}</span><span className="font-mono whitespace-nowrap">{v}</span>
  </div>
)

// Struk pembayaran QUARZA Furniture & Living.
// Ditampilkan lewat portal agar saat dicetak hanya struk (80mm) yang keluar.
export default function Receipt({ trx, onClose }) {
  const { order: o } = trx
  const isCash = trx.method === 'cash'
  const methodLabel = METHODS.find((m) => m.id === trx.method)?.label
  const date = trx.time.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  const shipped = o.address && o.address !== '-'

  return createPortal(
    <div className="receipt-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
      <div className="receipt-card w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92dvh]" onClick={(e) => e.stopPropagation()}>
        <div className="no-print px-5 py-3.5 bg-surface-container-low flex justify-between items-center border-b border-outline-variant/20">
          <div>
            <span className="text-base font-bold tracking-wide">Preview Struk Kasir</span>
            <span className="text-xs text-on-surface-variant block">Format Standar Thermal 80mm</span>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="receipt-scroll overflow-y-auto p-4 sm:p-6 flex justify-center bg-surface-container-low/50">
          <div className="receipt-paper w-full max-w-[380px] bg-white text-[#221c18] p-6 rounded-xl shadow-md text-[12px] leading-snug flex flex-col border border-stone-200">
            {/* Kepala toko */}
            <div className="text-center flex flex-col items-center">
              <img src="/Logo.png" alt="QUARZA" className="h-12 w-auto object-contain mb-1.5" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <div className="text-[17px] font-bold uppercase tracking-[0.22em] text-[#1a120d]">{store.name}</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-stone-600 font-semibold">{store.tagline || 'Furniture & Living'}</div>
              {store.branch && <div className="text-[11px] font-medium text-stone-700 mt-1">{store.branch}</div>}
              <div className="text-[11px] text-stone-600 mt-0.5">{store.address}</div>
              <div className="text-[10.5px] text-stone-500">Telp: {store.phone} | NPWP: {store.npwp}</div>
            </div>
            <Dash />

            {/* Info transaksi */}
            <div className="text-[11px] flex flex-col gap-0.5">
              <L l="No. Struk" v={trx.trx} />
              <L l="Tanggal" v={date} />
              <L l="Kasir" v={trx.cashier.name} />
              <L l="Sales Consultant" v={o.sales} />
              <L l="Pelanggan" v={o.customer} />
              <L l="Telepon" v={o.phone} />
              {o.mergedFrom?.length > 0 && <L l="Gabungan" v={`${o.mergedFrom.length + 1} pesanan`} />}
            </div>
            <Dash />

            {/* Barang */}
            {o.items.map((i) => (
              <div key={i.sku} className="mb-2">
                <div className="font-semibold text-stone-900">{i.name}</div>
                <div className="flex justify-between text-[11px] font-mono text-stone-700">
                  <span>{i.qty} x {rp(i.price)}</span><span>{rp(i.qty * i.price)}</span>
                </div>
              </div>
            ))}
            <Dash />

            {/* Rincian tagihan */}
            <div className="text-[11px] flex flex-col gap-0.5">
              <L l={`Subtotal (${trx.units} unit)`} v={rp(trx.subtotal)} />
              {o.shipping > 0 && <L l="Pengiriman / Cargo" v={rp(o.shipping)} />}
              {o.discount > 0 && <L l="Diskon Khusus" v={'- ' + rp(o.discount)} />}
              <L l="PPN (11%)" v={rp(trx.ppn)} />
            </div>
            <div className="border-t-2 border-dashed border-black/60 my-2" />
            <div className="flex justify-between items-baseline text-[14px] font-bold text-stone-950">
              <span>TOTAL</span><span className="font-mono">{rp(trx.total)}</span>
            </div>
            <div className="text-[11px] flex flex-col gap-0.5 mt-1">
              <L l="Metode Bayar" v={methodLabel} />
              {isCash ? (
                <>
                  <L l="Tunai Diterima" v={rp(trx.received)} />
                  <L l="Kembalian" v={rp(trx.received - trx.total)} bold />
                </>
              ) : (
                <L l="Dibayar" v={rp(trx.total)} bold />
              )}
            </div>

            {/* Pengiriman */}
            <Dash />
            <div className="text-[11px]">
              <div className="font-semibold text-stone-900">Metode Pengiriman: {o.delivery}</div>
              {shipped && <div className="text-stone-700 mt-0.5">{o.address}</div>}
            </div>
            <Dash />

            {/* Penutup */}
            <div className="text-center text-[10px] text-stone-600 flex flex-col gap-0.5 mt-1">
              {store.footer.map((t) => <div key={t}>{t}</div>)}
              <div className="mt-1 font-medium text-stone-800">Customer Care &amp; WhatsApp: {store.whatsapp}</div>
            </div>
          </div>
        </div>

        <div className="no-print p-4 bg-surface-container-low/60 flex justify-between gap-3 border-t border-outline-variant/20">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high font-semibold text-xs transition-colors">
            Tutup
          </button>
          <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">print</span>Cetak Thermal (80mm)
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
