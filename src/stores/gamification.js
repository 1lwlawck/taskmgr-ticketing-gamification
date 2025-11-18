import { defineStore } from 'pinia'
import { PRIORITY_XP_MAP, STORAGE_KEYS } from '@/utils/constants'
import { loadState, saveState } from '@/utils/storage'
import { generateId } from '@/utils/helpers'

const defaultGamification = {
  userStats: {
    'user-admin': { xp: 120, level: 2, nextLevelThreshold: 200, tickets_closed_count: 8 },
    'user-dev': { xp: 80, level: 1, nextLevelThreshold: 100, tickets_closed_count: 4 },
    'user-pm': { xp: 60, level: 1, nextLevelThreshold: 100, tickets_closed_count: 3 },
  },
  xpEvents: [],
}

const persisted = loadState(STORAGE_KEYS.gamification, defaultGamification)

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    userStats: persisted?.userStats || {},
    xpEvents: persisted?.xpEvents || [],
    toasts: [],
  }),
  actions: {
    ensureUserStats(userId) {
      if (!this.userStats[userId]) {
        this.userStats[userId] = {
          xp: 0,
          level: 1,
          nextLevelThreshold: 100,
          tickets_closed_count: 0,
        }
        this.persist()
      }
    },
    /**
     * XP awarding is idempotent per ticket status change.
     * Only award XP when transitioning into "done" to avoid duplicate rewards
     * if the UI fires multiple updates for the same ticket.
     */
    awardXp({ userId, ticketId, priority = 'medium', note = 'Completed ticket' }) {
      this.ensureUserStats(userId)
      const xpToAward = PRIORITY_XP_MAP[priority] ?? PRIORITY_XP_MAP.medium
      const stats = this.userStats[userId]
      stats.xp += xpToAward
      stats.tickets_closed_count += 1
      stats.level = Math.floor(stats.xp / 100) + 1
      stats.nextLevelThreshold = stats.level * 100
      this.xpEvents.unshift({
        id: generateId('xp'),
        userId,
        ticketId,
        priority,
        xp: xpToAward,
        note,
        timestamp: new Date().toISOString(),
      })
      this.pushToast({
        title: 'XP Awarded',
        message: `You earned +${xpToAward} XP for finishing a ${priority} ticket`,
      })
      this.persist()
    },
    pushToast(payload) {
      const toast = { id: generateId('toast'), ...payload }
      this.toasts.push(toast)
      setTimeout(() => this.dismissToast(toast.id), 4000)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    persist() {
      saveState(STORAGE_KEYS.gamification, {
        userStats: this.userStats,
        xpEvents: this.xpEvents,
      })
    },
    reset() {
      this.userStats = {}
      this.xpEvents = []
      this.persist()
    },
  },
})
