import { defineStore } from 'pinia'
import { loadState, saveState, clearState } from '@/utils/storage'
import { STORAGE_KEYS, ROLES } from '@/utils/constants'
import { useAuditStore } from './audit'

const avatar1 = new URL('../assets/avatars/avatar-1.svg', import.meta.url).href
const avatar2 = new URL('../assets/avatars/avatar-2.svg', import.meta.url).href
const avatar3 = new URL('../assets/avatars/avatar-3.svg', import.meta.url).href

const defaultUsers = [
  {
    id: 'user-admin',
    name: 'Avery Admin',
    username: 'avery',
    password: 'password',
    role: 'admin',
    avatar: avatar1,
    badges: ['Launch Pioneer'],
    bio: 'Oversees delivery and quality.',
  },
  {
    id: 'user-dev',
    name: 'Devon Dev',
    username: 'devon',
    password: 'password',
    role: 'developer',
    avatar: avatar2,
    badges: ['Bug Smasher'],
    bio: 'Full-stack engineer specializing in tickets.',
  },
  {
    id: 'user-pm',
    name: 'Parker PM',
    username: 'parker',
    password: 'password',
    role: 'project_manager',
    avatar: avatar3,
    badges: ['Sprint Strategist'],
    bio: 'Keeps everyone aligned and shipping.',
  },
]

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: loadState(STORAGE_KEYS.users, defaultUsers),
  }),
  getters: {
    getById: (state) => (id) => state.users.find((user) => user.id === id),
  },
  actions: {
    // TODO: swap mocked persistence for CRUD user service once backend exists.
    addUser(user) {
      this.users.push(user)
      this.persist()
    },
    updateUserRole(userId, role) {
      if (!ROLES.includes(role)) return
      const user = this.users.find((u) => u.id === userId)
      if (user) {
        user.role = role
        this.persist()
        useAuditStore().log('role_changed', `${user.name} assigned to ${role}`, userId)
      }
    },
    updateUserProfile(userId, payload) {
      const user = this.users.find((u) => u.id === userId)
      if (user) {
        Object.assign(user, payload)
        this.persist()
        useAuditStore().log('profile_updated', `${user.name} updated profile`, userId)
      }
    },
    persist() {
      saveState(STORAGE_KEYS.users, this.users)
    },
    resetUsers() {
      this.users = [...defaultUsers]
      this.persist()
    },
  },
})
