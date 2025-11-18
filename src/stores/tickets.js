import { defineStore } from 'pinia'
import { loadState, saveState } from '@/utils/storage'
import { STORAGE_KEYS, TICKET_STATUSES } from '@/utils/constants'
import { generateId, formatDate } from '@/utils/helpers'
import { useGamificationStore } from './gamification'
import { useProjectsStore } from './projects'
import { useAuditStore } from './audit'

const defaultTickets = [
  {
    id: 'ticket-1',
    projectId: 'project-core',
    title: 'Kanban board shell',
    description: 'Implement drag & drop columns for project board.',
    status: 'todo',
    priority: 'high',
    type: 'feature',
    assigneeId: 'user-dev',
    assigneeName: 'Devon Dev',
    dueDate: '2025-11-22',
    history: [{ id: 'history-1', text: 'Ticket created', timestamp: formatDate() }],
    comments: [],
  },
  {
    id: 'ticket-2',
    projectId: 'project-core',
    title: 'Gamification spec',
    description: 'Document XP flow for done tickets.',
    status: 'in_progress',
    priority: 'medium',
    type: 'chore',
    assigneeId: 'user-pm',
    assigneeName: 'Parker PM',
    dueDate: '2025-11-25',
    history: [{ id: 'history-2', text: 'Ticket created', timestamp: formatDate() }],
    comments: [],
  },
]

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: loadState(STORAGE_KEYS.tickets, defaultTickets),
  }),
  getters: {
    getById: (state) => (id) => state.tickets.find((ticket) => ticket.id === id),
    byProject: (state) => (projectId) => state.tickets.filter((t) => t.projectId === projectId),
  },
  actions: {
    // TODO: replace mocked ticket creation/update with API mutations (optimistic updates optional).
    createTicket(payload) {
      const ticket = {
        id: generateId('ticket'),
        history: [{ id: generateId('history'), text: 'Ticket created', timestamp: formatDate() }],
        comments: [],
        status: 'todo',
        ...payload,
      }
      this.tickets.push(ticket)
      useProjectsStore().addTicketToColumn(ticket.projectId, ticket.status, ticket.id)
      useAuditStore().log('ticket_created', `${ticket.title} created`, payload.createdBy)
      this.persist()
      return ticket
    },
    updateTicket(ticketId, payload) {
      const ticket = this.getById(ticketId)
      if (!ticket) return
      Object.assign(ticket, payload)
      ticket.history.unshift({
        id: generateId('history'),
        text: 'Ticket updated',
        timestamp: formatDate(),
      })
      this.persist()
    },
    updateTicketStatus(ticketId, status, actorId) {
      const ticket = this.getById(ticketId)
      if (!ticket || !TICKET_STATUSES.includes(status)) return
      const previousStatus = ticket.status
      ticket.status = status
      ticket.history.unshift({
        id: generateId('history'),
        text: `Status changed to ${status}`,
        timestamp: formatDate(),
        actorId,
      })
      this.persist()
      useProjectsStore().moveTicket(ticket.projectId, ticket.id, status)
      if (status === 'done' && previousStatus !== 'done') {
        useGamificationStore().awardXp({
          userId: ticket.assigneeId || actorId,
          ticketId,
          priority: ticket.priority,
        })
      }
    },
    addComment(ticketId, comment) {
      const ticket = this.getById(ticketId)
      if (!ticket) return
      ticket.comments.push({
        id: generateId('comment'),
        author: comment.author,
        text: comment.text,
        timestamp: formatDate(),
      })
      this.persist()
    },
    deleteTicket(ticketId) {
      const ticket = this.getById(ticketId)
      if (!ticket) return
      this.tickets = this.tickets.filter((t) => t.id !== ticketId)
      const projectsStore = useProjectsStore()
      const project = projectsStore.getById(ticket.projectId)
      if (project) {
        Object.keys(project.board).forEach((column) => {
          project.board[column] = project.board[column].filter((id) => id !== ticketId)
        })
        projectsStore.persist()
      }
      useAuditStore().log('ticket_deleted', `${ticket.title} removed`, null)
      this.persist()
    },
    persist() {
      saveState(STORAGE_KEYS.tickets, this.tickets)
    },
    reset() {
      this.tickets = [...defaultTickets]
      this.persist()
    },
  },
})
