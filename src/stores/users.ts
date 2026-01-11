import { defineStore } from 'pinia'
import type { User } from '@/types/models'
import type { Role } from '@/utils/constants'
import { api, handleApiError } from '@/lib/api'

const defaultAvatar = new URL('../assets/avatars/avatar-1.svg', import.meta.url).href

const normalizeAvatar = (url?: string) => {
  if (!url) return defaultAvatar
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('example.com')) {
      return defaultAvatar
    }
    return url
  } catch {
    return defaultAvatar
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

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    loading: false,
  }),
  getters: {
    getById: (state) => (id: string) => state.users.find((user) => user.id === id),
  },
  actions: {
    async fetchUsers() {
      // Background Refresh
      if (this.users.length === 0) {
        this.loading = true
      }
      try {
        const { data } = await api.get('/users')
        this.users = (data?.data ?? []).map(mapUser)
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async updateUserProfile(userId: string, payload: Partial<User>) {
      try {
        const { data } = await api.patch('/users/me', payload)
        const body = (data as any).data ?? data
        const updated = mapUser(body)
        const index = this.users.findIndex((user) => user.id === updated.id)
        if (index >= 0) {
          this.users[index] = updated
        } else {
          this.users.push(updated)
        }
        return updated
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async updateUserRole(userId: string, role: Role) {
      try {
        const { data } = await api.patch(`/users/${userId}/role`, { role })
        const body = (data as any).data ?? data
        const updated = mapUser(body)
        const index = this.users.findIndex((user) => user.id === userId)
        if (index >= 0) {
          this.users[index] = updated
        } else {
          this.users.push(updated)
        }
        return updated
      } catch (error) {
        throw handleApiError(error)
      }
    },
    reset() {
      this.users = []
      this.loading = false
    },
  },
})
