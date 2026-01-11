import { defineStore } from 'pinia'
import { TICKET_STATUSES, type TicketStatus, type TicketPriority, type TicketType } from '@/utils/constants'
import type { CreateTicketPayload, Ticket, TicketCommentPayload } from '@/types/models'
import { api, handleApiError } from '@/lib/api'
import { useProjectsStore } from './projects'
import { useGamificationStore } from './gamification'
import { useAuthStore } from './auth'

interface RawTicketPayload {
  id: string
  projectId: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  reporterId?: string
  epicId?: string
  assigneeId?: string
  assigneeName?: string
  startDate?: string
  dueDate?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  history?: Array<{
    id: string
    text: string
    timestamp: string
    actorId?: string
  }>
  comments?: Array<{
    id: string
    author?: string
    authorId?: string
    text: string
    timestamp: string
  }>
}

const normalizeTicket = (payload: RawTicketPayload): Ticket => ({
  id: payload.id,
  projectId: payload.projectId,
  title: payload.title,
  description: payload.description,
  status: payload.status,
  priority: payload.priority,
  type: payload.type,
  reporterId: payload.reporterId ?? undefined,
  epicId: payload.epicId ?? undefined,
  assigneeId: payload.assigneeId ?? undefined,
  assigneeName: payload.assigneeName ?? undefined,
  startDate: payload.startDate ?? undefined,
  dueDate: payload.dueDate ?? undefined,
  createdAt: payload.createdAt ?? payload.created_at ?? undefined,
  updatedAt: payload.updatedAt ?? payload.updated_at ?? undefined,
  history: (payload.history ?? []).map((entry: any) => ({
    id: entry.id,
    text: entry.text,
    timestamp: entry.timestamp,
    actorId: entry.actorId ?? undefined,
  })),
  comments: (payload.comments ?? []).map((comment: any) => ({
    id: comment.id,
    author: comment.author ?? comment.authorId ?? 'Unknown',
    authorId: comment.authorId,
    text: comment.text,
    timestamp: comment.timestamp,
  })),
})

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as Ticket[],
    loading: false,
    loadingMore: false,
    nextCursor: null as string | null,
    currentQuery: {
      projectId: '',
      assigneeId: '',
      status: '',
      epicId: '',
      q: '',
    },
  }),
  getters: {
    getById: (state) => (id: string) => state.tickets.find((ticket) => ticket.id === id),
    byProject: (state) => (projectId: string) => state.tickets.filter((t) => t.projectId === projectId),
  },
  actions: {
    upsertList(list: Ticket[]) {
      list.forEach((ticket) => {
        const idx = this.tickets.findIndex((t) => t.id === ticket.id)
        if (idx >= 0) this.tickets[idx] = ticket
        else this.tickets.push(ticket)
      })
    },
    async refreshGamification() {
      const auth = useAuthStore()
      const gamification = useGamificationStore()
      if (!auth.currentUser) return
      await Promise.allSettled([
        gamification.fetchStats(auth.currentUser.id),
        gamification.fetchEvents({ userId: auth.currentUser.id }),
        gamification.fetchLeaderboard({ limit: 10 }),
      ])
    },
    async fetchTickets(force = false) {
      return this.fetchTicketsWithFilters({ force })
    },
    async fetchTicketsWithFilters(options?: {
      force?: boolean
      append?: boolean
      projectId?: string
      assigneeId?: string
      status?: string
      epicId?: string
      q?: string
      cursor?: string | null
      limit?: number
    }) {
      const { force = false, append = false, cursor = null, limit = 50 } = options || {}
      const isReset = !append
      if (!force && !isReset && !this.nextCursor && !cursor) return
      if (isReset) {
        // Only reset nextCursor if we are starting a fresh search (no explicit cursor)
        if (cursor === undefined) this.nextCursor = null
        // We generally replace tickets on reset, unless using append
        // Background refresh: Don't clear if we have data (unless needed)
        if (!append && this.tickets.length === 0) this.tickets = []
      }
      const isFirstLoad = isReset && !append
      // Background Refresh: Only show loading (skeleton) if we have no data
      if (this.tickets.length === 0) {
        this.loading = isFirstLoad
      }
      this.loadingMore = append

      const query = {
        projectId: options?.projectId ?? this.currentQuery.projectId,
        assigneeId: options?.assigneeId ?? this.currentQuery.assigneeId,
        status: options?.status ?? this.currentQuery.status,
        epicId: options?.epicId ?? this.currentQuery.epicId,
        q: options?.q ?? this.currentQuery.q,
      }
      this.currentQuery = query

      const params: Record<string, any> = { limit }
      if (query.projectId) params.projectId = query.projectId
      if (query.assigneeId) params.assigneeId = query.assigneeId
      if (query.status) params.status = query.status
      if (query.epicId) params.epicId = query.epicId
      if (query.q) params.q = query.q
      if (cursor) params.cursor = cursor
      else if (append && this.nextCursor) params.cursor = this.nextCursor

      try {
        const { data } = await api.get('/tickets', { params })
        const body = data as any
        const raw = body?.data ?? body
        const list = Array.isArray(raw) ? raw : []
        const normalized = list.map(normalizeTicket)
        if (append) {
          const existing = new Set(this.tickets.map((t) => t.id))
          normalized.forEach((t) => {
            if (!existing.has(t.id)) this.tickets.push(t)
          })
        } else {
          this.tickets = normalized
        }
        this.nextCursor = body?.nextCursor ?? null
        useProjectsStore().syncBoardsWithTickets(this.tickets)
        return this.tickets
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    async fetchTicketsByEpic(epicId: string) {
      if (!epicId) return []
      try {
        const { data } = await api.get('/tickets', { params: { epicId } })
        const list = (data?.data ?? []).map(normalizeTicket)
        this.upsertList(list)
        useProjectsStore().syncBoardsWithTickets(this.tickets)
        return list
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async fetchTicket(ticketId: string, force = false) {
      const existing = this.getById(ticketId)
      if (existing && !force) return existing
      try {
        const { data } = await api.get(`/tickets/${ticketId}`)
        const body = (data as any).data ?? data
        const ticket = normalizeTicket(body)
        const index = this.tickets.findIndex((t) => t.id === ticket.id)
        if (index >= 0) {
          this.tickets[index] = ticket
        } else {
          this.tickets.push(ticket)
        }
        useProjectsStore().syncBoardsWithTickets(this.tickets)
        return ticket
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async createTicket(payload: CreateTicketPayload) {
      try {
        const body = {
          projectId: payload.projectId,
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          type: payload.type,
          epicId: payload.epicId,
          assigneeId: payload.assigneeId,
          startDate: payload.startDate,
          dueDate: payload.dueDate,
        }
        const { data } = await api.post('/tickets', body)
        const bodyResp = (data as any).data ?? data
        const ticket = normalizeTicket(bodyResp)
        this.tickets.push(ticket)
        useProjectsStore().addTicketToColumn(ticket.projectId, ticket.status, ticket.id)
        this.refreshGamification()
        return ticket
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async updateTicket(ticketId: string, payload: Partial<Ticket> & { clearDueDate?: boolean; clearStartDate?: boolean }) {
      const body: Record<string, any> = {}
      if (payload.title !== undefined) body.title = payload.title
      if (payload.description !== undefined) body.description = payload.description
      if (payload.priority !== undefined) body.priority = payload.priority
      if (payload.type !== undefined) body.type = payload.type
      if (payload.assigneeId !== undefined) body.assigneeId = payload.assigneeId ?? ''
      if (payload.epicId !== undefined) body.epicId = payload.epicId ?? ''
      if (payload.clearStartDate) {
        body.clearStartDate = true
      } else if (payload.startDate !== undefined) {
        body.startDate = payload.startDate
      }
      if (payload.clearDueDate) {
        body.clearDueDate = true
      } else if (payload.dueDate !== undefined) {
        body.dueDate = payload.dueDate
      }

      try {
        const { data } = await api.patch(`/tickets/${ticketId}/details`, body)
        const bodyResp = (data as any).data ?? data
        const ticket = normalizeTicket(bodyResp)
        const index = this.tickets.findIndex((t) => t.id === ticket.id)
        if (index >= 0) {
          this.tickets[index] = ticket
        } else {
          this.tickets.push(ticket)
        }
        useProjectsStore().syncBoardsWithTickets(this.tickets)
        this.refreshGamification()
        return ticket
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message.toLowerCase().includes('ticket not found')) {
          const ticket = this.getById(ticketId)
          if (ticket) {
            Object.assign(ticket, payload)
            return ticket
          }
        }
        throw error
      }
    },
    async updateTicketStatus(ticketId: string, status: TicketStatus) {
      if (!TICKET_STATUSES.includes(status)) return
      try {
        const { data } = await api.patch(`/tickets/${ticketId}/status`, { status })
        const bodyResp = (data as any).data ?? data
        const ticket = normalizeTicket(bodyResp)
        const index = this.tickets.findIndex((t) => t.id === ticket.id)
        if (index >= 0) {
          this.tickets[index] = ticket
        } else {
          this.tickets.push(ticket)
        }
        useProjectsStore().moveTicket(ticket.projectId, ticket.id, ticket.status)
        this.refreshGamification()
        return ticket
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async addComment(ticketId: string, payload: TicketCommentPayload) {
      try {
        const { data } = await api.post(`/tickets/${ticketId}/comments`, { text: payload.text })
        const ticket = this.getById(ticketId)
        if (ticket) {
          const body = (data as any).data ?? data
          ticket.comments.push({
            id: body.id,
            author: body.author || payload.author,
            authorId: body.authorId,
            text: body.text,
            timestamp: body.timestamp,
          })
          this.refreshGamification()
        }
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async updateComment(ticketId: string, commentId: string, text: string) {
      try {
        const { data } = await api.patch(`/comments/${commentId}`, { text })
        const ticket = this.getById(ticketId)
        if (!ticket) return
        const idx = ticket.comments.findIndex((c) => c.id === commentId)
        if (idx >= 0) {
          const body = (data as any).data ?? data
          ticket.comments[idx] = {
            id: body.id,
            author: body.author || ticket.comments[idx].author,
            authorId: body.authorId,
            text: body.text,
            timestamp: body.timestamp,
          }
          this.refreshGamification()
        }
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async deleteComment(ticketId: string, commentId: string) {
      try {
        await api.delete(`/comments/${commentId}`)
        const ticket = this.getById(ticketId)
        if (!ticket) return
        ticket.comments = ticket.comments.filter((c) => c.id !== commentId)
        this.refreshGamification()
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async deleteTicket(ticketId: string) {
      try {
        await api.delete(`/tickets/${ticketId}`)
        this.tickets = this.tickets.filter((ticket) => ticket.id !== ticketId)
        const projectsStore = useProjectsStore()
        projectsStore.syncBoardsWithTickets(this.tickets)
        this.refreshGamification()
      } catch (error) {
        throw handleApiError(error)
      }
    },
    reset() {
      this.tickets = []
      this.loading = false
      this.loadingMore = false
      this.nextCursor = null
      this.currentQuery = { projectId: '', assigneeId: '', status: '', epicId: '', q: '' }
    },
  },
})

