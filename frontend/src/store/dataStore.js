import { create } from 'zustand'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useDataStore = create((set, get) => ({
  creators: [],
  featuredCreators: [],
  posts: [],
  subscriptions: [],
  messages: [],
  conversations: [],
  earnings: null,
  analytics: null,
  isLoading: false,
  error: null,

  // Creators
  fetchCreators: async (params = {}) => {
    set({ isLoading: true })
    try {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`${API_URL}/creators?${query}`)
      const data = await res.json()
      set({ creators: data.creators || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchFeaturedCreators: async () => {
    try {
      const res = await fetch(`${API_URL}/creators/featured`)
      const data = await res.json()
      set({ featuredCreators: data.creators || [] })
    } catch (error) {
      console.error('Failed to fetch featured creators:', error)
    }
  },

  fetchCreator: async (username) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`${API_URL}/creators/${username}`)
      const data = await res.json()
      set({ isLoading: false })
      return data.creator
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // Posts
  fetchFeed: async () => {
    const token = useAuthStore.getState().token
    set({ isLoading: true })
    try {
      const res = await fetch(`${API_URL}/posts/feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      set({ posts: data.posts || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchCreatorPosts: async (creatorId) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/posts/creator/${creatorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      return data.posts || []
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      return []
    }
  },

  createPost: async (postData) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      set(state => ({ posts: [data.post, ...state.posts] }))
      return data.post
    } catch (error) {
      throw error
    }
  },

  likePost: async (postId) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.ok
    } catch (error) {
      return false
    }
  },

  purchasePost: async (postId) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/purchase`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      return data
    } catch (error) {
      throw error
    }
  },

  // Subscriptions
  fetchSubscriptions: async () => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/subscriptions/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      set({ subscriptions: data.subscriptions || [] })
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    }
  },

  subscribe: async (creatorId, paymentData) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/payments/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creatorId, ...paymentData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      return data
    } catch (error) {
      throw error
    }
  },

  // Messages
  fetchConversations: async () => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      set({ conversations: data.conversations || [] })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  },

  fetchMessages: async (userId) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      return data.messages || []
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  },

  sendMessage: async (receiverId, content) => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, content })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      return data.message
    } catch (error) {
      throw error
    }
  },

  // Analytics
  fetchAnalytics: async () => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/analytics/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      set({ analytics: data })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  },

  // Earnings
  fetchEarnings: async () => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/analytics/revenue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      set({ earnings: data })
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    }
  },

  // Tip
  sendTip: async (creatorId, amount, message = '') => {
    const token = useAuthStore.getState().token
    try {
      const res = await fetch(`${API_URL}/payments/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creatorId, amount, message })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      return data
    } catch (error) {
      throw error
    }
  }
}))

// Import auth store
import { useAuthStore } from './authStore'
