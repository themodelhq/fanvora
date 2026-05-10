import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '../lib/api'

// Admin auth lives in its own store so it doesn't collide with the regular
// fan/creator session. An admin can log in even if they're already signed in
// as a fan/creator in another tab; the two sessions stay independent.
export const useAdminStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Data slices
      stats: null,
      users: [],
      ambassadors: [],
      referrals: [],
      disputes: [],
      log: [],
      supportInbox: [],
      unreadSupportCount: 0,

      headers: () => {
        const t = get().token
        return t ? { 'Authorization': `Bearer ${t}` } : {}
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await apiFetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          if (data.user?.role !== 'admin' && data.user?.role !== 'owner') {
            throw new Error('This account is not authorised for the admin section.')
          }
          set({
            admin: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        } catch (err) {
          set({ error: err.message, isLoading: false })
          return false
        }
      },

      logout: () => set({
        admin: null, token: null, isAuthenticated: false, error: null,
        stats: null, users: [], ambassadors: [], referrals: [], disputes: [], log: [],
        supportInbox: [], unreadSupportCount: 0
      }),

      // ── Loaders ────────────────────────────────────────────────────────

      fetchStats: async () => {
        const data = await apiFetch('/admin/stats', { headers: get().headers() })
        set({ stats: data })
      },

      fetchUsers: async (params = {}) => {
        const q = new URLSearchParams(params).toString()
        const data = await apiFetch(`/admin/users${q ? `?${q}` : ''}`, { headers: get().headers() })
        set({ users: data.users || [] })
      },

      fetchAmbassadors: async () => {
        const data = await apiFetch('/admin/ambassadors', { headers: get().headers() })
        set({ ambassadors: data.ambassadors || [] })
      },

      fetchReferrals: async () => {
        const data = await apiFetch('/admin/referrals', { headers: get().headers() })
        set({ referrals: data.payouts || [] })
      },

      fetchDisputes: async (params = {}) => {
        const q = new URLSearchParams(params).toString()
        const data = await apiFetch(`/admin/disputes${q ? `?${q}` : ''}`, { headers: get().headers() })
        set({ disputes: data.disputes || [] })
      },

      fetchLog: async () => {
        const data = await apiFetch('/admin/log', { headers: get().headers() })
        set({ log: data.entries || [] })
      },

      // ── Mutations ──────────────────────────────────────────────────────

      suspendUser: async (userId, suspended, reason = '') => {
        await apiFetch(`/admin/users/${userId}/suspend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ suspended, reason })
        })
        await get().fetchUsers()
      },

      setRole: async (userId, role) => {
        await apiFetch(`/admin/users/${userId}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ role })
        })
        await get().fetchUsers()
      },

      setAmbassador: async (userId, isAmbassador, commissionRate) => {
        await apiFetch(`/admin/ambassadors/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ isAmbassador, commissionRate })
        })
        await Promise.all([get().fetchAmbassadors(), get().fetchUsers()])
      },

      resolveDispute: async (id, status, resolution) => {
        await apiFetch(`/admin/disputes/${id}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ status, resolution })
        })
        await get().fetchDisputes()
      },

      // Send a follow-up message from Fanvora Support to the dispute reporter.
      // Doesn't change the dispute status — it's purely a back-and-forth
      // channel inside the existing case.
      replyAsSupport: async (disputeId, message) => {
        await apiFetch(`/admin/disputes/${disputeId}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ message })
        })
      },

      // ── Support inbox + threads ─────────────────────────────────────────

      // List of users who've messaged Fanvora Support, newest activity first.
      // The server-side handler also marks the inbox as "seen" for this
      // admin, so we reset the unread badge optimistically.
      fetchSupportInbox: async () => {
        const data = await apiFetch('/admin/support-inbox', { headers: get().headers() })
        set({ supportInbox: data.threads || [], unreadSupportCount: 0 })
      },

      // Lightweight 30s-polling endpoint — just returns a number. Silent on
      // failure so transient network blips don't surface in the admin UI.
      fetchUnreadSupportCount: async () => {
        try {
          const data = await apiFetch('/admin/support-inbox/unread-count', { headers: get().headers() })
          set({ unreadSupportCount: data.count || 0 })
        } catch {
          // Polling errors must not cascade into the UI.
        }
      },

      // Full Support↔user thread, with each message tagged inbound/outbound.
      fetchSupportThread: async (userId) => {
        return apiFetch(`/admin/support-thread/${userId}`, { headers: get().headers() })
      },

      // Direct reply to a user (no dispute id required) — used by the support
      // inbox panel and as the underlying call inside dispute cards.
      replyToUserAsSupport: async (userId, message) => {
        await apiFetch(`/admin/support-thread/${userId}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...get().headers() },
          body: JSON.stringify({ message })
        })
      }
    }),
    {
      name: 'fanvora-admin',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
