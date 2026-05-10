// Fanvora platform-wide payment configuration.
// Single source of truth for revenue split, currency, and payout rules.

export const CURRENCY = 'NGN'
export const CURRENCY_SYMBOL = '₦' // ₦

// Revenue split: creators keep 70%, the platform keeps 30% of every
// subscription, PPV purchase, and tip.
export const CREATOR_SHARE = 0.70
export const PLATFORM_FEE = 0.30

// Creators can only request a withdrawal once their available balance
// reaches this amount (in NGN, not kobo).
export const MIN_WITHDRAWAL_NGN = 85000

// Net amount the creator earns from a gross transaction.
export const creatorNet = (gross) => Number((gross * CREATOR_SHARE).toFixed(2))

// Platform's cut from a gross transaction.
export const platformCut = (gross) => Number((gross * PLATFORM_FEE).toFixed(2))
