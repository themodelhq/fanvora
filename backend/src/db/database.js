// In-memory database for demo purposes
// In production, replace with PostgreSQL/MySQL/MongoDB

import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { CREATOR_SHARE, PLATFORM_FEE, creatorNet } from '../config/platform.js'

// Default commission paid to an ambassador on every gross transaction earned
// by a creator they referred. Sourced from the platform's 30% cut.
export const DEFAULT_AMBASSADOR_COMMISSION = 0.05

// 8-char URL-safe code for referral links: e.g. FNVR-AB12CD34
function generateReferralCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `FNVR-${s}`
}

// Demo data
const demoCreators = [
  {
    id: 'demo-creator-1',
    email: 'creator@demo.com',
    passwordHash: '$2a$10$XQxBtQKQKQKQKQKQKQKQKQOXqQKQKQKQKQKQKQKQKQKQKQKQKQKQ', // password123
    username: 'sophia_arts',
    displayName: 'Sophia Arts',
    bio: 'Digital artist sharing exclusive artwork and tutorials. Join me for behind-the-scenes content!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=300&fit=crop',
    role: 'creator',
    isVerified: true,
    subscriptionPrice: 4500,
    category: 'Art',
    totalSubscribers: 2340,
    totalEarnings: 7350000,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'demo-creator-2',
    email: 'mike_fit@demo.com',
    passwordHash: '$2a$10$XQxBtQKQKQKQKQKQKQKQKQOXqQKQKQKQKQKQKQKQKQKQKQKQKQKQ',
    username: 'fitness_mike',
    displayName: 'Mike Fitness',
    bio: 'Personal trainer | Workout plans | Nutrition tips | Live sessions every week',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop',
    role: 'creator',
    isVerified: true,
    subscriptionPrice: 7500,
    category: 'Fitness',
    totalSubscribers: 5670,
    totalEarnings: 18250000,
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date()
  }
]

const demoFans = [
  {
    id: 'demo-fan-1',
    email: 'fan@demo.com',
    passwordHash: '$2a$10$XQxBtQKQKQKQKQKQKQKQKQOXqQKQKQKQKQKQKQKQKQKQKQKQKQKQ', // password123
    username: 'john_fan',
    displayName: 'John Doe',
    bio: 'Supporting my favorite creators!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    role: 'fan',
    isVerified: false,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date()
  }
]

// Seeded staff accounts. In production every one of these should be
// provisioned out-of-band; the public signup flow refuses these roles.
//   owner@demo.com  / owner123  → owner (top of hierarchy, oversees admins)
//   admin@demo.com  / admin123  → admin (moderates users / disputes)
//   fanvora_support             → system, used to DM reporters about disputes
export const SUPPORT_USER_ID = 'fanvora-system-support'

const demoStaff = [
  {
    id: 'demo-owner-1',
    email: 'owner@demo.com',
    passwordHash: '$2a$10$tXDvO1OtDwNONj5QgqOnSu09./6f9HfN/YPSto48NML4ocTRoErSO',
    username: 'fanvora_owner',
    displayName: 'Fanvora Owner',
    bio: '',
    avatar: null,
    banner: null,
    role: 'owner',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    passwordHash: '$2a$10$Fv5d9FCz8qukqSBr/fOGS.wuNRCx3rAzOMlV1N9tOkqX.ry6ujViK',
    username: 'fanvora_admin',
    displayName: 'Fanvora Admin',
    bio: '',
    avatar: null,
    banner: null,
    role: 'admin',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: SUPPORT_USER_ID,
    email: 'support@fanvora.local',
    passwordHash: '', // never logs in
    username: 'fanvora_support',
    displayName: 'Fanvora Support',
    bio: 'Official Fanvora support channel. Replies here go to our trust & safety team.',
    avatar: null,
    banner: null,
    role: 'system',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
]

const demoPosts = [
  {
    id: 'post-1',
    creatorId: 'demo-creator-1',
    content: 'Just finished this new digital painting! Let me know what you think in the comments. 🎨 #digitalart #newwork',
    mediaUrls: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'
    ],
    mediaType: 'image',
    isPpv: false,
    ppvPrice: 0,
    isPinned: true,
    likeCount: 234,
    viewCount: 1520,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date()
  },
  {
    id: 'post-2',
    creatorId: 'demo-creator-1',
    content: 'EXCLUSIVE: Full tutorial on how I created this piece. This is a 2-hour deep dive with all my techniques!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop'
    ],
    mediaType: 'video',
    isPpv: true,
    ppvPrice: 9500,
    isPinned: false,
    likeCount: 89,
    viewCount: 456,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date()
  },
  {
    id: 'post-3',
    creatorId: 'demo-creator-2',
    content: 'New workout routine! This one focuses on core strength and endurance. Try it and let me know your results! 💪',
    mediaUrls: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop'
    ],
    mediaType: 'image',
    isPpv: false,
    ppvPrice: 0,
    isPinned: false,
    likeCount: 567,
    viewCount: 3200,
    createdAt: new Date(Date.now() - 43200000),
    updatedAt: new Date()
  }
]

const demoSubscriptions = [
  {
    id: 'sub-1',
    fanId: 'demo-fan-1',
    creatorId: 'demo-creator-1',
    status: 'active',
    startedAt: new Date(Date.now() - 604800000),
    expiresAt: new Date(Date.now() + 2592000000),
    autoRenew: true
  }
]

const demoMessages = [
  {
    id: 'msg-1',
    senderId: 'demo-creator-1',
    receiverId: 'demo-fan-1',
    content: 'Thank you for subscribing! Feel free to message me anytime.',
    isRead: true,
    createdAt: new Date(Date.now() - 432000000)
  }
]

// Database object
export const db = {
  users: [...demoCreators, ...demoFans, ...demoStaff],
  posts: [...demoPosts],
  subscriptions: [...demoSubscriptions],
  messages: [...demoMessages],
  purchases: [],
  tips: [],
  likes: [],

  // Admin / ambassador / moderation stores
  referralPayouts: [], // audit log: every commission credited to an ambassador
  disputes: [],        // moderation queue: fan-vs-creator disputes
  adminLog: [],        // audit log: every admin action that mutates state

  // User methods
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    // Public signup may NEVER create an admin account. Admin is provisioned
    // out-of-band only.
    const role = userData.role === 'creator' ? 'creator' : 'fan'

    // Resolve the referral code to an ambassador, if a valid code was supplied.
    let referredBy = null
    if (userData.referralCode) {
      const ambassador = this.users.find(
        u => u.referralCode === userData.referralCode && u.isAmbassador
      )
      if (ambassador) referredBy = ambassador.id
    }

    const user = {
      id: uuidv4(),
      email: userData.email,
      passwordHash: hashedPassword,
      username: userData.username,
      displayName: userData.displayName,
      bio: '',
      avatar: null,
      banner: null,
      role,
      isVerified: false,
      subscriptionPrice: role === 'creator' ? 4500 : 0,
      category: role === 'creator' ? 'Other' : null,
      totalSubscribers: 0,
      totalEarnings: 0,

      // Ambassador / referral fields
      isAmbassador: false,
      referralCode: null,
      ambassadorCommissionRate: DEFAULT_AMBASSADOR_COMMISSION,
      referredBy,

      // Moderation
      isSuspended: false,
      suspendedAt: null,
      suspendedReason: null,

      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.users.push(user)
    return user
  },

  async findUserByEmail(email) {
    return this.users.find(u => u.email === email)
  },

  async findUserByUsername(username) {
    return this.users.find(u => u.username === username)
  },

  async findUserById(id) {
    return this.users.find(u => u.id === id)
  },

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.passwordHash)
  },

  async updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() }
      return this.users[index]
    }
    return null
  },

  // GDPR right of access / portability — assemble every piece of personal
  // data we hold about the user into a single, machine-readable structure.
  async exportUserData(userId) {
    const user = this.users.find(u => u.id === userId)
    if (!user) return null

    const profile = { ...user }
    delete profile.passwordHash

    const posts = this.posts.filter(p => p.creatorId === userId)
    const purchases = this.purchases.filter(p => p.userId === userId)
    const tipsSent = this.tips.filter(t => t.fromUserId === userId)
    const tipsReceived = this.tips.filter(t => t.toUserId === userId)
    const subscriptionsAsFan = this.subscriptions.filter(s => s.fanId === userId)
    const subscriptionsAsCreator = this.subscriptions.filter(s => s.creatorId === userId)
    const likes = this.likes.filter(l => l.userId === userId)
    const messages = this.messages.filter(
      m => m.senderId === userId || m.receiverId === userId
    )

    return {
      generatedAt: new Date().toISOString(),
      schema: 'fanvora-export-v1',
      profile,
      content: { posts },
      subscriptions: {
        asFan: subscriptionsAsFan,
        asCreator: subscriptionsAsCreator
      },
      transactions: {
        purchases,
        tipsSent,
        tipsReceived
      },
      activity: {
        likes,
        messages
      }
    }
  },

  // GDPR right to erasure — remove all personally-identifying data immediately,
  // delete content the user authored, and cancel active subscriptions.
  // Financial records (purchases / tips) are retained, but they reference the
  // anonymised user record so no PII remains. The Privacy Policy commits us to
  // keeping these for 7 years for tax / AML obligations.
  async deleteUserAccount(userId) {
    const idx = this.users.findIndex(u => u.id === userId)
    if (idx === -1) return false

    const shortId = userId.slice(0, 8)

    // Anonymise the user record (keep the row so foreign keys still resolve).
    this.users[idx] = {
      id: userId,
      email: `deleted-${userId}@deleted.fanvora.local`,
      passwordHash: '',
      username: `deleted_${shortId}`,
      displayName: '[Deleted user]',
      bio: '',
      avatar: null,
      banner: null,
      role: this.users[idx].role,
      isVerified: false,
      subscriptionPrice: 0,
      category: null,
      totalSubscribers: 0,
      totalEarnings: 0,
      socialLinks: null,
      isDeleted: true,
      deletedAt: new Date(),
      createdAt: this.users[idx].createdAt,
      updatedAt: new Date()
    }

    // Delete content the user authored.
    this.posts = this.posts.filter(p => p.creatorId !== userId)

    // Drop their likes (no PII to retain there).
    this.likes = this.likes.filter(l => l.userId !== userId)

    // Cancel active subscriptions involving the user.
    this.subscriptions.forEach(s => {
      if ((s.fanId === userId || s.creatorId === userId) && s.status === 'active') {
        s.status = 'cancelled'
        s.cancelledAt = new Date()
      }
    })

    // Messages: keep them so the OTHER party still sees their conversation,
    // but anonymise the content the deleted user wrote.
    this.messages.forEach(m => {
      if (m.senderId === userId) m.content = '[message removed]'
    })

    return true
  },

  // Creator methods
  async getCreators(filters = {}) {
    let creators = this.users.filter(u => u.role === 'creator')

    if (filters.search) {
      const search = filters.search.toLowerCase()
      creators = creators.filter(c =>
        c.username.toLowerCase().includes(search) ||
        c.displayName.toLowerCase().includes(search)
      )
    }

    if (filters.category) {
      creators = creators.filter(c => c.category === filters.category)
    }

    // Sort by subscribers
    creators.sort((a, b) => b.totalSubscribers - a.totalSubscribers)

    return creators
  },

  async getFeaturedCreators() {
    return this.users
      .filter(u => u.role === 'creator')
      .sort((a, b) => b.totalSubscribers - a.totalSubscribers)
      .slice(0, 10)
  },

  async getCreatorByUsername(username) {
    return this.users.find(u => u.username === username && u.role === 'creator')
  },

  // Post methods
  async createPost(postData) {
    const post = {
      id: uuidv4(),
      creatorId: postData.creatorId,
      content: postData.content,
      mediaUrls: postData.mediaUrls || [],
      mediaType: postData.mediaUrls?.length > 0 ? 'image' : 'text',
      isPpv: postData.isPpv || false,
      ppvPrice: postData.ppvPrice || 0,
      isPinned: false,
      likeCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.posts.unshift(post)
    return post
  },

  async getPostById(id) {
    return this.posts.find(p => p.id === id)
  },

  async getPostsByCreator(creatorId) {
    return this.posts
      .filter(p => p.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getFeed(userId) {
    // Get subscriptions for this user
    const userSubscriptions = this.subscriptions.filter(
      s => s.fanId === userId && s.status === 'active'
    )
    const subscribedCreatorIds = userSubscriptions.map(s => s.creatorId)

    // Get posts from subscribed creators and non-PPV posts
    return this.posts
      .filter(p => !p.isPpv || subscribedCreatorIds.includes(p.creatorId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(p => ({
        ...p,
        creator: this.users.find(u => u.id === p.creatorId)
      }))
  },

  async likePost(postId, userId) {
    const existingLike = this.likes.find(
      l => l.postId === postId && l.userId === userId
    )

    if (existingLike) {
      // Unlike
      this.likes = this.likes.filter(l => l !== existingLike)
      const post = this.posts.find(p => p.id === postId)
      if (post) post.likeCount = Math.max(0, post.likeCount - 1)
      return false
    } else {
      // Like
      this.likes.push({ postId, userId })
      const post = this.posts.find(p => p.id === postId)
      if (post) post.likeCount++
      return true
    }
  },

  // Ambassador commission — internal helper called from every revenue event.
  // Returns the commission credited (or null if no eligible ambassador).
  // The 5% comes out of the platform's 30% cut (per platform policy), so the
  // referred creator's 70% net is unaffected.
  _creditAmbassador(referredCreatorId, gross, sourceType, sourceRef = null) {
    if (!gross || gross <= 0) return null
    const referred = this.users.find(u => u.id === referredCreatorId)
    if (!referred?.referredBy) return null

    const ambassador = this.users.find(u => u.id === referred.referredBy)
    if (!ambassador) return null
    if (!ambassador.isAmbassador) return null     // role revoked → no future commission
    if (ambassador.isSuspended) return null
    if (ambassador.isDeleted) return null

    const rate = typeof ambassador.ambassadorCommissionRate === 'number'
      ? ambassador.ambassadorCommissionRate
      : DEFAULT_AMBASSADOR_COMMISSION
    const commission = Number((gross * rate).toFixed(2))
    if (commission <= 0) return null

    ambassador.totalEarnings = Number((ambassador.totalEarnings + commission).toFixed(2))

    this.referralPayouts.push({
      id: uuidv4(),
      ambassadorId: ambassador.id,
      referredCreatorId,
      sourceType, // 'subscription' | 'ppv' | 'tip'
      sourceRef,
      gross: Number(gross.toFixed ? gross.toFixed(2) : gross),
      commission,
      rate,
      createdAt: new Date()
    })
    return commission
  },

  // Subscription methods
  async createSubscription(fanId, creatorId, paystackRef = null) {
    const subscription = {
      id: uuidv4(),
      fanId,
      creatorId,
      status: 'active',
      paystackRef,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 2592000000), // 30 days
      autoRenew: true
    }
    this.subscriptions.push(subscription)

    // Update creator's subscriber count + credit the 70% creator share
    // of this month's subscription fee to their earnings balance.
    const creator = this.users.find(u => u.id === creatorId)
    if (creator) {
      const gross = creator.subscriptionPrice || 0
      creator.totalSubscribers++
      creator.totalEarnings += creatorNet(gross)
      this._creditAmbassador(creatorId, gross, 'subscription', paystackRef)
    }

    return subscription
  },

  // Idempotency lookups by PayStack reference — used by /verify and /webhook
  // so a single transaction can never be fulfilled twice.
  async findSubscriptionByRef(paystackRef) {
    return this.subscriptions.find(s => s.paystackRef === paystackRef)
  },

  async findPurchaseByRef(paystackRef) {
    return this.purchases.find(p => p.paystackRef === paystackRef)
  },

  async findTipByRef(paystackRef) {
    return this.tips.find(t => t.paystackRef === paystackRef)
  },

  async getUserSubscriptions(userId) {
    return this.subscriptions
      .filter(s => s.fanId === userId && s.status === 'active')
      .map(s => ({
        ...s,
        creator: this.users.find(u => u.id === s.creatorId)
      }))
  },

  async isSubscribed(fanId, creatorId) {
    return this.subscriptions.some(
      s => s.fanId === fanId && s.creatorId === creatorId && s.status === 'active'
    )
  },

  // Purchase methods
  async createPurchase(purchaseData) {
    const purchase = {
      id: uuidv4(),
      userId: purchaseData.userId,
      postId: purchaseData.postId,
      type: purchaseData.type,
      amount: purchaseData.amount,
      paystackRef: purchaseData.paystackRef,
      createdAt: new Date()
    }
    this.purchases.push(purchase)

    // Credit the creator's 70% share for PPV purchases (and ambassador 5%).
    if (purchaseData.type === 'ppv' && purchaseData.postId) {
      const post = this.posts.find(p => p.id === purchaseData.postId)
      if (post) {
        const creator = this.users.find(u => u.id === post.creatorId)
        if (creator) {
          creator.totalEarnings += creatorNet(purchaseData.amount)
          this._creditAmbassador(creator.id, purchaseData.amount, 'ppv', purchaseData.paystackRef)
        }
      }
    }

    return purchase
  },

  async hasPurchasedPost(userId, postId) {
    return this.purchases.some(
      p => p.userId === userId && p.postId === postId
    )
  },

  // Message methods
  async createMessage(senderId, receiverId, content) {
    const message = {
      id: uuidv4(),
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt: new Date()
    }
    this.messages.push(message)
    return message
  },

  async getConversation(userId1, userId2) {
    return this.messages
      .filter(m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  },

  async getConversations(userId) {
    const userMessages = this.messages.filter(
      m => m.senderId === userId || m.receiverId === userId
    )

    const conversationMap = new Map()

    userMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId
      if (!conversationMap.has(otherUserId)) {
        const otherUser = this.users.find(u => u.id === otherUserId)
        if (otherUser) {
          conversationMap.set(otherUserId, {
            user: {
              id: otherUser.id,
              username: otherUser.username,
              displayName: otherUser.displayName,
              avatar: otherUser.avatar
            },
            lastMessage: msg.content,
            unread: 0
          })
        }
      }

      if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationMap.get(otherUserId)
        if (conv) conv.unread++
      }
    })

    return Array.from(conversationMap.values())
  },

  // Tip methods
  async createTip(tipData) {
    const tip = {
      id: uuidv4(),
      fromUserId: tipData.fromUserId,
      toUserId: tipData.toUserId,
      amount: tipData.amount,
      message: tipData.message || '',
      paystackRef: tipData.paystackRef,
      createdAt: new Date()
    }
    this.tips.push(tip)

    // Update creator's earnings — credit only the 70% creator share.
    const creator = this.users.find(u => u.id === tipData.toUserId)
    if (creator) {
      creator.totalEarnings += creatorNet(tipData.amount)
      this._creditAmbassador(creator.id, tipData.amount, 'tip', tipData.paystackRef)
    }

    return tip
  },

  // Analytics methods
  async getAnalytics(userId) {
    const user = this.users.find(u => u.id === userId)
    const userPosts = this.posts.filter(p => p.creatorId === userId)
    const userSubscribers = this.subscriptions.filter(
      s => s.creatorId === userId && s.status === 'active'
    )

    const grossMonthly = userSubscribers.length * (user?.subscriptionPrice || 0)

    return {
      currency: 'NGN',
      totalSubscribers: userSubscribers.length,
      totalEarnings: user?.totalEarnings || 0,
      totalViews: userPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0),
      totalLikes: userPosts.reduce((acc, p) => acc + (p.likeCount || 0), 0),
      monthlyRevenue: Number((grossMonthly * CREATOR_SHARE).toFixed(2))
    }
  },

  async getRevenueBreakdown(userId) {
    const creator = this.users.find(u => u.id === userId)

    const purchases = this.purchases.filter(p => {
      const post = this.posts.find(pp => pp.id === p.postId)
      return post?.creatorId === userId
    })
    const tips = this.tips.filter(t => t.toUserId === userId)

    // Gross revenue (what fans paid).
    const grossSubscriptions = this.subscriptions
      .filter(s => s.creatorId === userId)
      .reduce((acc) => acc + (creator?.subscriptionPrice || 0), 0)
    const grossPpv = purchases
      .filter(p => p.type === 'ppv')
      .reduce((acc, p) => acc + p.amount, 0)
    const grossTips = tips.reduce((acc, t) => acc + t.amount, 0)
    const grossTotal = grossSubscriptions + grossPpv + grossTips

    // Net revenue (what the creator keeps after the 30% platform fee).
    const fromSubscriptions = Number((grossSubscriptions * CREATOR_SHARE).toFixed(2))
    const fromPpv = Number((grossPpv * CREATOR_SHARE).toFixed(2))
    const fromTips = Number((grossTips * CREATOR_SHARE).toFixed(2))
    const total = Number((grossTotal * CREATOR_SHARE).toFixed(2))

    // For demo purposes, treat 80% of net earnings as cleared/available
    // and the remaining 20% as pending until the 7-day hold elapses.
    const earnings = creator?.totalEarnings || 0
    const available = Number((earnings * 0.8).toFixed(2))
    const pending = Number((earnings * 0.2).toFixed(2))

    return {
      currency: 'NGN',
      creatorShare: CREATOR_SHARE,
      platformFee: PLATFORM_FEE,
      total,
      gross: grossTotal,
      platformCut: Number((grossTotal * PLATFORM_FEE).toFixed(2)),
      available,
      pending,
      fromSubscriptions,
      fromPpv,
      fromTips,
      fromReferrals: this.referralPayouts
        .filter(p => p.ambassadorId === userId)
        .reduce((acc, p) => acc + p.commission, 0),
      subscriptionCount: this.subscriptions.filter(s => s.creatorId === userId).length,
      ppvCount: purchases.filter(p => p.type === 'ppv').length,
      tipCount: tips.length
    }
  },

  // ────────────────────────────────────────────────────────────────────────
  // Admin / ambassador / moderation methods
  // ────────────────────────────────────────────────────────────────────────

  // Sanitize a user record for admin views (strip password hash; keep
  // everything else including isSuspended, isAmbassador, referralCode).
  _publicUser(u) {
    if (!u) return null
    const { passwordHash, ...rest } = u
    return rest
  },

  async getAllUsers({ search = '', role = '', limit = 200 } = {}) {
    let users = this.users
    if (role) users = users.filter(u => u.role === role)
    if (search) {
      const s = search.toLowerCase()
      users = users.filter(u =>
        (u.email || '').toLowerCase().includes(s) ||
        (u.username || '').toLowerCase().includes(s) ||
        (u.displayName || '').toLowerCase().includes(s)
      )
    }
    return users.slice(0, limit).map(u => this._publicUser(u))
  },

  async setUserSuspension(userId, { suspended, reason = '' }) {
    const user = this.users.find(u => u.id === userId)
    if (!user) return null
    user.isSuspended = !!suspended
    user.suspendedAt = suspended ? new Date() : null
    user.suspendedReason = suspended ? reason : null
    user.updatedAt = new Date()
    return this._publicUser(user)
  },

  async setUserRole(userId, newRole) {
    if (!['fan', 'creator', 'admin', 'owner'].includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`)
    }
    const user = this.users.find(u => u.id === userId)
    if (!user) return null

    // If demoting away from creator, also revoke ambassador status.
    if (newRole !== 'creator') {
      user.isAmbassador = false
    }

    user.role = newRole
    user.updatedAt = new Date()
    return this._publicUser(user)
  },

  // Send a message from the official Fanvora Support account. Used for dispute
  // acknowledgments and resolutions so the reporter is notified through their
  // regular messaging inbox.
  async sendSystemMessage(toUserId, content) {
    return this.createMessage(SUPPORT_USER_ID, toUserId, content)
  },

  // Public profile for the Fanvora Support system user — frontend uses this
  // to render the "Message Fanvora Support" entry point and the chat header
  // without having to hardcode the seeded UUID.
  async getSupportUser() {
    const u = this.users.find(u => u.id === SUPPORT_USER_ID)
    return u ? this._publicUser(u) : null
  },

  // Full conversation between Fanvora Support and a given user, oldest-first.
  // Each message is tagged with `direction` so the frontend doesn't need to
  // know the support user's id to render the bubble alignment.
  async getSupportThread(userId) {
    const raw = await this.getConversation(SUPPORT_USER_ID, userId)
    return raw.map(m => ({
      ...m,
      direction: m.senderId === SUPPORT_USER_ID ? 'outbound' : 'inbound'
    }))
  },

  // Admin "support inbox": one entry per user who has ever messaged Fanvora
  // Support, sorted by most recent inbound message. Includes a count of
  // inbound messages and any related disputes the user has raised so admins
  // can pivot back to the case quickly.
  async getSupportInbox({ limit = 50 } = {}) {
    const inboundByUser = new Map()
    for (const m of this.messages) {
      if (m.receiverId !== SUPPORT_USER_ID) continue
      const cur = inboundByUser.get(m.senderId)
      if (!cur || new Date(m.createdAt) > new Date(cur.lastInboundAt)) {
        inboundByUser.set(m.senderId, {
          userId: m.senderId,
          lastInboundAt: m.createdAt,
          lastInboundContent: m.content,
          inboundCount: (cur?.inboundCount ?? 0) + 1
        })
      } else {
        cur.inboundCount += 1
      }
    }

    const threads = []
    for (const [userId, summary] of inboundByUser) {
      const user = this.users.find(u => u.id === userId)
      if (!user) continue
      const totalCount = this.messages.filter(
        m => (m.senderId === userId && m.receiverId === SUPPORT_USER_ID) ||
             (m.senderId === SUPPORT_USER_ID && m.receiverId === userId)
      ).length
      const relatedDisputes = this.disputes
        .filter(d => d.raisedBy === userId)
        .map(d => ({
          id: d.id,
          shortId: d.id.slice(0, 8),
          status: d.status,
          type: d.type,
          createdAt: d.createdAt
        }))
      threads.push({
        userId,
        user: this._publicUser(user),
        lastInboundAt: summary.lastInboundAt,
        lastInboundContent: summary.lastInboundContent.slice(0, 280),
        inboundCount: summary.inboundCount,
        totalCount,
        relatedDisputes
      })
    }

    return threads
      .sort((a, b) => new Date(b.lastInboundAt) - new Date(a.lastInboundAt))
      .slice(0, limit)
  },

  // Promote a creator to ambassador. Generates a unique referral code if the
  // user doesn't already have one (codes persist across demotion/repromotion
  // so existing referrals continue to resolve).
  async setAmbassadorStatus(userId, { isAmbassador, commissionRate }) {
    const user = this.users.find(u => u.id === userId)
    if (!user) return null
    if (isAmbassador && user.role !== 'creator') {
      throw new Error('Only creators can be promoted to ambassadors')
    }

    user.isAmbassador = !!isAmbassador
    if (typeof commissionRate === 'number' && commissionRate >= 0 && commissionRate <= 1) {
      user.ambassadorCommissionRate = commissionRate
    }

    if (isAmbassador && !user.referralCode) {
      let code
      do { code = generateReferralCode() }
      while (this.users.some(u => u.referralCode === code))
      user.referralCode = code
    }

    user.updatedAt = new Date()
    return this._publicUser(user)
  },

  async findUserByReferralCode(code) {
    if (!code) return null
    return this.users.find(u => u.referralCode === code) || null
  },

  // Count of inbound messages to Fanvora Support that arrived AFTER this
  // admin last looked at the support inbox. Used to drive the unread badge.
  // First-time admins have no `lastSeenSupportInboxAt`, so everything counts
  // as unread until they open the tab once.
  async getUnreadSupportCount(adminId) {
    const admin = this.users.find(u => u.id === adminId)
    if (!admin) return 0
    if (!['admin', 'owner'].includes(admin.role)) return 0

    const since = admin.lastSeenSupportInboxAt
      ? new Date(admin.lastSeenSupportInboxAt)
      : new Date(0)

    return this.messages.filter(m =>
      m.receiverId === SUPPORT_USER_ID && new Date(m.createdAt) > since
    ).length
  },

  // Mark the support inbox as "seen" by the calling admin, NOW. Called
  // automatically whenever an admin loads the inbox list.
  async markSupportInboxSeen(adminId) {
    const admin = this.users.find(u => u.id === adminId)
    if (!admin) return
    if (!['admin', 'owner'].includes(admin.role)) return
    admin.lastSeenSupportInboxAt = new Date()
    admin.updatedAt = new Date()
  },

  // Admin view of ambassadors with their performance.
  async getAmbassadors() {
    return this.users
      .filter(u => u.isAmbassador)
      .map(amb => {
        const referredUsers = this.users.filter(u => u.referredBy === amb.id)
        const payouts = this.referralPayouts.filter(p => p.ambassadorId === amb.id)
        const totalCommission = payouts.reduce((acc, p) => acc + p.commission, 0)
        return {
          ...this._publicUser(amb),
          referredCount: referredUsers.length,
          activeReferredCount: referredUsers.filter(u => !u.isDeleted && !u.isSuspended).length,
          payoutCount: payouts.length,
          totalCommission: Number(totalCommission.toFixed(2))
        }
      })
  },

  async getReferrals({ ambassadorId } = {}) {
    let payouts = this.referralPayouts
    if (ambassadorId) payouts = payouts.filter(p => p.ambassadorId === ambassadorId)
    return payouts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(p => ({
        ...p,
        ambassador: this._publicUser(this.users.find(u => u.id === p.ambassadorId)),
        referredCreator: this._publicUser(this.users.find(u => u.id === p.referredCreatorId))
      }))
  },

  async getReferredCreators(ambassadorId) {
    return this.users
      .filter(u => u.referredBy === ambassadorId)
      .map(u => this._publicUser(u))
  },

  // Self-service summary for an ambassador's own dashboard. Returns a
  // safe slice of data the ambassador is entitled to see — never another
  // ambassador's payouts.
  async getMyReferralSummary(ambassadorId) {
    const user = this.users.find(u => u.id === ambassadorId)
    if (!user) return null

    const referredCreators = this.users
      .filter(u => u.referredBy === ambassadorId)
      .map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        joinedAt: u.createdAt,
        isSuspended: !!u.isSuspended,
        isDeleted: !!u.isDeleted
      }))

    const payouts = this.referralPayouts
      .filter(p => p.ambassadorId === ambassadorId)
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const totalCommission = payouts.reduce((acc, p) => acc + p.commission, 0)

    return {
      isAmbassador: !!user.isAmbassador,
      referralCode: user.referralCode || null,
      commissionRate: user.ambassadorCommissionRate ?? DEFAULT_AMBASSADOR_COMMISSION,
      currency: 'NGN',
      referredCount: referredCreators.length,
      activeReferredCount: referredCreators.filter(u => !u.isDeleted && !u.isSuspended).length,
      payoutCount: payouts.length,
      totalCommission: Number(totalCommission.toFixed(2)),
      payouts: payouts.slice(0, 100), // recent 100
      referredCreators
    }
  },

  // Disputes ──────────────────────────────────────────────────────────────

  async createDispute({ raisedBy, againstUserId, transactionRef = null, type, summary }) {
    const dispute = {
      id: uuidv4(),
      raisedBy,
      againstUserId,
      transactionRef,
      type, // 'refund' | 'content' | 'conduct' | 'spam' | 'impersonation' | 'copyright' | 'other'
      summary,
      status: 'open', // 'open' | 'resolved' | 'rejected'
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.disputes.push(dispute)

    // Auto-DM the reporter so they see the case acknowledgment in their inbox.
    const target = this.users.find(u => u.id === againstUserId)
    const ack =
      `Thanks for your report. We've opened a case (ref ${dispute.id.slice(0, 8)}) ` +
      `${target ? `regarding @${target.username}` : ''} and our trust & safety team will ` +
      `review it shortly. We'll respond on this thread when there's an update. — Fanvora Support`
    await this.sendSystemMessage(raisedBy, ack)

    return dispute
  },

  async getDisputes({ status = '' } = {}) {
    let list = this.disputes
    if (status) list = list.filter(d => d.status === status)
    return list
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(d => ({
        ...d,
        raisedByUser: this._publicUser(this.users.find(u => u.id === d.raisedBy)),
        againstUser: this._publicUser(this.users.find(u => u.id === d.againstUserId))
      }))
  },

  async resolveDispute(disputeId, { adminId, status, resolution }) {
    const dispute = this.disputes.find(d => d.id === disputeId)
    if (!dispute) return null
    dispute.status = status === 'resolved' ? 'resolved' : 'rejected'
    dispute.resolution = resolution || null
    dispute.resolvedBy = adminId
    dispute.resolvedAt = new Date()
    dispute.updatedAt = new Date()

    // Notify the reporter through the messaging inbox.
    const verb = dispute.status === 'resolved' ? 'resolved' : 'closed without action'
    const note = resolution ? `\n\n"${resolution}"` : ''
    await this.sendSystemMessage(
      dispute.raisedBy,
      `Your report (ref ${dispute.id.slice(0, 8)}) has been ${verb}.${note}\n\n— Fanvora Support`
    )

    return dispute
  },

  // Moderation ────────────────────────────────────────────────────────────

  async deletePost(postId) {
    const before = this.posts.length
    this.posts = this.posts.filter(p => p.id !== postId)
    return this.posts.length < before
  },

  // Admin audit log ───────────────────────────────────────────────────────

  async logAdminAction(adminId, action, target = null, details = {}) {
    const entry = {
      id: uuidv4(),
      adminId,
      action,
      target,
      details,
      createdAt: new Date()
    }
    this.adminLog.push(entry)
    return entry
  },

  async getAdminLog({ limit = 100 } = {}) {
    return this.adminLog
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(entry => ({
        ...entry,
        admin: this._publicUser(this.users.find(u => u.id === entry.adminId))
      }))
  },

  // Platform-wide stats for the admin Overview tab.
  async getPlatformStats() {
    const userCounts = this.users.reduce(
      (acc, u) => {
        acc.total++
        acc[u.role] = (acc[u.role] || 0) + 1
        if (u.isAmbassador) acc.ambassadors++
        if (u.isSuspended) acc.suspended++
        if (u.isDeleted) acc.deleted++
        return acc
      },
      { total: 0, fan: 0, creator: 0, admin: 0, ambassadors: 0, suspended: 0, deleted: 0 }
    )

    const grossRevenue = this.purchases.reduce((acc, p) => acc + (p.amount || 0), 0)
      + this.tips.reduce((acc, t) => acc + (t.amount || 0), 0)

    const totalCommission = this.referralPayouts.reduce((acc, p) => acc + p.commission, 0)

    return {
      currency: 'NGN',
      users: userCounts,
      content: { posts: this.posts.length },
      transactions: {
        purchases: this.purchases.length,
        tips: this.tips.length,
        subscriptions: this.subscriptions.length,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        platformCut: Number((grossRevenue * PLATFORM_FEE).toFixed(2)),
        ambassadorCommissionPaid: Number(totalCommission.toFixed(2))
      },
      disputes: {
        open: this.disputes.filter(d => d.status === 'open').length,
        resolved: this.disputes.filter(d => d.status === 'resolved').length,
        rejected: this.disputes.filter(d => d.status === 'rejected').length
      }
    }
  }
}

export default db
