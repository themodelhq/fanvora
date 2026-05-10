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
