import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type {
  ReportSummary,
  StatusBreakdown,
  PriorityBreakdown,
  AssigneeBreakdown,
  TeamPerformance,
  TicketTrend,
} from '@/types/models'

export const useReportsStore = defineStore('reports', () => {
  const summary = ref<ReportSummary | null>(null)
  const statusBreakdown = ref<StatusBreakdown[]>([])
  const priorityBreakdown = ref<PriorityBreakdown[]>([])
  const assigneeBreakdown = ref<AssigneeBreakdown[]>([])
  const teamPerformance = ref<TeamPerformance[]>([])
  const ticketTrend = ref<TicketTrend[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSummary() {
    if (!summary.value) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: ReportSummary }>('/reports/summary')
      summary.value = data.data
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStatusBreakdown() {
    try {
      const { data } = await api.get<{ data: StatusBreakdown[] }>('/reports/tickets/by-status')
      statusBreakdown.value = data.data || []
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchPriorityBreakdown() {
    try {
      const { data } = await api.get<{ data: PriorityBreakdown[] }>('/reports/tickets/by-priority')
      priorityBreakdown.value = data.data || []
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchAssigneeBreakdown(limit = 20) {
    try {
      const { data } = await api.get<{ data: AssigneeBreakdown[] }>('/reports/tickets/by-assignee', {
        params: { limit },
      })
      assigneeBreakdown.value = data.data || []
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchTeamPerformance(limit = 20) {
    try {
      const { data } = await api.get<{ data: TeamPerformance[] }>('/reports/team-performance', {
        params: { limit },
      })
      teamPerformance.value = data.data || []
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchTicketTrend(days = 30) {
    try {
      const { data } = await api.get<{ data: TicketTrend[] }>('/reports/tickets/trend', {
        params: { days },
      })
      ticketTrend.value = data.data || []
    } catch (e) {
      handleApiError(e)
    }
  }

  async function fetchAll() {
    if (!summary.value) {
      loading.value = true
    }
    error.value = null
    try {
      await Promise.all([
        fetchSummary(),
        fetchStatusBreakdown(),
        fetchPriorityBreakdown(),
        fetchAssigneeBreakdown(),
        fetchTeamPerformance(),
        fetchTicketTrend(),
      ])
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    statusBreakdown,
    priorityBreakdown,
    assigneeBreakdown,
    teamPerformance,
    ticketTrend,
    loading,
    error,
    fetchSummary,
    fetchStatusBreakdown,
    fetchPriorityBreakdown,
    fetchAssigneeBreakdown,
    fetchTeamPerformance,
    fetchTicketTrend,
    fetchAll,
  }
})
