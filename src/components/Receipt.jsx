import { rp, METHODS } from '../lib.js'

// Pratinjau struk thermal. window.print() mencetak halaman; atur @media print sesuai printer Anda.
export default function Receipt({ trx, onClose }) {
  const { order: o } = trx
  const m = METHODS.find((x) => x.id === trx.method)?.label
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 bg-surface-container-low flex justify-between items-center">
          <span className="text-lg font-semibold">Preview Struk Kasir</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="overflow-y-auto p-4 flex justify-center bg-surface-container-low/40">
          <div className="w-full max-w-[380px] bg-white p-6 rounded-lg shadow-md text-[12px] flex flex-col gap-2">
            <div className="text-center">
              <div className="text-[17px] font-bold tracking-wider">FURNIPOS RETAIL INDONESIA</div>
              <div className="font-semibold text-gray-700">CABANG SENAYAN CITY MALL</div>
            </div>
            <hr className="border-dashed border-gray-300" />
            <div className="font-mono text-[11px] text-gray-600">
              <div>No. Struk : <b className="text-black">{trx.trx}</b></div>
              <div>Tgl : {trx.time.toLocaleString('id-ID')}</div>
              <div>Kasir : {trx.cashier.name} · Sales : {o.sales}</div>
              <div>Pelanggan : {o.customer}</div>
            </div>
            <hr className="border-dashed border-gray-300" />
            {o.items.map((i) => (
              <div key={i.sku}>
                <div className="flex justify-between font-bold"><span>{i.name}</span><span className="font-mono">{rp(i.qty * i.price)}</span></div>
                <div className="text-[11px] text-gray-500 text-right font-mono">{i.qty} x {rp(i.price)}</div>
              </div>
            ))}
            <hr className="border-dashed border-gray-300" />
            <div className="text-[11px] text-gray-600 flex flex-col gap-1">
              <L l="Subtotal Produk" v={rp(trx.subtotal)} />
              <L l="Ongkos Kirim" v={rp(o.shipping)} />
              {o.discount > 0 && <L l="Diskon" v={'- ' + rp(o.discount)} />}
              <L l="PPN (11%)" v={rp(trx.ppn)} />
            </div>
            <hr className="border-dashed border-2 border-gray-400" />
            <div className="flex justify-between items-baseline"><b>TOTAL TAGIHAN</b><b className="text-[18px] text-teal-700 font-mono">{rp(trx.total)}</b></div>
            <L l="Metode Pembayaran" v={m} />
            <L l="Jumlah Uang Diterima" v={rp(trx.received)} />
            <div className="flex justify-between font-bold bg-teal-50 px-2 py-1 rounded"><span>KEMBALIAN</span><span className="font-mono text-teal-800">{rp(trx.received - trx.total)}</span></div>
            <div className="text-center text-[10px] text-gray-500 mt-2">Terima Kasih Telah Berbelanja di FurniPOS<br />Garansi Rangka 2 Tahun · Simpan Struk Ini</div>
          </div>
        </div>
        <div className="p-3 flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold">Tutup</button>
          <button onClick={() => window.print()} className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">print</span>Cetak Thermal (80mm)
          </button>
        </div>
      </div>
    </div>
  )
}
const L = ({ l, v }) => <div className="flex justify-between"><span>{l}</span><span className="font-mono font-medium text-black">{v}</span></div>
