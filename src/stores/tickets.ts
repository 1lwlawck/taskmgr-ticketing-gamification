import { defineStore } from 'pinia'
import { TICKET_STATUSES, type TicketStatus } from '@/utils/constants'
import type { CreateTicketPayload, Ticket, TicketCommentPayload } from '@/types/models'
import { api, handleApiError } from '@/lib/api'
import { useProjectsStore } from './projects'
import { useGamificationStore } from './gamification'
import { useAuthStore } from './auth'

const normalizeTicket = (payload: any): Ticket => ({
  id: payload.id,
  projectId: payload.projectId,
  title: payload.title,
  description: payload.description,
  status: payload.status,
  priority: payload.priority,
  type: payload.type,
  reporterId: payload.reporterId ?? undefined,
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
  }),
  getters: {
    getById: (state) => (id: string) => state.tickets.find((ticket) => ticket.id === id),
    byProject: (state) => (projectId: string) => state.tickets.filter((t) => t.projectId === projectId),
  },
  actions: {
    async refreshGamification() {
      const auth = useAuthStore()
      const gamification = useGamificationStore()
      if (!auth.currentUser) return
      await Promise.allSettled([
        gamification.fetchStats(auth.currentUser.id),
        gamification.fetchEvents(auth.currentUser.id),
        gamification.fetchLeaderboard(10),
      ])
    },
    async fetchTickets(force = false) {
      if (!force && this.tickets.length) return
      this.loading = true
      try {
        const { data } = await api.get('/tickets')
        this.tickets = (data?.data ?? []).map(normalizeTicket)
        useProjectsStore().syncBoardsWithTickets(this.tickets)
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
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
    },
  },
})

