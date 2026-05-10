import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get overview analytics (for creators)
router.get('/overview', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can view analytics' })
    }

    const analytics = await db.getAnalytics(req.user.id)
    res.json(analytics)
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Failed to get analytics' })
  }
})

// Get subscriber analytics
router.get('/subscribers', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can view subscriber analytics' })
    }

    const subscriptions = await db.getUserSubscriptions(req.user.id)

    res.json({
      totalSubscribers: subscriptions.length,
      subscribers: subscriptions.map(s => ({
        id: s.id,
        userId: s.fanId,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
        status: s.status
      }))
    })
  } catch (error) {
    console.error('Get subscribers error:', error)
    res.status(500).json({ message: 'Failed to get subscriber analytics' })
  }
})

// Get revenue breakdown
router.get('/revenue', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can view revenue' })
    }

    const revenue = await db.getRevenueBreakdown(req.user.id)
    res.json(revenue)
  } catch (error) {
    console.error('Get revenue error:', error)
    res.status(500).json({ message: 'Failed to get revenue' })
  }
})

export default router
