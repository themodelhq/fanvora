import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const ALLOWED_TYPES = [
  'content',        // inappropriate / NSFW content
  'conduct',        // harassment / abuse
  'spam',           // spam / scams
  'impersonation',  // identity / brand impersonation
  'copyright',      // IP / DMCA
  'refund',         // payment dispute
  'other'
]

// Public dispute creation. Any authenticated user (fan, creator, ambassador)
// can file a report against another user. The dispute appears in the admin's
// queue and the reporter receives an automatic acknowledgment DM from
// Fanvora Support.
router.post('/', authenticate, async (req, res) => {
  try {
    const { againstUserId, type, summary, transactionRef } = req.body

    if (!againstUserId || !summary) {
      return res.status(400).json({ message: 'againstUserId and summary are required' })
    }
    if (againstUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot report yourself' })
    }
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type must be one of: ${ALLOWED_TYPES.join(', ')}`
      })
    }

    const target = await db.findUserById(againstUserId)
    if (!target) return res.status(404).json({ message: 'User to report was not found' })

    // Cap the summary so a single bad actor can't flood the moderation queue
    // with unbounded text payloads.
    const cleanSummary = String(summary).slice(0, 2000)

    const dispute = await db.createDispute({
      raisedBy: req.user.id,
      againstUserId,
      transactionRef: transactionRef || null,
      type,
      summary: cleanSummary
    })

    res.status(201).json({
      dispute: {
        id: dispute.id,
        status: dispute.status,
        type: dispute.type,
        createdAt: dispute.createdAt
      },
      message: 'Report received. Check your Messages for updates from Fanvora Support.'
    })
  } catch (err) {
    console.error('Create dispute error:', err)
    res.status(500).json({ message: 'Failed to file report' })
  }
})

export default router
