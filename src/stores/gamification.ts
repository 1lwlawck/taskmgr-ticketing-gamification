import { defineStore } from 'pinia'
import type {
  GamificationStats,
  LeaderboardEntry,
  Toast,
  ToastPayload,
  XpEvent,
} from '@/types/models'
import { api, handleApiError } from '@/lib/api'
import { generateId } from '@/utils/helpers'
import { PRIORITY_XP_MAP } from '@/utils/constants'
import type { AwardXpPayload } from '@/types/models'

const mapStats = (payload: any): GamificationStats => ({
  xp: payload.xpTotal ?? payload.xp ?? 0,
  level: payload.level ?? 1,
  nextLevelThreshold: payload.nextLevelThreshold ?? 100,
  tickets_closed_count: payload.ticketsClosed ?? payload.tickets_closed_count ?? 0,
  streak: payload.streakDays ?? payload.streak ?? 0,
})

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    userStats: {} as Record<string, GamificationStats>,
    xpEvents: [] as XpEvent[],
    toasts: [] as Toast[],
    loading: false,
    leaderboard: [] as LeaderboardEntry[],
    leaderboardLoading: false,
  }),
  actions: {
    async fetchStats(userId: string) {
      if (!userId) return
      this.loading = true
      try {
        const { data } = await api.get(`/gamification/stats/${userId}`)
        const body = (data as any).data ?? data
        this.userStats[userId] = mapStats(body)
        return this.userStats[userId]
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async fetchEvents(userId?: string) {
      try {
        const { data } = await api.get('/gamification/events', { params: { userId } })
        this.xpEvents = (data as any)?.data ?? []
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async fetchLeaderboard(limit = 50) {
      this.leaderboardLoading = true
      try {
        const { data } = await api.get('/gamification/leaderboard', { params: { limit } })
        const rows = Array.isArray((data as any)?.data) ? (data as any).data : data
        this.leaderboard = (rows ?? []) as LeaderboardEntry[]
        return this.leaderboard
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.leaderboardLoading = false
      }
    },
    ensureUserStats(userId: string) {
      if (!userId) return
      if (!this.userStats[userId]) {
        this.userStats[userId] = {
          xp: 0,
          level: 1,
          nextLevelThreshold: 100,
          tickets_closed_count: 0,
          streak: 0,
        }
      }
    },
    awardXp({ userId, ticketId, priority = 'medium', note = 'Completed ticket' }: AwardXpPayload) {
      if (!userId) return
      this.ensureUserStats(userId)
      const stats = this.userStats[userId]
      const xpToAward = PRIORITY_XP_MAP[priority] ?? PRIORITY_XP_MAP.medium
      stats.xp += xpToAward
      stats.tickets_closed_count += 1
      stats.level = Math.floor(stats.xp / 100) + 1
      stats.nextLevelThreshold = stats.level * 100
      stats.streak = (stats.streak ?? 0) + 1
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
    },
    pushToast(payload: ToastPayload) {
      const toast: Toast = { id: generateId('toast'), ...payload }
      this.toasts.push(toast)
      setTimeout(() => this.dismissToast(toast.id), 4000)
    },
    dismissToast(id: string) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    reset() {
      this.userStats = {}
      this.xpEvents = []
      this.toasts = []
      this.loading = false
      this.leaderboard = []
      this.leaderboardLoading = false
    },
  },
})
