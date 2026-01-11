import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type { ActivityItem, ActivityFilter } from '@/types/models'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<ActivityItem[]>([])
  const nextCursor = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivity(filter: ActivityFilter = {}, append = false) {
    if (activities.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      if (filter.entityType) params.entityType = filter.entityType
      if (filter.limit) params.limit = filter.limit
      if (filter.cursor) params.cursor = filter.cursor

      const { data } = await api.get<{ data: ActivityItem[]; meta?: { nextCursor?: string } }>('/activity/', { params })
      
      if (append) {
        activities.value = [...activities.value, ...(data.data || [])]
      } else {
        activities.value = data.data || []
      }
      nextCursor.value = data.meta?.nextCursor || null
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserActivity(userId: string, filter: Omit<ActivityFilter, 'entityType'> = {}, append = false) {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, string | number> = {}
      if (filter.limit) params.limit = filter.limit
      if (filter.cursor) params.cursor = filter.cursor

      const { data } = await api.get<{ data: ActivityItem[]; meta?: { nextCursor?: string } }>(`/activity/user/${userId}`, { params })
      
      if (append) {
        activities.value = [...activities.value, ...(data.data || [])]
      } else {
        activities.value = data.data || []
      }
      nextCursor.value = data.meta?.nextCursor || null
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function loadMore(filter: ActivityFilter = {}) {
    if (!nextCursor.value || loading.value) return
    await fetchActivity({ ...filter, cursor: nextCursor.value }, true)
  }

  async function loadMoreUserActivity(userId: string, filter: Omit<ActivityFilter, 'entityType'> = {}) {
    if (!nextCursor.value || loading.value) return
    await fetchUserActivity(userId, { ...filter, cursor: nextCursor.value }, true)
  }

  function reset() {
    activities.value = []
    nextCursor.value = null
    error.value = null
  }

  return {
    activities,
    nextCursor,
    loading,
    error,
    fetchActivity,
    fetchUserActivity,
    loadMore,
    loadMoreUserActivity,
    reset,
  }
})
