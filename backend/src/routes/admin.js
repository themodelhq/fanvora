import express from 'express'
import { db } from '../db/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require an authenticated admin.
router.use(authenticate, requireAdmin)

// ─── Overview ─────────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getPlatformStats()
    res.json(stats)
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ message: 'Failed to load stats' })
  }
})

router.get('/log', async (req, res) => {
  try {
    const log = await db.getAdminLog({ limit: Number(req.query.limit) || 100 })
    res.json({ entries: log })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load log' })
  }
})

// ─── Users ────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers({
      search: req.query.search || '',
      role: req.query.role || '',
      limit: Number(req.query.limit) || 200
    })
    res.json({ users })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ message: 'Failed to load users' })
  }
})

router.post('/users/:id/suspend', async (req, res) => {
  try {
    const target = await db.findUserById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found' })

    // Only owners can suspend admins/owners. Owners cannot be suspended at all.
    if (target.role === 'owner') {
      return res.status(403).json({ message: 'Owners cannot be suspended' })
    }
    if (target.role === 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can suspend an admin' })
    }
    if (target.role === 'system') {
      return res.status(403).json({ message: 'System accounts cannot be suspended' })
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot suspend yourself' })
    }

    const { suspended, reason } = req.body
    const user = await db.setUserSuspension(req.params.id, {
      suspended: !!suspended,
      reason: reason || ''
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    await db.logAdminAction(req.user.id, suspended ? 'suspend_user' : 'unsuspend_user',
      req.params.id, { reason: reason || null })
    res.json({ user })
  } catch (err) {
    console.error('Suspend error:', err)
    res.status(500).json({ message: 'Failed to update suspension' })
  }
})

router.post('/users/:id/role', async (req, res) => {
  try {
    const target = await db.findUserById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found' })

    const newRole = req.body.role
    if (!['fan', 'creator', 'admin', 'owner'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' })
    }
    if (target.role === 'system' || newRole === 'system') {
      return res.status(403).json({ message: 'System accounts cannot have their role changed' })
    }

    // Only owners can grant or revoke admin/owner roles.
    if ((newRole === 'admin' || newRole === 'owner') && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can grant admin or owner roles' })
    }
    // Only owners can change roles on existing admins or other owners.
    if ((target.role === 'admin' || target.role === 'owner') && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can modify staff accounts' })
    }
    // Owners cannot demote themselves — would leave the platform without one.
    if (target.id === req.user.id && req.user.role === 'owner' && newRole !== 'owner') {
      return res.status(400).json({
        message: 'An owner cannot demote themselves; transfer ownership to another account first'
      })
    }

    const user = await db.setUserRole(req.params.id, newRole)
    await db.logAdminAction(req.user.id, 'set_role', req.params.id, { role: newRole })
    res.json({ user })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update role' })
  }
})

// ─── Ambassadors ──────────────────────────────────────────────────────────

router.get('/ambassadors', async (req, res) => {
  try {
    const ambassadors = await db.getAmbassadors()
    res.json({ ambassadors })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load ambassadors' })
  }
})

router.post('/ambassadors/:id', async (req, res) => {
  try {
    const { isAmbassador, commissionRate } = req.body
    const user = await db.setAmbassadorStatus(req.params.id, {
      isAmbassador: !!isAmbassador,
      commissionRate: typeof commissionRate === 'number' ? commissionRate : undefined
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    await db.logAdminAction(req.user.id,
      isAmbassador ? 'promote_ambassador' : 'demote_ambassador',
      req.params.id,
      { commissionRate }
    )
    res.json({ user })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update ambassador status' })
  }
})

router.get('/ambassadors/:id/referrals', async (req, res) => {
  try {
    const referredCreators = await db.getReferredCreators(req.params.id)
    const payouts = await db.getReferrals({ ambassadorId: req.params.id })
    res.json({ referredCreators, payouts })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load referrals' })
  }
})

// ─── Referrals ────────────────────────────────────────────────────────────

router.get('/referrals', async (req, res) => {
  try {
    const payouts = await db.getReferrals({})
    res.json({ payouts })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load referrals' })
  }
})

// ─── Disputes ─────────────────────────────────────────────────────────────

router.get('/disputes', async (req, res) => {
  try {
    const disputes = await db.getDisputes({ status: req.query.status || '' })
    res.json({ disputes })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load disputes' })
  }
})

router.post('/disputes', async (req, res) => {
  try {
    const { raisedBy, againstUserId, transactionRef, type, summary } = req.body
    if (!raisedBy || !againstUserId || !type || !summary) {
      return res.status(400).json({ message: 'raisedBy, againstUserId, type, and summary are required' })
    }
    const dispute = await db.createDispute({ raisedBy, againstUserId, transactionRef, type, summary })
    await db.logAdminAction(req.user.id, 'create_dispute', dispute.id, { type })
    res.status(201).json({ dispute })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create dispute' })
  }
})

// Send an arbitrary follow-up message from Fanvora Support to the dispute's
// reporter, without changing the dispute's status. Lets admins ask for more
// info, send updates, etc. from inside the dispute card. Logged for audit.
router.post('/disputes/:id/reply', async (req, res) => {
  try {
    const dispute = (await db.getDisputes()).find(d => d.id === req.params.id)
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' })

    const message = String(req.body?.message || '').trim().slice(0, 4000)
    if (!message) return res.status(400).json({ message: 'message is required' })

    const sent = await db.sendSystemMessage(dispute.raisedBy, message)
    await db.logAdminAction(req.user.id, 'reply_dispute', req.params.id, {
      recipient: dispute.raisedBy,
      length: message.length
    })
    res.json({ message: sent })
  } catch (err) {
    console.error('Dispute reply error:', err)
    res.status(500).json({ message: 'Failed to send reply' })
  }
})

router.post('/disputes/:id/resolve', async (req, res) => {
  try {
    const { status, resolution } = req.body
    if (!['resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be "resolved" or "rejected"' })
    }
    const dispute = await db.resolveDispute(req.params.id, {
      adminId: req.user.id, status, resolution: resolution || ''
    })
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' })

    await db.logAdminAction(req.user.id, 'resolve_dispute', req.params.id, { status })
    res.json({ dispute })
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve dispute' })
  }
})

// ─── Support inbox / threads ──────────────────────────────────────────────

// Lightweight unread-count poll. Returns the number of inbound support
// messages this admin hasn't acknowledged yet. Does NOT update lastSeen —
// only opening the inbox itself clears the badge.
router.get('/support-inbox/unread-count', async (req, res) => {
  try {
    const count = await db.getUnreadSupportCount(req.user.id)
    res.json({ count })
  } catch (err) {
    console.error('Unread support count error:', err)
    res.status(500).json({ message: 'Failed to load unread count' })
  }
})

// List of users who've messaged Fanvora Support, newest activity first. Each
// entry carries the latest inbound preview and any related disputes so the
// admin can jump straight to a case. Side-effect: marks the inbox as "seen"
// for this admin, which clears their unread badge.
router.get('/support-inbox', async (req, res) => {
  try {
    const threads = await db.getSupportInbox({ limit: Number(req.query.limit) || 50 })
    await db.markSupportInboxSeen(req.user.id)
    res.json({ threads })
  } catch (err) {
    console.error('Support inbox error:', err)
    res.status(500).json({ message: 'Failed to load support inbox' })
  }
})

// Full Fanvora-Support ↔ user thread, oldest-first, with direction tagged.
// Used both inside the dispute card and the support-inbox detail view.
router.get('/support-thread/:userId', async (req, res) => {
  try {
    const target = await db.findUserById(req.params.userId)
    if (!target) return res.status(404).json({ message: 'User not found' })

    const supportUser = await db.getSupportUser()
    const messages = await db.getSupportThread(req.params.userId)
    res.json({
      user: {
        id: target.id,
        username: target.username,
        displayName: target.displayName,
        avatar: target.avatar,
        role: target.role
      },
      support: supportUser,
      messages
    })
  } catch (err) {
    console.error('Support thread error:', err)
    res.status(500).json({ message: 'Failed to load thread' })
  }
})

// Send a message to a user as Fanvora Support, without needing a dispute
// id. Used by the support-inbox panel so admins can answer reply-backs that
// aren't tied to an open case.
router.post('/support-thread/:userId/reply', async (req, res) => {
  try {
    const target = await db.findUserById(req.params.userId)
    if (!target) return res.status(404).json({ message: 'User not found' })

    const message = String(req.body?.message || '').trim().slice(0, 4000)
    if (!message) return res.status(400).json({ message: 'message is required' })

    const sent = await db.sendSystemMessage(req.params.userId, message)
    await db.logAdminAction(req.user.id, 'reply_support', req.params.userId, {
      length: message.length
    })
    res.json({ message: sent })
  } catch (err) {
    console.error('Support reply error:', err)
    res.status(500).json({ message: 'Failed to send reply' })
  }
})

// ─── Moderation ───────────────────────────────────────────────────────────

router.delete('/posts/:id', async (req, res) => {
  try {
    const removed = await db.deletePost(req.params.id)
    if (!removed) return res.status(404).json({ message: 'Post not found' })
    await db.logAdminAction(req.user.id, 'delete_post', req.params.id, {
      reason: req.body?.reason || null
    })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' })
  }
})

export default router
