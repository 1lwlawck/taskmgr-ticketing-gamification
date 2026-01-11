import { defineStore } from 'pinia'
import type { Epic } from '@/types/models'
import { api, handleApiError } from '@/lib/api'

export const useEpicsStore = defineStore('epics', {
  state: () => ({
    items: [] as Epic[],
    loading: false,
  }),
  getters: {
    byProject: (state) => (projectId: string) => {
      if (!Array.isArray(state.items)) return []
      return state.items.filter((e) => e.projectId === projectId)
    },
  },
  actions: {
    async fetchByProject(projectId: string) {
      if (!projectId) return []
      // Background Refresh: Only show loading if we don't have epics for this project
      const existing = this.byProject(projectId)
      if (existing.length === 0) {
        this.loading = true
      }
      try {
        const { data } = await api.get(`/projects/${projectId}/epics`)
        const payload = (data as any)?.data ?? data ?? []
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as any)?.data)
            ? (payload as any).data
            : []
        if (!Array.isArray(this.items)) this.items = []
        // replace epics for this project, keep others
        this.items = this.items.filter((e) => e.projectId !== projectId).concat(list as Epic[])
        return this.byProject(projectId)
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async fetchEpic(id: string) {
      if (!id) return null
      // Background Refresh
      const existing = this.items.find((e) => e.id === id)
      if (!existing) this.loading = true
      try {
        const { data } = await api.get(`/epics/${id}`)
        const epic = (data as any)?.data ?? data
        if (epic) this.upsert(epic as Epic)
        return epic as Epic
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
      }
    },
    async createEpic(projectId: string, payload: { title: string; description?: string; status?: string; startDate?: string; dueDate?: string; ownerId?: string }) {
      const body = { ...payload }
      try {
        const { data } = await api.post(`/projects/${projectId}/epics`, body)
        const epic = (data as any)?.data ?? data
        if (epic) this.upsert(epic as Epic)
        return epic as Epic
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async updateEpic(id: string, payload: Partial<Epic>) {
      try {
        const { data } = await api.patch(`/epics/${id}`, payload)
        const epic = (data as any)?.data ?? data
        if (epic) this.upsert(epic as Epic)
        return epic as Epic
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async deleteEpic(id: string) {
      try {
        await api.delete(`/epics/${id}`)
        if (Array.isArray(this.items)) {
          this.items = this.items.filter((e) => e.id !== id)
        }
      } catch (error) {
        throw handleApiError(error)
      }
    },
    upsert(epic: Epic) {
      if (!Array.isArray(this.items)) this.items = []
      const idx = this.items.findIndex((e) => e.id === epic.id)
      if (idx >= 0) this.items[idx] = epic
      else this.items.push(epic)
    },
  },
})
