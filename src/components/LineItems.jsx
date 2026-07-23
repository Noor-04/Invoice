import { formatCurrency } from '../utils/format.js'

export default function LineItems({ invoice, setInvoice }) {
  const { items, meta } = invoice

  const updateItem = (id, key, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    }))
  }

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: '', hsn: '', quantity: 1, price: 0 },
      ],
    }))
  }

  const removeItem = (id) => {
    setInvoice((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }))
  }

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-12 gap-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        <div className="col-span-4">Item name</div>
        <div className="col-span-2">HSN/SAC</div>
        <div className="col-span-1 text-right">Qty</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1" />
      </div>

      {items.map((it) => {
        const total = (Number(it.quantity) || 0) * (Number(it.price) || 0)
        return (
          <div
            key={it.id}
            className="grid grid-cols-12 gap-2 items-start rounded-lg border border-slate-200 p-3 sm:border-0 sm:p-0"
          >
            <div className="col-span-12 sm:col-span-4">
              <label className="field-label sm:hidden">Item name</label>
              <input
                className="field-input"
                value={it.description}
                onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                placeholder="Item / service"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="field-label sm:hidden">HSN/SAC</label>
              <input
                className="field-input"
                value={it.hsn}
                onChange={(e) => updateItem(it.id, 'hsn', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="field-label sm:hidden">Qty</label>
              <input
                className="field-input text-right px-2"
                type="number"
                min="0"
                step="0.01"
                value={it.quantity}
                onChange={(e) => updateItem(it.id, 'quantity', e.target.value)}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <label className="field-label sm:hidden">Price</label>
              <input
                className="field-input text-right"
                type="number"
                min="0"
                step="0.01"
                value={it.price}
                onChange={(e) => updateItem(it.id, 'price', e.target.value)}
              />
            </div>
            <div className="col-span-9 sm:col-span-2 flex items-center justify-end h-10 text-sm font-medium tabular-nums">
              {formatCurrency(total, meta.currency)}
            </div>
            <div className="col-span-3 sm:col-span-1 flex items-center justify-end h-10">
              <button
                onClick={() => removeItem(it.id)}
                className="text-slate-400 hover:text-red-600 transition"
                aria-label="Remove item"
                title="Remove"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        )
      })}

      <button onClick={addItem} className="btn-ghost">
        <PlusIcon /> Add item
      </button>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
