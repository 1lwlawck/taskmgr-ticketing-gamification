import { defineStore } from 'pinia'
import { loadState, saveState, clearState } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { generateId } from '@/utils/helpers'
import { useUsersStore } from './users'
import { useGamificationStore } from './gamification'
import { useAuditStore } from './audit'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: loadState(STORAGE_KEYS.auth, null),
  }),
  actions: {
    /**
     * TODO: Replace these mocked authentication flows with backend API calls.
     * Ensure we handle refresh tokens, password policies, and error responses from the server.
     */
    login({ username, password }) {
      const usersStore = useUsersStore()
      const match = usersStore.users.find((user) => user.username === username && user.password === password)
      if (!match) {
        throw new Error('Invalid credentials')
      }
      this.currentUser = match
      saveState(STORAGE_KEYS.auth, match)
      const gamification = useGamificationStore()
      gamification.ensureUserStats(match.id)
      return match
    },
    register({ name, username, password }) {
      const usersStore = useUsersStore()
      if (usersStore.users.some((user) => user.username === username)) {
        throw new Error('Username already exists')
      }
      const isFirstUser = usersStore.users.length === 0
      const user = {
        id: generateId('user'),
        name,
        username,
        password,
        role: isFirstUser ? 'admin' : 'developer',
        avatar: new URL('../assets/avatars/avatar-1.svg', import.meta.url).href,
        badges: ['Initiate'],
      }
      usersStore.addUser(user)
      this.currentUser = user
      saveState(STORAGE_KEYS.auth, user)
      const gamification = useGamificationStore()
      gamification.ensureUserStats(user.id)
      const audit = useAuditStore()
      audit.log('user_registered', `${user.name} joined the workspace`, user.id)
      return user
    },
    logout() {
      clearState(STORAGE_KEYS.auth)
      this.currentUser = null
    },
    hydrateFromUsers(userId) {
      const usersStore = useUsersStore()
      const refreshed = usersStore.users.find((user) => user.id === userId)
      if (refreshed) {
        this.currentUser = refreshed
        saveState(STORAGE_KEYS.auth, refreshed)
      }
    },
  },
})
