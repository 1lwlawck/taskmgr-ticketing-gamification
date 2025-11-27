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
    nextCursor: null as string | null,
  }),
  actions: {
    async fetchEntries(options?: { limit?: number; cursor?: string; append?: boolean }) {
      const { limit = 50, cursor, append = false } = options || {}
      if (append && !this.nextCursor) return
      this.loading = !append
      try {
        const params: Record<string, any> = { limit }
        if (append && this.nextCursor) {
          params.cursor = this.nextCursor
        } else if (cursor) {
          params.cursor = cursor
        }
        const { data } = await api.get('/audit', { params })
        const list = ((data as any)?.data ?? []) as any[]
        const mapped = list.map(mapEntry)
        if (append) {
          const existing = new Set(this.entries.map((e) => e.id))
          mapped.forEach((e) => {
            if (!existing.has(e.id)) this.entries.push(e)
          })
        } else {
          this.entries = mapped
        }
        this.nextCursor = (data as any)?.nextCursor ?? null
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.entries = []
      this.loading = false
      this.nextCursor = null
    },
  },
})
