// Penggabungan pesanan pelanggan yang sama (nama + nomor telepon) menjadi satu pesanan/struk.

// Samakan format nomor: "0857-0633-6657", "+62 857 0633 6657", "6285706336657" -> "85706336657"
export const normPhone = (p) => {
    let d = String(p || '').replace(/\D/g, '')
    if (d.startsWith('62')) d = d.slice(2)
    else if (d.startsWith('0')) d = d.slice(1)
    return d
}
export const normName = (n) => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ')

// Pelanggan sama = nama sama (tanpa beda huruf besar/kecil) DAN nomor telepon sama.
export const sameCustomer = (a, b) =>
    !!normPhone(a.phone) && normPhone(a.phone) === normPhone(b.phone) &&
    !!normName(a.customer) && normName(a.customer) === normName(b.customer)

// Gabungkan pesanan `extra` ke pesanan `base` (ID base dipertahankan).
export function mergeInto(base, extra) {
    const items = base.items.map((i) => ({ ...i }))
    for (const e of extra.items) {
        const hit = items.find((i) => i.sku === e.sku)
        if (hit) hit.qty += e.qty   // SKU sama: jumlah dijumlahkan
        else items.push({ ...e })
    }
    const salesList = [...new Set([
        ...(base.salesList || [base.sales]),
        ...(extra.salesList || [extra.sales]),
    ].filter((s) => s && s !== '-'))]
    const shipped = (o) => o.delivery !== 'Ambil Mandiri di Toko' && o.address && o.address !== '-'
    const ship = shipped(base) ? base : shipped(extra) ? extra : base // ambil data pengiriman yang terisi
    return {
        ...base,
        items,
        delivery: ship.delivery,
        address: ship.address,
        shipping: Math.max(base.shipping || 0, extra.shipping || 0),
        discount: (base.discount || 0) + (extra.discount || 0),
        sales: salesList.length ? salesList.join(', ') : '-',
        salesList,
        mergedFrom: [...(base.mergedFrom || []), extra.id, ...(extra.mergedFrom || [])],
    }
}