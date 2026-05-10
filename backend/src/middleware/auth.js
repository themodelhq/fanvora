import jwt from 'jsonwebtoken'
import { db } from '../db/database.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fanvora-secret-key-change-in-production'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = await db.findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Remove sensitive data
    delete user.passwordHash
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      const user = await db.findUserById(decoded.userId)
      if (user) {
        delete user.passwordHash
        req.user = user
      }
    }
    next()
  } catch (error) {
    next()
  }
}

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Stack on top of authenticate to gate staff-only routes (admin OR owner).
// Owners are admins-plus and can do everything an admin can.
export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Admin only' })
  }
  next()
}

// Stack on top of authenticate for owner-only routes (e.g. promoting other
// users to admin/owner, suspending admins).
export const requireOwner = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Owner only' })
  next()
}
