import { defineStore } from 'pinia'
import { loadState, saveState, clearState } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import type { LoginPayload, RegisterPayload, User } from '@/types/models'
import { api, handleApiError, setAuthToken } from '@/lib/api'

interface AuthState {
  currentUser: User | null
  token: string | null
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
    currentUser: loadState<User | null>(STORAGE_KEYS.authUser, null),
    token: loadState<string | null>(STORAGE_KEYS.authToken, null),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser && state.token),
  },
  actions: {
    async bootstrap() {
      if (!this.token) return
      setAuthToken(this.token)
      try {
        const { data } = await api.get('/users/me')
        this.currentUser = mapUser(data)
        saveState(STORAGE_KEYS.authUser, this.currentUser)
      } catch (error) {
        console.warn('Failed to bootstrap auth session', error)
        this.clearSession()
      }
    },
    async login(payload: LoginPayload) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login', payload)
        this.setSession(data.token, data.user)
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
        this.setSession(data.token, data.user)
        return this.currentUser
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
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
    setSession(token: string, userPayload: any) {
      this.token = token
      this.currentUser = mapUser(userPayload)
      setAuthToken(token)
      saveState(STORAGE_KEYS.authToken, token)
      saveState(STORAGE_KEYS.authUser, this.currentUser)
    },
    clearSession() {
      this.currentUser = null
      this.token = null
      clearState(STORAGE_KEYS.authUser)
      clearState(STORAGE_KEYS.authToken)
      setAuthToken(null)
    },
  },
})
