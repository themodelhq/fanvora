// Thin wrapper around the PayStack REST API.
// Docs: https://paystack.com/docs/api
//
// All amounts on the way IN are NGN (whole naira). PayStack expects kobo, so
// we multiply by 100 here. Amounts coming back from PayStack are in kobo;
// callers should divide by 100 themselves at the point of use.

const BASE_URL = 'https://api.paystack.co'

function secretKey() {
  const k = process.env.PAYSTACK_SECRET_KEY
  if (!k || k === 'sk_test_demo' || !k.startsWith('sk_')) {
    const err = new Error(
      'PAYSTACK_SECRET_KEY is not configured. Set a valid PayStack secret key in your environment (e.g. sk_test_xxx or sk_live_xxx).'
    )
    err.status = 503
    throw err
  }
  return k
}

async function call(method, path, body) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${secretKey()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (err) {
    const wrapped = new Error(`PayStack request failed: ${err.message}`)
    wrapped.cause = err
    throw wrapped
  }

  let payload = {}
  try {
    payload = await res.json()
  } catch {
    // PayStack always returns JSON; if not, fall through with empty payload
  }

  if (!res.ok || payload.status === false) {
    const err = new Error(payload.message || `PayStack ${method} ${path} failed (${res.status})`)
    err.status = res.status
    err.paystack = payload
    throw err
  }

  return payload.data
}

export const paystack = {
  // True if a real PayStack key is configured (test or live).
  isConfigured() {
    const k = process.env.PAYSTACK_SECRET_KEY
    return !!k && k !== 'sk_test_demo' && k.startsWith('sk_')
  },

  // POST /transaction/initialize — returns { authorization_url, access_code, reference }.
  initializeTransaction({ email, amountNgn, reference, metadata, callbackUrl, channels }) {
    return call('POST', '/transaction/initialize', {
      email,
      amount: Math.round(Number(amountNgn) * 100),
      currency: 'NGN',
      reference,
      metadata,
      callback_url: callbackUrl,
      channels // optional: ['card', 'bank', 'ussd', 'mobile_money', 'bank_transfer']
    })
  },

  // GET /transaction/verify/:reference
  verifyTransaction(reference) {
    return call('GET', `/transaction/verify/${encodeURIComponent(reference)}`)
  },

  // GET /bank?country=nigeria
  listBanks() {
    return call('GET', '/bank?country=nigeria&currency=NGN')
  },

  // GET /bank/resolve — confirms account_number + bank_code maps to a real account
  resolveAccount(accountNumber, bankCode) {
    const q = new URLSearchParams({ account_number: accountNumber, bank_code: bankCode })
    return call('GET', `/bank/resolve?${q.toString()}`)
  },

  // POST /transferrecipient — creates a NUBAN recipient for transfers
  createTransferRecipient({ name, accountNumber, bankCode }) {
    return call('POST', '/transferrecipient', {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    })
  },

  // POST /transfer — initiates a payout from your PayStack balance
  initiateTransfer({ amountNgn, recipient, reference, reason }) {
    return call('POST', '/transfer', {
      source: 'balance',
      amount: Math.round(Number(amountNgn) * 100),
      recipient,
      reference,
      reason
    })
  },

  // POST /transfer/finalize_transfer — required for first-time PayStack accounts
  // where transfers must be confirmed with an OTP sent to the merchant.
  finalizeTransfer({ transferCode, otp }) {
    return call('POST', '/transfer/finalize_transfer', {
      transfer_code: transferCode,
      otp
    })
  }
}
