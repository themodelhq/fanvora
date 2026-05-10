import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get user's subscriptions
router.get('/my', authenticate, async (req, res) => {
  try {
    const subscriptions = await db.getUserSubscriptions(req.user.id)
    res.json({ subscriptions })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    res.status(500).json({ message: 'Failed to get subscriptions' })
  }
})

// Create subscription
router.post('/', authenticate, async (req, res) => {
  try {
    const { creatorId } = req.body

    if (!creatorId) {
      return res.status(400).json({ message: 'Creator ID required' })
    }

    // Check if already subscribed
    const isSubscribed = await db.isSubscribed(req.user.id, creatorId)
    if (isSubscribed) {
      return res.status(400).json({ message: 'Already subscribed to this creator' })
    }

    const subscription = await db.createSubscription(req.user.id, creatorId)
    res.status(201).json({ subscription, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({ message: 'Failed to create subscription' })
  }
})

// Cancel subscription
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // In a real app, you would cancel the subscription
    res.json({ message: 'Subscription cancelled' })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({ message: 'Failed to cancel subscription' })
  }
})

// Renew subscription
router.put('/:id/renew', authenticate, async (req, res) => {
  try {
    // In a real app, you would renew the subscription
    res.json({ message: 'Subscription renewed' })
  } catch (error) {
    console.error('Renew subscription error:', error)
    res.status(500).json({ message: 'Failed to renew subscription' })
  }
})

export default router
