import { formatCurrency, formatDate } from '../utils/format.js'
import { amountToWords } from '../utils/numberToWords.js'

export default function InvoicePreview({ invoice, totals }) {
  const { freelancer, client, meta, items, notes } = invoice
  const { subtotal, tax, total, received, balance, totalQuantity } = totals
  const currency = meta.currency

  return (
    <div className="card overflow-hidden">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
        Preview
      </div>

      <div className="bg-white">
        <h2 className="text-center text-xl font-bold py-3">
          {meta.title || 'Invoice'}
        </h2>

        <div className="border border-slate-300 text-sm">
          {/* Header: name + phone/email */}
          <div className="border-b border-slate-300">
            <div className="px-3 py-3">
              <div className="text-2xl font-bold text-slate-900">
                {freelancer.name || 'Your name'}
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-slate-300">
              <KV label="Phone:" value={freelancer.phone} />
              <KV label="Email:" value={freelancer.email} className="border-l border-slate-300" />
            </div>
          </div>

          {/* Bill To / Invoice Details */}
          <div className="grid grid-cols-2 border-b border-slate-300">
            <div className="border-r border-slate-300">
              <div className="bg-slate-100 px-3 py-1.5 font-semibold border-b border-slate-300">
                Bill To:
              </div>
              <div className="px-3 py-2 space-y-0.5">
                <div className="font-semibold">{client.company || '—'}</div>
                {client.name && <div>{client.name}</div>}
                {client.address && (
                  <div className="text-slate-600 whitespace-pre-line">{client.address}</div>
                )}
                {client.email && <div className="text-slate-600">{client.email}</div>}
              </div>
            </div>
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-semibold border-b border-slate-300">
                Invoice Details:
              </div>
              <div className="px-3 py-2 space-y-0.5">
                <div>
                  <span className="text-slate-500">No: </span>
                  <span className="font-semibold">{meta.number || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <span className="font-semibold">{formatDate(meta.date)}</span>
                </div>
                {meta.dueDate && (
                  <div>
                    <span className="text-slate-500">Due: </span>
                    <span className="font-semibold">{formatDate(meta.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left font-semibold">
                <Th className="w-8">#</Th>
                <Th>Item name</Th>
                <Th className="w-20">HSN/SAC</Th>
                <Th className="w-16 text-right">Quantity</Th>
                <Th className="w-28 text-right">Price/Unit ({currency})</Th>
                <Th className="w-28 text-right">Amount ({currency})</Th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-slate-300 py-4 text-center text-slate-400">
                    No items yet.
                  </td>
                </tr>
              ) : (
                items.map((it, i) => {
                  const lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
                  return (
                    <tr key={it.id}>
                      <Td>{i + 1}</Td>
                      <Td className="font-medium">{it.description || '—'}</Td>
                      <Td>{it.hsn}</Td>
                      <Td className="text-right tabular-nums">{it.quantity}</Td>
                      <Td className="text-right tabular-nums">{formatCurrency(it.price, currency)}</Td>
                      <Td className="text-right tabular-nums">{formatCurrency(lineTotal, currency)}</Td>
                    </tr>
                  )
                })
              )}
              <tr className="font-semibold">
                <Td />
                <Td>Total</Td>
                <Td />
                <Td className="text-right tabular-nums">{totalQuantity}</Td>
                <Td />
                <Td className="text-right tabular-nums">{formatCurrency(subtotal, currency)}</Td>
              </tr>
            </tbody>
          </table>

          {/* Sub Total / Tax / Total */}
          <SplitRow label="Sub Total" value={formatCurrency(subtotal, currency)} />
          {Number(meta.taxRate) > 0 && (
            <SplitRow label={`Tax (${meta.taxRate}%)`} value={formatCurrency(tax, currency)} />
          )}
          <SplitRow
            label="Total"
            value={formatCurrency(total, currency)}
            bold
            highlight
          />

          {/* Amount in words */}
          <div className="bg-slate-100 px-3 py-1.5 font-semibold border-y border-slate-300">
            Invoice Amount in Words:
          </div>
          <div className="px-3 py-2 border-b border-slate-300">
            {amountToWords(total, currency)}
          </div>

          {/* Received / Balance */}
          <SplitRow label="Received" value={formatCurrency(received, currency)} />
          <SplitRow label="Balance" value={formatCurrency(balance, currency)} />
        </div>

        {/* Notes */}
        {notes && notes.trim() && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Notes
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{notes}</p>
          </div>
        )}

        {/* Signatory */}
        <div className="mt-6 flex justify-end">
          <div className="w-60 border border-slate-300 text-sm">
            <div className="bg-slate-100 px-3 py-1.5 font-semibold border-b border-slate-300">
              For {freelancer.name || ''}:
            </div>
            <div className="px-3 py-2 flex flex-col items-center justify-end min-h-[80px]">
              {freelancer.signature ? (
                <img
                  src={freelancer.signature}
                  alt="Signature"
                  className="max-h-14 max-w-full object-contain mb-1"
                />
              ) : (
                <div className="flex-1" />
              )}
              <div className="text-slate-700 border-t border-slate-200 pt-1 w-full text-center">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Th({ children, className = '' }) {
  return <th className={`border border-slate-300 px-3 py-1.5 ${className}`}>{children}</th>
}

function Td({ children, className = '' }) {
  return <td className={`border border-slate-300 px-3 py-2 ${className}`}>{children}</td>
}

function KV({ label, value, className = '' }) {
  return (
    <div className={`px-3 py-1.5 ${className}`}>
      <span className="text-slate-500">{label} </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function SplitRow({ label, value, bold, highlight }) {
  const base = 'flex items-center justify-between px-3 py-1.5 border-b border-slate-300 last:border-b-0'
  const cls = `${base} ${highlight ? 'bg-slate-50' : ''} ${bold ? 'font-semibold' : ''}`
  return (
    <div className={cls}>
      <span>{label} <span className="text-slate-400">:</span></span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
