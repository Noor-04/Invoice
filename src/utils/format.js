export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

// PDF-safe formatter. jsPDF's default Helvetica is WinAnsi-encoded —
// $, €, £, ¥ render fine, but the ₹ (U+20B9, added 2010) does not. Replace it
// with the traditional "Rs." notation so Indian invoices print correctly.
export function formatCurrencyPdf(amount, currency = 'USD') {
  const value = Number(amount) || 0
  let formatted
  try {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    formatted = `${currency} ${value.toFixed(2)}`
  }
  return formatted.replace('₹', 'Rs. ')
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
