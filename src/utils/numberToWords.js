const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]
  const t = Math.floor(n / 10), o = n % 10
  return o ? `${TENS[t]}-${ONES[o]}` : TENS[t]
}

function threeDigits(n) {
  if (n < 100) return twoDigits(n)
  const h = Math.floor(n / 100), rest = n % 100
  const hundred = `${ONES[h]} Hundred`
  return rest ? `${hundred} ${twoDigits(rest)}` : hundred
}

function indianWords(num) {
  if (num === 0) return 'Zero'
  const parts = []
  const crore = Math.floor(num / 10000000); num %= 10000000
  const lakh = Math.floor(num / 100000); num %= 100000
  const thousand = Math.floor(num / 1000); num %= 1000
  if (crore) parts.push(`${twoDigits(crore)} Crore`)
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`)
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`)
  if (num) parts.push(threeDigits(num))
  return parts.join(' ')
}

function intlWords(num) {
  if (num === 0) return 'Zero'
  const parts = []
  const billion = Math.floor(num / 1_000_000_000); num %= 1_000_000_000
  const million = Math.floor(num / 1_000_000); num %= 1_000_000
  const thousand = Math.floor(num / 1000); num %= 1000
  if (billion) parts.push(`${threeDigits(billion)} Billion`)
  if (million) parts.push(`${threeDigits(million)} Million`)
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`)
  if (num) parts.push(threeDigits(num))
  return parts.join(' ')
}

const NAMES = {
  USD: { major: 'Dollar', minor: 'Cent' },
  EUR: { major: 'Euro', minor: 'Cent' },
  GBP: { major: 'Pound', minor: 'Penny', minorPlural: 'Pence' },
  CAD: { major: 'Canadian Dollar', minor: 'Cent' },
  AUD: { major: 'Australian Dollar', minor: 'Cent' },
  INR: { major: 'Rupee', minor: 'Paisa', minorPlural: 'Paise' },
  JPY: { major: 'Yen', minor: 'Sen' },
}

export function amountToWords(amount, currency = 'USD') {
  const value = Math.abs(Number(amount) || 0)
  const major = Math.floor(value)
  const minor = Math.round((value - major) * 100)
  const n = NAMES[currency] || { major: currency, minor: 'Cent' }
  const majPlural = `${n.major}s`
  const minPlural = n.minorPlural || `${n.minor}s`
  const toWords = currency === 'INR' ? indianWords : intlWords

  const majWords = toWords(major)
  const majLabel = major === 1 ? n.major : majPlural

  if (minor > 0) {
    const minLabel = minor === 1 ? n.minor : minPlural
    return `${majWords} ${majLabel} and ${twoDigits(minor)} ${minLabel} only`
  }
  return `${majWords} ${majLabel} only`
}
