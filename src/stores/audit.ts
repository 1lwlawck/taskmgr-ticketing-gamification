import { defineStore } from 'pinia'
import type { AuditEntry } from '@/types/models'
import { api, handleApiError } from '@/lib/api'

const mapEntry = (payload: any): AuditEntry => ({
  id: payload.id,
  action: payload.action,
  description: payload.description,
  userId: payload.actorId ?? payload.userId ?? null,
  timestamp: payload.createdAt ?? payload.timestamp,
})

export const useAuditStore = defineStore('audit', {
  state: () => ({
    entries: [] as AuditEntry[],
    loading: false,
  }),
  actions: {
    async fetchEntries(limit = 50) {
      this.loading = true
      try {
        const { data } = await api.get('/audit', { params: { limit } })
        this.entries = (data?.data ?? []).map(mapEntry)
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.entries = []
      this.loading = false
    },
  },
})
