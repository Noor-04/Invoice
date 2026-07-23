import { useRef, useState } from 'react'
import LineItems from './LineItems.jsx'
import { readImageDownscaled } from '../utils/image.js'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']

// Last calendar day of the month `offset` months away from the given ISO date.
// Parsed from the string parts to stay timezone-safe. Day 0 of a month rolls
// back to the last day of the previous month, so `m + offset` lands there.
function lastDayOfMonth(iso, offset) {
  const base = /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? iso : new Date().toISOString().slice(0, 10)
  const [y, m] = base.split('-').map(Number)
  const d = new Date(y, m + offset, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function InvoiceForm({ invoice, setInvoice }) {
  const update = (section, key) => (e) => {
    const value = e.target.value
    setInvoice((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
  }

  const shiftMonth = (offset) =>
    setInvoice((prev) => ({
      ...prev,
      meta: { ...prev.meta, date: lastDayOfMonth(prev.meta.date, offset) },
    }))

  const updateNotes = (e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))

  return (
    <div className="space-y-5">
      <Section title="Invoice header">
        <Grid>
          <Field label="Document title" full>
            <input className="field-input" value={invoice.meta.title}
              onChange={update('meta', 'title')} placeholder="Invoice" />
          </Field>
        </Grid>
      </Section>

      <Section title="Your details">
        <Grid>
          <Field label="Name">
            <input className="field-input" value={invoice.freelancer.name}
              onChange={update('freelancer', 'name')} placeholder="Your full name" />
          </Field>
          <Field label="Email">
            <input className="field-input" type="email" value={invoice.freelancer.email}
              onChange={update('freelancer', 'email')} placeholder="you@example.com" />
          </Field>
          <Field label="Phone" full>
            <input className="field-input" value={invoice.freelancer.phone}
              onChange={update('freelancer', 'phone')} placeholder="Phone number" />
          </Field>
          <Field label="Signature" full>
            <SignatureUploader
              value={invoice.freelancer.signature}
              onChange={(dataUrl) => setInvoice((prev) => ({
                ...prev,
                freelancer: { ...prev.freelancer, signature: dataUrl },
              }))}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Bill to">
        <Grid>
          <Field label="Company">
            <input className="field-input" value={invoice.client.company}
              onChange={update('client', 'company')} placeholder="Client company" />
          </Field>
          <Field label="Contact name">
            <input className="field-input" value={invoice.client.name}
              onChange={update('client', 'name')} placeholder="Client name" />
          </Field>
          <Field label="Email">
            <input className="field-input" type="email" value={invoice.client.email}
              onChange={update('client', 'email')} placeholder="client@example.com" />
          </Field>
          <Field label="Address">
            <input className="field-input" value={invoice.client.address}
              onChange={update('client', 'address')} placeholder="Street, City, Country" />
          </Field>
        </Grid>
      </Section>

      <Section title="Invoice details">
        <Grid cols={3}>
          <Field label="Invoice number">
            <input className="field-input" value={invoice.meta.number}
              onChange={update('meta', 'number')} placeholder="1" />
          </Field>
          <Field label="Date">
            <div className="flex items-center gap-1.5">
              <button type="button" title="Previous month (last day)"
                className="btn-ghost !px-2.5 shrink-0"
                onClick={() => shiftMonth(-1)}>
                ‹
              </button>
              <input className="field-input min-w-0 flex-1" type="date"
                value={invoice.meta.date} onChange={update('meta', 'date')} />
              <button type="button" title="Next month (last day)"
                className="btn-ghost !px-2.5 shrink-0"
                onClick={() => shiftMonth(1)}>
                ›
              </button>
            </div>
          </Field>
          <Field label="Due date">
            <input className="field-input" type="date" value={invoice.meta.dueDate}
              onChange={update('meta', 'dueDate')} />
          </Field>
          <Field label="Currency">
            <select className="field-input" value={invoice.meta.currency}
              onChange={update('meta', 'currency')}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Tax rate (%)">
            <input className="field-input" type="number" min="0" step="0.01"
              value={invoice.meta.taxRate} onChange={update('meta', 'taxRate')} />
          </Field>
          <Field label="Received">
            <input className="field-input" type="number" min="0" step="0.01"
              value={invoice.meta.received} onChange={update('meta', 'received')} />
          </Field>
        </Grid>
      </Section>

      <Section title="Items">
        <LineItems invoice={invoice} setInvoice={setInvoice} />
      </Section>

      <Section title="Notes">
        <textarea
          className="field-input min-h-[80px] resize-y"
          value={invoice.notes}
          onChange={updateNotes}
          placeholder="Optional notes (terms, bank details...)"
        />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Grid({ cols = 2, children }) {
  const c = cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return <div className={`grid grid-cols-1 ${c} gap-4`}>{children}</div>
}

function Field({ label, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

function SignatureUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    setError('')
    if (!file) return
    try {
      const { dataUrl } = await readImageDownscaled(file, 400)
      onChange(dataUrl)
    } catch (err) {
      setError(err.message || 'Could not read image')
    }
  }

  const onPick = (e) => handleFile(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  const onPaste = (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))
    if (item) handleFile(item.getAsFile())
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2">
        <img
          src={value}
          alt="Signature"
          className="h-12 max-w-[140px] object-contain bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%),linear-gradient(45deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%)] bg-[length:10px_10px] bg-[position:0_0,5px_5px]"
        />
        <div className="flex flex-col gap-1">
          <button type="button" className="btn-ghost !py-1 text-xs"
            onClick={() => inputRef.current?.click()}>
            Replace
          </button>
          <button type="button"
            className="text-xs text-slate-500 hover:text-red-600 transition"
            onClick={() => onChange('')}>
            Remove
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
    )
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={onPaste}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      className="cursor-pointer rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-center text-xs text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition focus:outline-none focus:ring-1 focus:ring-slate-900"
    >
      <div>Click to upload, drop, or paste an image</div>
      <div className="text-[10px] text-slate-400 mt-0.5">PNG/JPG · transparent background recommended</div>
      {error && <div className="mt-1 text-red-600">{error}</div>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </div>
  )
}
