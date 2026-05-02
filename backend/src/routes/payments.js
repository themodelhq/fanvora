import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_demo'
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_demo'

// Get PayStack public key
router.get('/paystack-key', (req, res) => {
  res.json({ publicKey: PAYSTACK_PUBLIC_KEY })
})

// Initialize subscription payment
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { creatorId, reference } = req.body

    const creator = await db.findUserById(creatorId)
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' })
    }

    // Check if already subscribed
    const isSubscribed = await db.isSubscribed(req.user.id, creatorId)
    if (isSubscribed) {
      return res.status(400).json({ message: 'Already subscribed' })
    }

    // In production, this would call PayStack API to initialize payment
    // For demo, we'll simulate the payment

    // Create subscription
    const subscription = await db.createSubscription(req.user.id, creatorId)

    // Create purchase record
    await db.createPurchase({
      userId: req.user.id,
      postId: null,
      type: 'subscription',
      amount: creator.subscriptionPrice,
      paystackRef: reference || `SUB_${Date.now()}`
    })

    res.json({
      subscription,
      message: 'Subscription successful',
      // In production, this would include PayStack authorization URL
      authorizationUrl: '/payment/success'
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    res.status(500).json({ message: 'Failed to process subscription' })
  }
})

// Initialize PPV purchase
router.post('/ppv', authenticate, async (req, res) => {
  try {
    const { postId, reference } = req.body

    const post = await db.getPostById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (!post.isPpv) {
      return res.status(400).json({ message: 'This post is not for sale' })
    }

    // Check if already purchased
    const hasPurchased = await db.hasPurchasedPost(req.user.id, postId)
    if (hasPurchased) {
      return res.status(400).json({ message: 'Already purchased' })
    }

    // Create purchase record
    const purchase = await db.createPurchase({
      userId: req.user.id,
      postId,
      type: 'ppv',
      amount: post.ppvPrice,
      paystackRef: reference || `PPV_${Date.now()}`
    })

    res.json({
      purchase,
      message: 'Purchase successful',
      authorizationUrl: '/payment/success'
    })
  } catch (error) {
    console.error('PPV purchase error:', error)
    res.status(500).json({ message: 'Failed to process purchase' })
  }
})

// Send tip
router.post('/tip', authenticate, async (req, res) => {
  try {
    const { creatorId, amount, message } = req.body

    if (!creatorId || !amount) {
      return res.status(400).json({ message: 'Creator ID and amount required' })
    }

    const creator = await db.findUserById(creatorId)
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' })
    }

    const tip = await db.createTip({
      fromUserId: req.user.id,
      toUserId: creatorId,
      amount: parseFloat(amount),
      message,
      paystackRef: `TIP_${Date.now()}`
    })

    res.json({
      tip,
      message: 'Tip sent successfully',
      authorizationUrl: '/payment/success'
    })
  } catch (error) {
    console.error('Tip error:', error)
    res.status(500).json({ message: 'Failed to send tip' })
  }
})

// Verify payment (PayStack webhook would call this)
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { reference } = req.body

    // In production, this would verify with PayStack API
    // For demo, we'll just return success

    res.json({
      verified: true,
      message: 'Payment verified successfully'
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ message: 'Failed to verify payment' })
  }
})

// Request withdrawal (for creators)
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can withdraw funds' })
    }

    const { amount, bankCode, accountNumber } = req.body

    if (!amount || !bankCode || !accountNumber) {
      return res.status(400).json({ message: 'Amount, bank code, and account number required' })
    }

    // In production, this would initiate PayStack transfer

    res.json({
      message: 'Withdrawal request submitted',
      transferReference: `WDL_${Date.now()}`
    })
  } catch (error) {
    console.error('Withdraw error:', error)
    res.status(500).json({ message: 'Failed to process withdrawal' })
  }
})

export default router
