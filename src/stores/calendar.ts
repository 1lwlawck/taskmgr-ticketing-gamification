import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type { CalendarEvent, CalendarFilter } from '@/types/models'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvents(filter: CalendarFilter = {}) {
    // Background Refresh: Only show loading if we have no events
    if (events.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const params: Record<string, string> = {}
      if (filter.start) params.start = filter.start
      if (filter.end) params.end = filter.end
      if (filter.projectId) params.projectId = filter.projectId
      if (filter.type) params.type = filter.type

      const { data } = await api.get<{ data: CalendarEvent[] }>('/calendar/events', { params })
      events.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  function getEventsForDate(date: string) {
    return events.value.filter((e) => e.date.startsWith(date))
  }

  function getEventsByType(type: string) {
    return events.value.filter((e) => e.type === type)
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventsForDate,
    getEventsByType,
  }
})
