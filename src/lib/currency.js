const SYMBOLS = {
  PHP:'₱', USD:'$', GBP:'£', EUR:'€',
  AUD:'A$', CAD:'C$', SGD:'S$', JPY:'¥',
}
export function formatPrice(amount, currencyCode) {
  const symbol = SYMBOLS[currencyCode] || currencyCode || '₱'
  const num    = parseFloat(amount || 0)
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`
}
