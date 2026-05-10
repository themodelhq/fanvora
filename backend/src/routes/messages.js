import express from 'express'
import { db } from '../db/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get all conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await db.getConversations(req.user.id)
    res.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Failed to get conversations' })
  }
})

// Get messages with a specific user
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const messages = await db.getConversation(req.user.id, req.params.userId)
    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Failed to get messages' })
  }
})

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content required' })
    }

    const receiver = await db.findUserById(receiverId)
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' })
    }

    const message = await db.createMessage(req.user.id, receiverId, content)

    res.status(201).json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Failed to send message' })
  }
})

// Mark message as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    // In a real app, you would mark the message as read
    res.json({ message: 'Message marked as read' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ message: 'Failed to mark message as read' })
  }
})

export default router
