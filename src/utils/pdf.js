import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrencyPdf as fc, formatDate } from './format.js'
import { amountToWords } from './numberToWords.js'

// Palette
const TEXT = [30, 41, 59]
const MUTED = [100, 116, 139]
const LINE = [203, 213, 225]
const FILL = [241, 245, 249]

export function downloadInvoicePdf(invoice, totals) {
  const { freelancer, client, meta, items, notes } = invoice
  const { subtotal, tax, total, received, balance, totalQuantity } = totals
  const currency = meta.currency

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 12
  const innerW = pageW - margin * 2

  doc.setLineWidth(0.2)
  doc.setDrawColor(...LINE)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...TEXT)
  doc.text(meta.title || 'Invoice', pageW / 2, 16, { align: 'center' })

  let y = 22

  // ── Header: freelancer name + phone/email row ─────────────────────────────
  const headerH = 22
  cell(doc, margin, y, innerW, headerH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...TEXT)
  doc.text(freelancer.name || '', margin + 3, y + 9)

  // Sub-row inside header (Phone / Email)
  const subY = y + headerH - 7
  doc.line(margin, subY, margin + innerW, subY)
  const halfW = innerW / 2
  labelValue(doc, margin + 3, subY + 5, 'Phone:', freelancer.phone || '')
  labelValue(doc, margin + halfW + 3, subY + 5, 'Email:', freelancer.email || '')

  y += headerH

  // ── Bill To / Invoice Details headers row ─────────────────────────────────
  const labelH = 6
  cell(doc, margin, y, halfW, labelH, { fill: FILL })
  cell(doc, margin + halfW, y, halfW, labelH, { fill: FILL })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text('Bill To:', margin + 3, y + 4.2)
  doc.text('Invoice Details:', margin + halfW + 3, y + 4.2)
  y += labelH

  // ── Bill To / Invoice Details content row ────────────────────────────────
  const billLines = []
  if (client.company) billLines.push({ text: client.company, bold: true })
  if (client.name) billLines.push({ text: client.name })
  if (client.address) {
    const addr = doc.splitTextToSize(client.address, halfW - 6)
    addr.forEach((l) => billLines.push({ text: l }))
  }
  if (client.email) billLines.push({ text: client.email })

  const detailLines = [
    { label: 'No:', value: meta.number || '' },
    { label: 'Date:', value: formatDate(meta.date) },
  ]
  if (meta.dueDate) detailLines.push({ label: 'Due:', value: formatDate(meta.dueDate) })

  const lineGap = 4.5
  const contentH = Math.max(
    billLines.length * lineGap + 4,
    detailLines.length * lineGap + 4,
    14,
  )
  cell(doc, margin, y, halfW, contentH)
  cell(doc, margin + halfW, y, halfW, contentH)

  // Bill To content
  let by = y + 5
  doc.setFontSize(9)
  billLines.forEach((l) => {
    doc.setFont('helvetica', l.bold ? 'bold' : 'normal')
    doc.setTextColor(...TEXT)
    doc.text(l.text, margin + 3, by)
    by += lineGap
  })

  // Invoice details content
  let dy = y + 5
  detailLines.forEach((l) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(l.label, margin + halfW + 3, dy)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT)
    doc.text(l.value, margin + halfW + 16, dy)
    dy += lineGap
  })

  y += contentH

  // ── Items table ──────────────────────────────────────────────────────────
  const body = items.map((it, i) => {
    const lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0)
    return [
      String(i + 1),
      it.description || '',
      it.hsn || '',
      String(it.quantity ?? ''),
      fc(it.price, currency),
      fc(lineTotal, currency),
    ]
  })

  // Trailing in-table Total row
  body.push([
    '',
    { content: 'Total', styles: { fontStyle: 'bold' } },
    '',
    { content: String(totalQuantity), styles: { fontStyle: 'bold' } },
    '',
    { content: fc(subtotal, currency), styles: { fontStyle: 'bold' } },
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: innerW,
    head: [['#', 'Item name', 'HSN/SAC', 'Quantity', `Price/Unit (${currency})`, `Amount (${currency})`]],
    body,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.2,
      textColor: TEXT,
      lineColor: LINE,
      lineWidth: 0.15,
      valign: 'middle',
    },
    headStyles: {
      fillColor: FILL,
      textColor: TEXT,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'left' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' },
    },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY

  const ensure = (h) => {
    if (y + h > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  // ── Sub Total / Tax / Total rows (full-width split label:value) ───────────
  ensure(6.5)
  y += rowKV(doc, margin, y, innerW, 'Sub Total', fc(subtotal, currency))
  if (Number(meta.taxRate) > 0) {
    ensure(6.5)
    y += rowKV(doc, margin, y, innerW, `Tax (${meta.taxRate}%)`, fc(tax, currency))
  }
  ensure(6.5)
  y += rowKV(doc, margin, y, innerW, 'Total', fc(total, currency), { bold: true, fill: FILL })

  // ── Amount in words ───────────────────────────────────────────────────────
  const wordsHeaderH = 6
  const words = amountToWords(total, currency)
  const wordsWrapped = doc.splitTextToSize(words, innerW - 6)
  const wordsH = Math.max(wordsWrapped.length * 4.5 + 3, 8)
  ensure(wordsHeaderH + wordsH)
  cell(doc, margin, y, innerW, wordsHeaderH, { fill: FILL })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text('Invoice Amount in Words:', margin + 3, y + 4.2)
  y += wordsHeaderH

  cell(doc, margin, y, innerW, wordsH)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text(wordsWrapped, margin + 3, y + 5)
  y += wordsH

  // ── Received / Balance ────────────────────────────────────────────────────
  ensure(6.5)
  y += rowKV(doc, margin, y, innerW, 'Received', fc(received, currency))
  ensure(6.5)
  y += rowKV(doc, margin, y, innerW, 'Balance', fc(balance, currency))

  // ── Notes (if any) ────────────────────────────────────────────────────────
  if (notes && notes.trim()) {
    const noteLines = doc.splitTextToSize(notes, innerW)
    ensure(8 + noteLines.length * 4.5)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('NOTES', margin, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...TEXT)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4.5
  }

  // ── Signatory box (right side) ────────────────────────────────────────────
  const sigW = 70
  const sigX = margin + innerW - sigW
  const sigHeaderH = 6
  const sigBodyH = 22
  ensure(8 + sigHeaderH + sigBodyH)
  y += 8

  cell(doc, sigX, y, sigW, sigHeaderH, { fill: FILL })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text(`For ${freelancer.name || ''}:`, sigX + 3, y + 4.2)
  y += sigHeaderH

  cell(doc, sigX, y, sigW, sigBodyH)

  const labelY = y + sigBodyH - 4
  if (freelancer.signature) {
    const pad = 3
    const maxW = sigW - pad * 2
    const maxH = sigBodyH - 7 // leave room for the label below
    const fmt = freelancer.signature.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
    const { w: imgW, h: imgH } = fitImage(doc, freelancer.signature, maxW, maxH)
    const imgX = sigX + (sigW - imgW) / 2
    const imgY = labelY - 3 - imgH // bottom-aligned just above the label
    doc.addImage(freelancer.signature, fmt, imgX, imgY, imgW, imgH)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text('Authorized Signatory', sigX + sigW / 2, labelY, { align: 'center' })

  // Save
  const safeNumber = String(meta.number || 'invoice').replace(/[^a-z0-9-_]+/gi, '-')
  doc.save(`${safeNumber}.pdf`)
}

// ── helpers ────────────────────────────────────────────────────────────────

function cell(doc, x, y, w, h, { fill } = {}) {
  if (fill) {
    doc.setFillColor(...fill)
    doc.rect(x, y, w, h, 'FD')
  } else {
    doc.rect(x, y, w, h, 'S')
  }
}

function labelValue(doc, x, y, label, value) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(label, x, y)
  const labelW = doc.getTextWidth(label) + 2
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT)
  doc.text(value, x + labelW, y)
}

function fitImage(doc, dataUrl, maxW, maxH) {
  const props = doc.getImageProperties(dataUrl) // { width, height } in px
  const ratio = props.width / props.height
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  return { w, h }
}

function rowKV(doc, x, y, w, label, value, { bold = false, fill } = {}) {
  const h = 6.5
  const labelW = w * 0.62
  cell(doc, x, y, labelW, h, fill ? { fill } : undefined)
  cell(doc, x + labelW, y, w - labelW, h, fill ? { fill } : undefined)
  doc.setFont('helvetica', bold ? 'bold' : 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT)
  doc.text(label, x + 3, y + 4.4)
  doc.text(':', x + labelW - 5, y + 4.4)
  doc.text(value, x + w - 3, y + 4.4, { align: 'right' })
  return h
}
