import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import creatorRoutes from './routes/creators.js'
import postRoutes from './routes/posts.js'
import subscriptionRoutes from './routes/subscriptions.js'
import paymentRoutes from './routes/payments.js'
import messageRoutes from './routes/messages.js'
import analyticsRoutes from './routes/analytics.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS - allow configured frontend URL or localhost for dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Capture the raw body alongside the parsed JSON so PayStack webhook
// signature verification can re-hash exactly what PayStack signed.
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    if (buf && buf.length) req.rawBody = buf.toString('utf8')
  }
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/creators', creatorRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check (used by Render)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fanvora API server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
