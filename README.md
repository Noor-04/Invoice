# Invoice Generator

A simple, clean invoice generator for freelancers. Fill out the form, see a live preview, download as a print-ready A4 PDF. No accounts, no database — your data stays in your browser.

## Stack

- React 18 + Vite
- Tailwind CSS
- jsPDF + jspdf-autotable

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Features

- Freelancer / client / invoice metadata
- Add, edit, remove line items
- Auto-calculated subtotal, tax, total
- Currency selector (USD, EUR, GBP, CAD, AUD, INR, JPY)
- Live preview (mirrors PDF layout)
- One-click PDF download (A4)
- Notes section
- Fully responsive (mobile / desktop)
