// Fanvora is a Naira-only platform.
// All amounts in the API and UI are NGN, never kobo, never USD.

export const CURRENCY = 'NGN'
export const CREATOR_SHARE = 0.70
export const PLATFORM_FEE = 0.30
export const MIN_WITHDRAWAL_NGN = 85000

const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
})

const ngnFormatterWithDecimals = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

// Format a number as ₦ — e.g. 4500 → "₦4,500", 4500.5 → "₦4,500.50".
export function formatNaira(amount, { decimals = false } = {}) {
  const n = Number(amount) || 0
  return decimals ? ngnFormatterWithDecimals.format(n) : ngnFormatter.format(n)
}
