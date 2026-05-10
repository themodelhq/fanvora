import express from 'express'
import { db } from '../db/database.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get all creators
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category } = req.query
    const creators = await db.getCreators({ search, category })

    // Remove sensitive data
    const sanitizedCreators = creators.map(c => {
      delete c.passwordHash
      return c
    })

    res.json({ creators: sanitizedCreators })
  } catch (error) {
    console.error('Get creators error:', error)
    res.status(500).json({ message: 'Failed to get creators' })
  }
})

// Get featured creators
router.get('/featured', async (req, res) => {
  try {
    const creators = await db.getFeaturedCreators()
    const sanitizedCreators = creators.map(c => {
      delete c.passwordHash
      return c
    })
    res.json({ creators: sanitizedCreators })
  } catch (error) {
    console.error('Get featured creators error:', error)
    res.status(500).json({ message: 'Failed to get featured creators' })
  }
})

// Search creators
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    const creators = await db.getCreators({ search: q })
    const sanitizedCreators = creators.map(c => {
      delete c.passwordHash
      return c
    })
    res.json({ creators: sanitizedCreators })
  } catch (error) {
    console.error('Search creators error:', error)
    res.status(500).json({ message: 'Search failed' })
  }
})

// Get creator by username
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const creator = await db.getCreatorByUsername(req.params.username)

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' })
    }

    // Check subscription status if user is logged in
    let isSubscribed = false
    if (req.user) {
      isSubscribed = await db.isSubscribed(req.user.id, creator.id)
    }

    delete creator.passwordHash

    res.json({
      creator: {
        ...creator,
        isSubscribed
      }
    })
  } catch (error) {
    console.error('Get creator error:', error)
    res.status(500).json({ message: 'Failed to get creator' })
  }
})

export default router
