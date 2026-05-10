import express from 'express'
import { db } from '../db/database.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get feed
router.get('/feed', authenticate, async (req, res) => {
  try {
    const posts = await db.getFeed(req.user.id)

    // Add creator info and check purchase status
    const postsWithDetails = await Promise.all(posts.map(async (post) => {
      const creator = await db.findUserById(post.creatorId)
      delete creator?.passwordHash

      const hasPurchased = post.isPpv ? await db.hasPurchasedPost(req.user.id, post.id) : true

      return {
        ...post,
        creator,
        hasPurchased
      }
    }))

    res.json({ posts: postsWithDetails })
  } catch (error) {
    console.error('Get feed error:', error)
    res.status(500).json({ message: 'Failed to get feed' })
  }
})

// Get posts by creator
router.get('/creator/:creatorId', optionalAuth, async (req, res) => {
  try {
    const posts = await db.getPostsByCreator(req.params.creatorId)
    const creator = await db.findUserById(req.params.creatorId)

    // Check if user is subscribed
    let isSubscribed = false
    if (req.user) {
      isSubscribed = await db.isSubscribed(req.user.id, req.params.creatorId)
    }

    const postsWithDetails = posts.map(post => ({
      ...post,
      hasPurchased: !post.isPpv || isSubscribed || post.creatorId === req.user?.id
        ? true
        : (req.user ? db.hasPurchasedPost(req.user.id, post.id) : false)
    }))

    delete creator?.passwordHash

    res.json({
      posts: postsWithDetails,
      creator: creator,
      isSubscribed
    })
  } catch (error) {
    console.error('Get creator posts error:', error)
    res.status(500).json({ message: 'Failed to get posts' })
  }
})

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const creator = await db.findUserById(post.creatorId)
    delete creator?.passwordHash

    // Check access
    let hasAccess = !post.isPpv
    if (req.user) {
      if (post.creatorId === req.user.id) hasAccess = true
      else if (await db.isSubscribed(req.user.id, post.creatorId)) hasAccess = true
      else if (await db.hasPurchasedPost(req.user.id, post.id)) hasAccess = true
    }

    res.json({
      post: {
        ...post,
        creator,
        hasAccess,
        hasPurchased: hasAccess
      }
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ message: 'Failed to get post' })
  }
})

// Create post
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ message: 'Only creators can create posts' })
    }

    const { content, mediaUrls, isPpv, ppvPrice } = req.body

    if (!content) {
      return res.status(400).json({ message: 'Content is required' })
    }

    const post = await db.createPost({
      creatorId: req.user.id,
      content,
      mediaUrls,
      isPpv,
      ppvPrice
    })

    res.status(201).json({ post })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Failed to create post' })
  }
})

// Like/unlike post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const liked = await db.likePost(req.params.id, req.user.id)
    res.json({ liked })
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Failed to like post' })
  }
})

// Purchase post
router.post('/:id/purchase', authenticate, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (!post.isPpv) {
      return res.status(400).json({ message: 'This post is not for sale' })
    }

    // Check if already purchased
    const hasPurchased = await db.hasPurchasedPost(req.user.id, post.id)
    if (hasPurchased) {
      return res.status(400).json({ message: 'You already own this content' })
    }

    // Create purchase record
    const purchase = await db.createPurchase({
      userId: req.user.id,
      postId: post.id,
      type: 'ppv',
      amount: post.ppvPrice,
      paystackRef: `PPV_${Date.now()}`
    })

    res.json({ purchase, message: 'Content unlocked successfully' })
  } catch (error) {
    console.error('Purchase post error:', error)
    res.status(500).json({ message: 'Failed to purchase post' })
  }
})

// Update post
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const { content, mediaUrls, isPpv, ppvPrice, isPinned } = req.body

    // In a real app, you would update the post in the database
    // For this demo, we'll just return success
    res.json({ message: 'Post updated successfully' })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ message: 'Failed to update post' })
  }
})

// Delete post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // In a real app, you would delete the post from the database
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

export default router
