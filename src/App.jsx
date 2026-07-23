import { useEffect, useMemo, useState } from 'react'
import InvoiceForm from './components/InvoiceForm.jsx'
import InvoicePreview from './components/InvoicePreview.jsx'
import { downloadInvoicePdf } from './utils/pdf.js'

const STORAGE_KEY = 'invoice-generator:v1'

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const initialInvoice = {
  freelancer: {
    name: 'Noor Ul Hasan',
    email: 'noorulhasandyer@gmail.com',
    phone: '6378783006',
    signature: '',
  },
  client: {
    company: 'Sedar Business Intelligence',
    name: 'Anwer Selo',
    address: 'P.O. Box: 6879, Dubai DIFC, Innovation One, Dubai AI Campus, UAE',
    email: 'connect@sedarai.com',
  },
  meta: {
    title: 'Invoice',
    number: '1',
    date: today(),
    dueDate: inDays(14),
    currency: 'INR',
    taxRate: 0,
    received: 0,
  },
  items: [
    { id: crypto.randomUUID(), description: 'Career Sprint', hsn: '', quantity: 1, price: 10000 },
  ],
  notes: '',
}

function loadInvoice() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt or unavailable storage — fall back to defaults
  }
  return initialInvoice
}

export default function App() {
  // Lazily hydrate from the last working session so a page refresh keeps the
  // user's current data instead of resetting to defaults.
  const [invoice, setInvoice] = useState(loadInvoice)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice))
    } catch {
      // storage full or blocked (private mode) — nothing we can do, skip
    }
  }, [invoice])

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
      0,
    )
    const tax = subtotal * ((Number(invoice.meta.taxRate) || 0) / 100)
    const total = subtotal + tax
    const received = Math.min(Math.max(0, Number(invoice.meta.received) || 0), total)
    const balance = total - received
    const totalQuantity = invoice.items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0),
      0,
    )
    return { subtotal, tax, total, received, balance, totalQuantity }
  }, [invoice])

  const handleDownload = () => downloadInvoicePdf(invoice, totals)

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
              IV
            </div>
            <h1 className="text-lg font-semibold">Invoice Generator</h1>
          </div>
          <button onClick={handleDownload} className="btn-primary">
            <DownloadIcon /> Download PDF
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-2">
        <section>
          <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
        </section>
        <section className="lg:sticky lg:top-6 self-start">
          <InvoicePreview invoice={invoice} totals={totals} />
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-400">
        Built with React + Vite + Tailwind. No data leaves your browser.
      </footer>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
