const eurFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatEuro(value: number, showSign = false): string {
  const abs = Math.abs(value)
  const formatted = eurFormatter.format(abs)
  if (!showSign) return formatted
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(ts: number): string {
  return dateFormatter.format(new Date(ts)).replace(', ', ' - ')
}
