import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'
import { paystack } from '../services/paystack.js'
import { verifyPaystackSignature } from '../utils/webhook.js'
import {
  CURRENCY,
  CREATOR_SHARE,
  PLATFORM_FEE,
  MIN_WITHDRAWAL_NGN
} from '../config/platform.js'

const router = express.Router()

const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Build the URL PayStack redirects the user to after a successful charge.
const callbackUrl = () => `${FRONTEND_URL.replace(/\/$/, '')}/payment/success`

// Generic guard so PayStack errors surface cleanly to the client instead of
// becoming a 500 with no detail.
function handlePaystackError(res, err, fallbackMsg) {
  console.error('PayStack error:', err.message, err.paystack || '')
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502
  res.status(status).json({
    message: err.message || fallbackMsg,
    paystack: err.paystack || null
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Public config
// ──────────────────────────────────────────────────────────────────────────

router.get('/paystack-key', (req, res) => {
  res.json({ publicKey: PAYSTACK_PUBLIC_KEY })
})

router.get('/config', (req, res) => {
  res.json({
    currency: CURRENCY,
    creatorShare: CREATOR_SHARE,
    platformFee: PLATFORM_FEE,
    minWithdrawal: MIN_WITHDRAWAL_NGN,
    paystackConfigured: paystack.isConfigured(),
    publicKey: PAYSTACK_PUBLIC_KEY
  })
})

// ──────────────────────────────────────────────────────────────────────────
// Inbound payments — Subscription, PPV, Tip
// All three follow the same pattern: initialize a PayStack transaction with
// metadata describing what to fulfill, then return the authorization URL.
// The actual subscription / purchase / tip is created by /verify or /webhook
// (idempotent on the PayStack reference).
// ──────────────────────────────────────────────────────────────────────────

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { creatorId } = req.body
    if (!creatorId) return res.status(400).json({ message: 'creatorId is required' })

    const creator = await db.findUserById(creatorId)
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ message: 'Creator not found' })
    }

    if (await db.isSubscribed(req.user.id, creatorId)) {
      return res.status(400).json({ message: 'Already subscribed' })
    }

    const reference = `sub_${req.user.id}_${creatorId}_${Date.now()}`
    const data = await paystack.initializeTransaction({
      email: req.user.email,
      amountNgn: creator.subscriptionPrice,
      reference,
      callbackUrl: callbackUrl(),
      metadata: {
        type: 'subscription',
        fanId: req.user.id,
        creatorId,
        custom_fields: [
          { display_name: 'Creator', variable_name: 'creator', value: creator.username },
          { display_name: 'Plan', variable_name: 'plan', value: 'Monthly subscription' }
        ]
      }
    })

    res.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
      amount: creator.subscriptionPrice,
      currency: CURRENCY
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to initialize subscription payment')
  }
})

router.post('/ppv', authenticate, async (req, res) => {
  try {
    const { postId } = req.body
    if (!postId) return res.status(400).json({ message: 'postId is required' })

    const post = await db.getPostById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (!post.isPpv) return res.status(400).json({ message: 'This post is not for sale' })

    if (await db.hasPurchasedPost(req.user.id, postId)) {
      return res.status(400).json({ message: 'You already own this content' })
    }

    const reference = `ppv_${req.user.id}_${postId}_${Date.now()}`
    const data = await paystack.initializeTransaction({
      email: req.user.email,
      amountNgn: post.ppvPrice,
      reference,
      callbackUrl: callbackUrl(),
      metadata: {
        type: 'ppv',
        fanId: req.user.id,
        postId
      }
    })

    res.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
      amount: post.ppvPrice,
      currency: CURRENCY
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to initialize PPV payment')
  }
})

router.post('/tip', authenticate, async (req, res) => {
  try {
    const { creatorId, amount, message } = req.body
    const amountNgn = Number(amount)

    if (!creatorId || !amountNgn || amountNgn <= 0) {
      return res.status(400).json({ message: 'creatorId and a positive amount are required' })
    }

    const creator = await db.findUserById(creatorId)
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ message: 'Creator not found' })
    }

    const reference = `tip_${req.user.id}_${creatorId}_${Date.now()}`
    const data = await paystack.initializeTransaction({
      email: req.user.email,
      amountNgn,
      reference,
      callbackUrl: callbackUrl(),
      metadata: {
        type: 'tip',
        fanId: req.user.id,
        creatorId,
        tipMessage: (message || '').toString().slice(0, 500)
      }
    })

    res.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
      amount: amountNgn,
      currency: CURRENCY
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to initialize tip payment')
  }
})

// ──────────────────────────────────────────────────────────────────────────
// Fulfillment — shared between /verify (frontend redirect) and /webhook
// (server-to-server). Idempotent on the PayStack reference.
// ──────────────────────────────────────────────────────────────────────────

async function fulfillTransaction(paystackData) {
  const reference = paystackData.reference
  const amountNgn = Number(paystackData.amount) / 100 // kobo → naira
  const metadata = paystackData.metadata || {}
  const type = metadata.type

  if (!type) {
    throw new Error(`Missing transaction type in metadata for reference ${reference}`)
  }

  if (type === 'subscription') {
    const existing = await db.findSubscriptionByRef(reference)
    if (existing) return { type, alreadyFulfilled: true, subscription: existing }

    const subscription = await db.createSubscription(metadata.fanId, metadata.creatorId, reference)
    await db.createPurchase({
      userId: metadata.fanId,
      postId: null,
      type: 'subscription',
      amount: amountNgn,
      paystackRef: reference
    })
    return { type, alreadyFulfilled: false, subscription }
  }

  if (type === 'ppv') {
    const existing = await db.findPurchaseByRef(reference)
    if (existing) return { type, alreadyFulfilled: true, purchase: existing }

    const purchase = await db.createPurchase({
      userId: metadata.fanId,
      postId: metadata.postId,
      type: 'ppv',
      amount: amountNgn,
      paystackRef: reference
    })
    return { type, alreadyFulfilled: false, purchase }
  }

  if (type === 'tip') {
    const existing = await db.findTipByRef(reference)
    if (existing) return { type, alreadyFulfilled: true, tip: existing }

    const tip = await db.createTip({
      fromUserId: metadata.fanId,
      toUserId: metadata.creatorId,
      amount: amountNgn,
      message: metadata.tipMessage || '',
      paystackRef: reference
    })
    return { type, alreadyFulfilled: false, tip }
  }

  throw new Error(`Unknown transaction type: ${type}`)
}

// Frontend calls this after PayStack redirects the user back to /payment/success
// with ?reference=… in the URL. Verifies with PayStack and fulfills.
router.post('/verify', authenticate, async (req, res) => {
  try {
    const reference = req.body.reference || req.query.reference
    if (!reference) return res.status(400).json({ message: 'reference is required' })

    const data = await paystack.verifyTransaction(reference)
    if (data.status !== 'success') {
      return res.status(400).json({
        verified: false,
        status: data.status,
        message: `Payment status: ${data.status}`
      })
    }

    const result = await fulfillTransaction(data)
    res.json({
      verified: true,
      currency: CURRENCY,
      reference,
      amount: data.amount / 100,
      ...result
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to verify payment')
  }
})

// PayStack server-to-server webhook. Configure in dashboard:
//   https://your-backend.example.com/api/payments/webhook
// PayStack signs the raw body with HMAC-SHA512(secret).
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    const rawBody = req.rawBody || ''

    if (!verifyPaystackSignature(rawBody, signature)) {
      return res.status(401).send('invalid signature')
    }

    const event = req.body
    if (event?.event === 'charge.success' && event.data) {
      try {
        await fulfillTransaction(event.data)
      } catch (err) {
        // Log but ack the webhook — PayStack retries on non-2xx and we don't
        // want infinite retries for a malformed/unknown transaction.
        console.error('Webhook fulfillment error:', err.message)
      }
    }

    // Always 200 once the signature is valid, so PayStack stops retrying.
    res.sendStatus(200)
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.sendStatus(200)
  }
})

// ──────────────────────────────────────────────────────────────────────────
// Outbound payments — Withdrawals (creator payouts)
// Flow: list banks → resolve account → create recipient → initiate transfer
// → (optional) finalize_transfer with OTP for first-time PayStack accounts.
// ──────────────────────────────────────────────────────────────────────────

router.get('/banks', authenticate, async (req, res) => {
  try {
    const banks = await paystack.listBanks()
    res.json({
      banks: banks.map(b => ({ name: b.name, code: b.code, slug: b.slug }))
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to fetch banks')
  }
})

router.post('/resolve-account', authenticate, async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ message: 'accountNumber and bankCode are required' })
    }
    const data = await paystack.resolveAccount(accountNumber, bankCode)
    res.json({
      accountName: data.account_name,
      accountNumber: data.account_number,
      bankId: data.bank_id
    })
  } catch (err) {
    handlePaystackError(res, err, 'Could not resolve account')
  }
})

router.post('/withdraw', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can withdraw funds' })
    }

    const { amount, bankCode, accountNumber } = req.body
    const amountNgn = Number(amount)

    if (!amountNgn || !bankCode || !accountNumber) {
      return res.status(400).json({
        message: 'amount, bankCode, and accountNumber are required'
      })
    }

    if (amountNgn < MIN_WITHDRAWAL_NGN) {
      return res.status(400).json({
        message: `Minimum withdrawal is ₦${MIN_WITHDRAWAL_NGN.toLocaleString('en-NG')}`,
        minWithdrawal: MIN_WITHDRAWAL_NGN,
        currency: CURRENCY
      })
    }

    const creator = await db.findUserById(req.user.id)
    const available = Number(((creator?.totalEarnings || 0) * 0.8).toFixed(2))
    if (amountNgn > available) {
      return res.status(400).json({
        message: `Insufficient available balance. You can withdraw up to ₦${available.toLocaleString('en-NG')}`,
        available,
        currency: CURRENCY
      })
    }

    // 1. Confirm the bank account is real and capture the official name.
    const resolved = await paystack.resolveAccount(accountNumber, bankCode)

    // 2. Create a transfer recipient.
    const recipient = await paystack.createTransferRecipient({
      name: resolved.account_name,
      accountNumber,
      bankCode
    })

    // 3. Initiate the transfer.
    const reference = `wdl_${req.user.id}_${Date.now()}`
    const transfer = await paystack.initiateTransfer({
      amountNgn,
      recipient: recipient.recipient_code,
      reference,
      reason: `Fanvora payout for @${creator.username}`
    })

    // 4. Reserve the funds against the creator's balance immediately. If the
    // transfer ultimately fails, PayStack fires `transfer.failed` (handle in
    // the webhook) and we'd refund — that path isn't wired in this demo.
    creator.totalEarnings = Math.max(0, creator.totalEarnings - amountNgn)

    res.json({
      message: transfer.status === 'otp'
        ? 'Withdrawal initiated — OTP required to finalize'
        : 'Withdrawal initiated',
      reference,
      transferCode: transfer.transfer_code,
      status: transfer.status, // 'pending' | 'success' | 'otp' | 'failed' | 'reversed'
      requiresOtp: transfer.status === 'otp',
      amount: amountNgn,
      currency: CURRENCY,
      accountName: resolved.account_name
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to process withdrawal')
  }
})

// First-time PayStack accounts must finalize transfers with an OTP that
// PayStack emails to the merchant. Call this with that OTP.
router.post('/withdraw/finalize', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can finalize withdrawals' })
    }

    const { transferCode, otp } = req.body
    if (!transferCode || !otp) {
      return res.status(400).json({ message: 'transferCode and otp are required' })
    }

    const transfer = await paystack.finalizeTransfer({ transferCode, otp })
    res.json({
      message: 'Withdrawal finalized',
      status: transfer.status,
      transferCode: transfer.transfer_code,
      currency: CURRENCY
    })
  } catch (err) {
    handlePaystackError(res, err, 'Failed to finalize withdrawal')
  }
})

export default router
