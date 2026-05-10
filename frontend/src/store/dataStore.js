import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { apiFetch } from '../lib/api'

const authHeaders = () => {
  const token = useAuthStore.getState().token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

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
      const data = await apiFetch(`/creators${query ? `?${query}` : ''}`)
      set({ creators: data.creators || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchFeaturedCreators: async () => {
    try {
      const data = await apiFetch('/creators/featured')
      set({ featuredCreators: data.creators || [] })
    } catch (error) {
      console.error('Failed to fetch featured creators:', error)
    }
  },

  fetchCreator: async (username) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch(`/creators/${username}`)
      set({ isLoading: false })
      return data.creator
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  // Posts
  fetchFeed: async () => {
    set({ isLoading: true })
    try {
      const data = await apiFetch('/posts/feed', { headers: authHeaders() })
      set({ posts: data.posts || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchCreatorPosts: async (creatorId) => {
    try {
      const data = await apiFetch(`/posts/creator/${creatorId}`, {
        headers: authHeaders()
      })
      return data.posts || []
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      return []
    }
  },

  createPost: async (postData) => {
    const data = await apiFetch('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(postData)
    })
    set(state => ({ posts: [data.post, ...state.posts] }))
    return data.post
  },

  likePost: async (postId) => {
    try {
      await apiFetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: authHeaders()
      })
      return true
    } catch (error) {
      return false
    }
  },

  // Initializes a real PayStack PPV transaction and returns the
  // authorization URL. Caller is responsible for redirecting the user.
  purchasePost: async (postId) => {
    return apiFetch(`/posts/${postId}/purchase`, {
      method: 'POST',
      headers: authHeaders()
    })
  },

  // Subscriptions
  fetchSubscriptions: async () => {
    try {
      const data = await apiFetch('/subscriptions/my', { headers: authHeaders() })
      set({ subscriptions: data.subscriptions || [] })
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    }
  },

  // Initializes a real PayStack subscription transaction. Returns
  // { authorizationUrl, reference, amount, currency }.
  subscribe: async (creatorId) => {
    return apiFetch('/payments/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ creatorId })
    })
  },

  // Messages
  fetchConversations: async () => {
    try {
      const data = await apiFetch('/messages/conversations', { headers: authHeaders() })
      set({ conversations: data.conversations || [] })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  },

  fetchMessages: async (userId) => {
    try {
      const data = await apiFetch(`/messages/${userId}`, { headers: authHeaders() })
      return data.messages || []
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  },

  sendMessage: async (receiverId, content) => {
    const data = await apiFetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ receiverId, content })
    })
    return data.message
  },

  // Analytics
  fetchAnalytics: async () => {
    try {
      const data = await apiFetch('/analytics/overview', { headers: authHeaders() })
      set({ analytics: data })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  },

  // Earnings
  fetchEarnings: async () => {
    try {
      const data = await apiFetch('/analytics/revenue', { headers: authHeaders() })
      set({ earnings: data })
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    }
  },

  // Tip — initializes a real PayStack transaction. Returns
  // { authorizationUrl, reference, amount, currency }.
  sendTip: async (creatorId, amount, message = '') => {
    return apiFetch('/payments/tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ creatorId, amount, message })
    })
  },

  // Verifies a payment after PayStack redirects the user back to /payment/success.
  verifyPayment: async (reference) => {
    return apiFetch('/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ reference })
    })
  },

  // Withdrawals
  fetchBanks: async () => {
    const data = await apiFetch('/payments/banks', { headers: authHeaders() })
    return data.banks || []
  },

  resolveAccount: async (accountNumber, bankCode) => {
    return apiFetch('/payments/resolve-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ accountNumber, bankCode })
    })
  },

  withdraw: async ({ amount, accountNumber, bankCode }) => {
    return apiFetch('/payments/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ amount, accountNumber, bankCode })
    })
  },

  finalizeWithdrawal: async ({ transferCode, otp }) => {
    return apiFetch('/payments/withdraw/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ transferCode, otp })
    })
  },

  // File a moderation report against another user. The dispute lands in the
  // admin queue and the reporter receives an automatic acknowledgment DM
  // from Fanvora Support in their messaging inbox.
  createReport: async ({ againstUserId, type, summary, transactionRef = null }) => {
    return apiFetch('/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ againstUserId, type, summary, transactionRef })
    })
  },

  // Public profile of the Fanvora Support account. Used by the Messages tab
  // to render a "New conversation → Fanvora Support" entry point without
  // hardcoding the seeded UUID.
  fetchSupportInfo: async () => {
    return apiFetch('/auth/support-info')
  },

  // Ambassador self-service: pulls their referral code, commission rate,
  // referred-creator list, and recent payouts. Returns null if the caller
  // isn't (or no longer is) an ambassador.
  fetchMyReferrals: async () => {
    try {
      return await apiFetch('/auth/my-referrals', { headers: authHeaders() })
    } catch (err) {
      // 403 is expected for non-ambassadors; treat as null instead of throwing.
      if (/not an ambassador/i.test(err.message)) return null
      throw err
    }
  }
}))
