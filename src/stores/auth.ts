import { defineStore } from 'pinia'
import { loadState, saveState, clearState, clearAuthStorage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/models'
import { api, handleApiError, setAuthToken } from '@/lib/api'
import axios from 'axios'

interface AuthState {
  currentUser: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
}

const fallbackAvatar = new URL('../assets/avatars/avatar-1.svg', import.meta.url).href

const normalizeAvatar = (url?: string) => {
  if (!url) return fallbackAvatar
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('example.com')) {
      return fallbackAvatar
    }
    return url
  } catch {
    return fallbackAvatar
  }
}

const mapUser = (payload: any): User => ({
  id: payload.id,
  name: payload.name,
  username: payload.username,
  role: payload.role,
  avatar: normalizeAvatar(payload.avatarUrl),
  badges: payload.badges ?? [],
  bio: payload.bio ?? '',
})

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // Restore previous session from localStorage; bootstrap() will verify token/refresh and clear if invalid
    currentUser: loadState<User | null>(STORAGE_KEYS.authUser, null),
    token: loadState<string | null>(STORAGE_KEYS.authToken, null),
    refreshToken: loadState<string | null>(STORAGE_KEYS.authRefresh, null),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser && state.token),
  },
  actions: {
    unwrap<T>(data: any, fallback: T): T {
      return (data as any)?.data ?? data ?? fallback
    },
    async bootstrap() {
      if (!this.token) return
      setAuthToken(this.token)
      try {
        const { data } = await api.get('/users/me')
        const body = this.unwrap(data, null)
        if (!body) throw new Error('invalid user payload')
        this.currentUser = mapUser(body)
        saveState(STORAGE_KEYS.authUser, this.currentUser)
      } catch (error) {
        // try refresh once
        if (this.refreshToken) {
          const refreshed = await this.refresh()
          if (refreshed) return
        }
        console.warn('Failed to bootstrap auth session', error)
        this.clearSession()
      }
    },
    async login(payload: LoginPayload) {
      this.loading = true
      try {
        const { data } = await api.post<AuthResponse>('/auth/login', payload)
        const body = this.unwrap(data, null)
        this.setSession(body.token, body.refreshToken, body.user)
        return this.currentUser
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async register(payload: RegisterPayload) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/register', payload)
        const body = this.unwrap(data, null)
        // Registration now returns RegisterResponse (needsVerification, userId)
        // Don't set session - user needs to verify email first
        return body as { message: string; needsVerification: boolean; userId: string }
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async verifyEmail(token: string) {
      try {
        const { data } = await api.post('/auth/verify-email', { token })
        return this.unwrap(data, null)
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async resendVerification(userId: string) {
      try {
        const { data } = await api.post('/auth/resend-verification', { userId })
        return this.unwrap(data, null)
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async updateUnverifiedEmail(userId: string, password: string, newEmail: string) {
      try {
        await api.post('/auth/update-unverified-email', { userId, password, newEmail })
        return true
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async refresh() {
      if (!this.refreshToken) return false
      try {
        const { data } = await api.post('/auth/refresh', { refreshToken: this.refreshToken })
        const body = this.unwrap(data, null)
        this.setSession(body.token, body.refreshToken, body.user)
        return true
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          this.clearSession()
        }
        return false
      }
    },
    logout() {
      this.clearSession()
    },
    async changePassword(oldPassword: string, newPassword: string) {
      try {
        await api.post('/auth/change-password', { oldPassword, newPassword })
      } catch (error) {
        throw handleApiError(error)
      }
    },
    setSession(token: string, refreshToken: string, userPayload: any) {
      this.token = token
      this.refreshToken = refreshToken
      this.currentUser = mapUser(userPayload)
      setAuthToken(token)
      saveState(STORAGE_KEYS.authToken, token)
      saveState(STORAGE_KEYS.authRefresh, refreshToken)
      saveState(STORAGE_KEYS.authUser, this.currentUser)
    },
    clearSession() {
      this.currentUser = null
      this.token = null
      this.refreshToken = null
      clearState(STORAGE_KEYS.authUser)
      clearState(STORAGE_KEYS.authToken)
      clearState(STORAGE_KEYS.authRefresh)
      clearAuthStorage()
      setAuthToken(null)
    },
  },
})
