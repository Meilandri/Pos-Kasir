import { createPortal } from 'react-dom'
import { rp, METHODS } from '../lib.js'
import { store } from '../storeInfo.js'
import './ReceiptPrint.css'

const Dash = () => <div className="border-t border-dashed border-black/50 my-2" />
const L = ({ l, v, bold }) => (
  <div className={`flex justify-between gap-3 ${bold ? 'font-bold' : ''}`}>
    <span>{l}</span><span className="font-mono whitespace-nowrap">{v}</span>
  </div>
)

// Struk pembayaran. Ditampilkan lewat portal agar saat dicetak hanya struk (80mm) yang keluar.
export default function Receipt({ trx, onClose }) {
  const { order: o } = trx
  const isCash = trx.method === 'cash'
  const methodLabel = METHODS.find((m) => m.id === trx.method)?.label
  const date = trx.time.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  const shipped = o.address && o.address !== '-'

  return createPortal(
    <div className="receipt-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
      <div className="receipt-card w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="no-print px-4 py-3 bg-surface-container-low flex justify-between items-center">
          <span className="text-lg font-semibold">Preview Struk Kasir</span>
          <button onClick={onClose} aria-label="Tutup" className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="receipt-scroll overflow-y-auto p-4 flex justify-center bg-surface-container-low/40">
          <div className="receipt-paper w-full max-w-[380px] bg-white text-black p-5 rounded-lg shadow-md text-[12px] leading-snug flex flex-col">
            {/* Kepala toko */}
            <div className="text-center flex flex-col items-center">
              <img src="/Logo.png" alt="" className="h-12 w-auto object-contain grayscale mb-1" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <div className="text-[16px] font-bold uppercase tracking-wide">{store.name}</div>
              <div className="font-semibold">{store.branch}</div>
              <div className="text-[11px]">{store.address}</div>
              <div className="text-[11px]">Telp: {store.phone} | NPWP: {store.npwp}</div>
            </div>
            <Dash />

            {/* Info transaksi */}
            <div className="text-[11px] flex flex-col gap-0.5">
              <L l="No. Struk" v={trx.trx} />
              <L l="Tanggal" v={date} />
              <L l="Kasir" v={trx.cashier.name} />
              <L l="Sales" v={o.sales} />
              <L l="Pelanggan" v={o.customer} />
              <L l="Telepon" v={o.phone} />
            </div>
            <Dash />

            {/* Barang */}
            {o.items.map((i) => (
              <div key={i.sku} className="mb-1.5">
                <div className="font-semibold">{i.name}</div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span>{i.qty} x {rp(i.price)}</span><span>{rp(i.qty * i.price)}</span>
                </div>
              </div>
            ))}
            <Dash />

            {/* Rincian tagihan */}
            <div className="text-[11px] flex flex-col gap-0.5">
              <L l={`Subtotal (${trx.units} unit)`} v={rp(trx.subtotal)} />
              {o.shipping > 0 && <L l="Ongkos Kirim" v={rp(o.shipping)} />}
              {o.discount > 0 && <L l="Diskon" v={'- ' + rp(o.discount)} />}
              <L l="PPN (11%)" v={rp(trx.ppn)} />
            </div>
            <div className="border-t-2 border-dashed border-black/60 my-2" />
            <div className="flex justify-between items-baseline text-[14px] font-bold">
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
              <div className="font-semibold">Pengiriman: {o.delivery}</div>
              {shipped && <div>{o.address}</div>}
            </div>
            <Dash />

            {/* Penutup */}
            <div className="text-center text-[10px] flex flex-col gap-0.5">
              {store.footer.map((t) => <div key={t}>{t}</div>)}
              <div>WhatsApp CS: {store.whatsapp}</div>
            </div>
          </div>
        </div>

        <div className="no-print p-3 flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold">Tutup</button>
          <button onClick={() => window.print()} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">print</span>Cetak Thermal (80mm)
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}