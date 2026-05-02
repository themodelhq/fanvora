import express from 'express'
import { db } from '../db/database.js'
import { authenticate, generateToken } from '../middleware/auth.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName, role } = req.body

    // Validate
    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check existing
    const existingEmail = await db.findUserByEmail(email)
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const existingUsername = await db.findUserByUsername(username)
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    // Create user
    const user = await db.createUser({ email, password, username, displayName, role })
    const token = generateToken(user.id)

    // Remove sensitive data
    delete user.passwordHash

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await db.findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await db.validatePassword(user, password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user.id)
    delete user.passwordHash

    res.json({ user, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body
    const userId = req.user.id

    // Prevent changing certain fields
    delete updates.email
    delete updates.id
    delete updates.role
    delete updates.passwordHash

    const updatedUser = await db.updateUser(userId, updates)
    delete updatedUser.passwordHash

    res.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

export default router
