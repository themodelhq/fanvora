// In-memory database for demo purposes
// In production, replace with PostgreSQL/MySQL/MongoDB

import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

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
    subscriptionPrice: 9.99,
    category: 'Art',
    totalSubscribers: 2340,
    totalEarnings: 45230.50,
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
    subscriptionPrice: 14.99,
    category: 'Fitness',
    totalSubscribers: 5670,
    totalEarnings: 125000.00,
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
    ppvPrice: 19.99,
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
  users: [...demoCreators, ...demoFans],
  posts: [...demoPosts],
  subscriptions: [...demoSubscriptions],
  messages: [...demoMessages],
  purchases: [],
  tips: [],
  likes: [],

  // User methods
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = {
      id: uuidv4(),
      email: userData.email,
      passwordHash: hashedPassword,
      username: userData.username,
      displayName: userData.displayName,
      bio: '',
      avatar: null,
      banner: null,
      role: userData.role || 'fan',
      isVerified: false,
      subscriptionPrice: userData.role === 'creator' ? 9.99 : 0,
      category: userData.role === 'creator' ? 'Other' : null,
      totalSubscribers: 0,
      totalEarnings: 0,
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

  // Subscription methods
  async createSubscription(fanId, creatorId) {
    const subscription = {
      id: uuidv4(),
      fanId,
      creatorId,
      status: 'active',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 2592000000), // 30 days
      autoRenew: true
    }
    this.subscriptions.push(subscription)

    // Update creator's subscriber count
    const creator = this.users.find(u => u.id === creatorId)
    if (creator) creator.totalSubscribers++

    return subscription
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

    // Update creator's earnings
    const creator = this.users.find(u => u.id === tipData.toUserId)
    if (creator) {
      creator.totalEarnings += tipData.amount
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

    return {
      totalSubscribers: userSubscribers.length,
      totalEarnings: user?.totalEarnings || 0,
      totalViews: userPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0),
      totalLikes: userPosts.reduce((acc, p) => acc + (p.likeCount || 0), 0),
      monthlyRevenue: userSubscribers.length * (user?.subscriptionPrice || 0)
    }
  },

  async getRevenueBreakdown(userId) {
    const purchases = this.purchases.filter(p => {
      const post = this.posts.find(pp => pp.id === p.postId)
      return post?.creatorId === userId
    })
    const tips = this.tips.filter(t => t.toUserId === userId)

    const fromSubscriptions = this.subscriptions
      .filter(s => s.creatorId === userId)
      .reduce((acc, s) => {
        const creator = this.users.find(u => u.id === s.creatorId)
        return acc + (creator?.subscriptionPrice || 0)
      }, 0)

    return {
      total: fromSubscriptions + purchases.reduce((acc, p) => acc + p.amount, 0) + tips.reduce((acc, t) => acc + t.amount, 0),
      available: (user?.totalEarnings || 0) * 0.8, // 80% available after platform fee
      pending: (user?.totalEarnings || 0) * 0.2,
      fromSubscriptions,
      fromPpv: purchases.filter(p => p.type === 'ppv').reduce((acc, p) => acc + p.amount, 0),
      fromTips: tips.reduce((acc, t) => acc + t.amount, 0),
      subscriptionCount: this.subscriptions.filter(s => s.creatorId === userId).length,
      ppvCount: purchases.filter(p => p.type === 'ppv').length,
      tipCount: tips.length
    }
  }
}

export default db
