import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await apiFetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return false
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const data = await apiFetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          })

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      updateProfile: async (updates) => {
        const { token } = get()
        set({ isLoading: true })
        try {
          const data = await apiFetch('/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          })

          set({ user: data.user, isLoading: false })
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return false
        }
      },

      fetchUser: async () => {
        const { token } = get()
        if (!token) return
        try {
          const data = await apiFetch('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          set({ user: data.user })
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
      },

      // GDPR right of access — download the user's full data export as a
      // JSON file. Bypasses apiFetch because the response is a binary blob,
      // not the usual JSON envelope.
      exportData: async () => {
        const { token } = get()
        if (!token) throw new Error('Not authenticated')

        const RAW = import.meta.env.VITE_API_URL?.trim()
        const base = RAW && RAW.length > 0 ? RAW.replace(/\/$/, '') : '/api'

        const res = await fetch(`${base}/auth/export`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) {
          let msg = `Export failed (${res.status})`
          try { msg = (await res.json()).message || msg } catch {}
          throw new Error(msg)
        }

        const disposition = res.headers.get('content-disposition') || ''
        const match = disposition.match(/filename="([^"]+)"/)
        const filename = match ? match[1] : `fanvora-data-${new Date().toISOString().slice(0,10)}.json`

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        return filename
      },

      // GDPR right to erasure — irreversibly delete the account. Requires
      // password + the literal string "DELETE" to defeat accidental clicks.
      deleteAccount: async (password) => {
        const { token } = get()
        try {
          await apiFetch('/auth/account', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password, confirm: 'DELETE' })
          })
          // Wipe local session.
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          })
          return true
        } catch (error) {
          set({ error: error.message })
          return false
        }
      }
    }),
    {
      name: 'fanvora-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
