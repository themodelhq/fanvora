import express from 'express'
import { db } from '../db/database.js'
import { authenticate, generateToken } from '../middleware/auth.js'

const router = express.Router()

// Register — public signup. Admin role is never accepted here; admins are
// provisioned out-of-band only.
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName, role, referralCode } = req.body

    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via signup' })
    }

    const existingEmail = await db.findUserByEmail(email)
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' })

    const existingUsername = await db.findUserByUsername(username)
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' })

    const user = await db.createUser({
      email, password, username, displayName, role,
      referralCode: referralCode ? String(referralCode).trim() : null
    })
    const token = generateToken(user.id)
    delete user.passwordHash

    res.status(201).json({ user, token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Public profile of the Fanvora Support account so the messaging UI can
// render a "Message Fanvora Support" entry point without coupling the
// frontend to the seeded system-user UUID.
router.get('/support-info', async (req, res) => {
  try {
    const support = await db.getSupportUser()
    if (!support) return res.status(404).json({ message: 'Support account not configured' })
    res.json({
      id: support.id,
      username: support.username,
      displayName: support.displayName,
      avatar: support.avatar,
      bio: support.bio
    })
  } catch (error) {
    console.error('Support info error:', error)
    res.status(500).json({ message: 'Failed to load support info' })
  }
})

// Resolve a referral code → ambassador's display info. Used by the public
// Register page to show "Referred by @username" before the user submits.
router.get('/referral/:code', async (req, res) => {
  try {
    const ambassador = await db.findUserByReferralCode(req.params.code)
    if (!ambassador || !ambassador.isAmbassador) {
      return res.status(404).json({ message: 'Invalid referral code' })
    }
    res.json({
      ambassador: {
        username: ambassador.username,
        displayName: ambassador.displayName,
        avatar: ambassador.avatar
      }
    })
  } catch (error) {
    console.error('Referral resolve error:', error)
    res.status(500).json({ message: 'Could not resolve referral' })
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

// Per-user referral summary for the ambassador dashboard tab. Returns 403 if
// the caller isn't an ambassador (or had the role revoked).
router.get('/my-referrals', authenticate, async (req, res) => {
  try {
    const summary = await db.getMyReferralSummary(req.user.id)
    if (!summary || !summary.isAmbassador) {
      return res.status(403).json({
        message: 'Your account is not an ambassador',
        isAmbassador: false
      })
    }
    res.json(summary)
  } catch (error) {
    console.error('My referrals error:', error)
    res.status(500).json({ message: 'Failed to load referral summary' })
  }
})

// GDPR right of access / portability — return every piece of personal data
// we hold about the user as a downloadable JSON document.
router.get('/export', authenticate, async (req, res) => {
  try {
    const data = await db.exportUserData(req.user.id)
    if (!data) return res.status(404).json({ message: 'User not found' })

    const filename = `fanvora-data-${req.user.username}-${new Date().toISOString().slice(0, 10)}.json`
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ message: 'Failed to export data' })
  }
})

// GDPR right to erasure — irreversibly anonymise the user. Requires the user's
// password to defeat session-hijacking and accidental deletion. Financial
// records are retained per ToS / Nigerian tax law but no longer linked to PII.
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password, confirm } = req.body || {}

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete your account' })
    }
    if (confirm !== 'DELETE') {
      return res.status(400).json({
        message: 'Type DELETE in the confirmation field to proceed'
      })
    }

    // Re-fetch the full user record because authenticate middleware strips
    // passwordHash off req.user.
    const user = await db.findUserByEmail(req.user.email)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isValid = await db.validatePassword(user, password)
    if (!isValid) return res.status(401).json({ message: 'Incorrect password' })

    const ok = await db.deleteUserAccount(req.user.id)
    if (!ok) return res.status(500).json({ message: 'Failed to delete account' })

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ message: 'Failed to delete account' })
  }
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
