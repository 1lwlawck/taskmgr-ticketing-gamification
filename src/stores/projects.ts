import { defineStore } from 'pinia'
import { TICKET_STATUSES, type TicketStatus } from '@/utils/constants'
import { generateId } from '@/utils/helpers'
import type {
  CreateProjectPayload,
  Project,
  ProjectInvite,
  ProjectInvitePayload,
  ProjectMember,
  Ticket,
  User,
} from '@/types/models'
import { api, handleApiError } from '@/lib/api'
import { useUsersStore } from './users'

const buildEmptyBoard = (): Record<string, string[]> =>
  TICKET_STATUSES.reduce<Record<string, string[]>>((board, status) => {
    board[status] = []
    return board
  }, {})

const normalizeProject = (payload: any): Project => ({
  id: payload.id,
  name: payload.name,
  description: payload.description,
  status: payload.status ?? 'Active',
  ticketsCount: payload.ticketsCount ?? 0,
  members: (payload.members ?? []).map((member: any) => ({
    id: member.id,
    name: member.name,
    role: member.role ?? 'member',
  })),
  invites: (payload.invites ?? []) as ProjectInvite[],
  activity: payload.activity ?? [],
  activityNextCursor: payload.activityNextCursor ?? null,
  board: buildEmptyBoard(),
})

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false,
    loadingMore: false,
    nextCursor: null as string | null,
    currentQuery: {
      q: '',
      status: '',
    },
  }),
  getters: {
    getById: (state) => (id: string) => state.projects.find((project) => project.id === id),
  },
  actions: {
    async fetchProjects(options?: { force?: boolean; q?: string; status?: string; append?: boolean; cursor?: string | null; limit?: number }) {
      const { force = false, q, status, append = false, cursor = null, limit = 50 } = options || {}
      const isReset = !append
      if (!force && !isReset && !this.nextCursor && !cursor) return
      if (isReset) {
        if (cursor === undefined) this.nextCursor = null
        // Background refresh: Don't clear if we have data
        if (!append && this.projects.length === 0) this.projects = []
      }
      const isFirstLoad = isReset && !append
      // Background Refresh: Only show loading if we have no data
      if (this.projects.length === 0) {
        this.loading = isFirstLoad
      }
      this.loadingMore = append

      const queryQ = q ?? this.currentQuery.q ?? ''
      const queryStatus = status ?? this.currentQuery.status ?? ''
      this.currentQuery = { q: queryQ, status: queryStatus }

      const params: Record<string, any> = { limit }
      if (queryQ) params.q = queryQ
      if (queryStatus) params.status = queryStatus
      if (cursor) params.cursor = cursor
      else if (append && this.nextCursor) params.cursor = this.nextCursor

      try {
        const { data } = await api.get('/projects', { params })
        const body = data as any
        const raw = body?.data ?? body
        const list = Array.isArray(raw) ? raw : []
        const normalized = list.map(normalizeProject)
        if (append) {
          const existingIds = new Set(this.projects.map((p) => p.id))
          normalized.forEach((p) => {
            if (!existingIds.has(p.id)) this.projects.push(p)
          })
        } else {
          this.projects = normalized
        }
        this.nextCursor = body?.nextCursor ?? null
      } catch (error) {
        throw handleApiError(error)
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    async fetchProject(projectId: string, params?: { activityLimit?: number; activityCursor?: string }) {
      try {
        const { data } = await api.get(`/projects/${projectId}`, { params })
        const body = (data as any).data ?? data
        const normalized = normalizeProject(body)
        this.upsertProject(normalized)
        return normalized
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async fetchProjectActivity(projectId: string, options?: { cursor?: string; limit?: number }) {
      const project = this.getById(projectId)
      if (!project) throw new Error('Project not found')
      try {
        const params: Record<string, any> = {}
        if (options?.cursor) params.activityCursor = options.cursor
        if (options?.limit) params.activityLimit = options.limit
        const { data } = await api.get(`/projects/${projectId}`, { params })
        const body = (data as any).data ?? data
        const normalized = normalizeProject(body)
        // append activity when cursor is present
        if (options?.cursor && project.activity?.length) {
          const merged = [...project.activity]
          const existingIds = new Set(merged.map((a) => a.id))
          ;(normalized.activity ?? []).forEach((a) => {
            if (!existingIds.has(a.id)) merged.push(a)
          })
          project.activity = merged
          project.activityNextCursor = normalized.activityNextCursor ?? null
        } else {
          project.activity = normalized.activity ?? []
          project.activityNextCursor = normalized.activityNextCursor ?? null
        }
        return project
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async createProject(payload: CreateProjectPayload) {
      try {
        const body = {
          name: payload.name,
          description: payload.description,
          members: (payload.members ?? []).map((member) => member.id),
        }
        const { data } = await api.post('/projects', body)
        const bodyResp = (data as any).data ?? data
        const project = normalizeProject(bodyResp)
        this.projects.push(project)
        return project
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async addMember(projectId: string, member: ProjectMember) {
      try {
        await api.post(`/projects/${projectId}/members`, { userId: member.id, role: member.role })
        const project = this.getById(projectId)
        if (!project) return
        if (!project.members.find((m) => m.id === member.id)) {
          const usersStore = useUsersStore()
          const user = usersStore.getById(member.id)
          project.members.push({
            id: member.id,
            name: user?.name ?? member.name,
            role: member.role ?? 'member',
          })
        project.activity.unshift({
          id: generateId('activity'),
          text: `${user?.name ?? member.id} joined the team`,
          timestamp: new Date().toISOString(),
        })
        }
      } catch (error) {
        throw handleApiError(error)
      }
    },
    addTicketToColumn(projectId: string, status: TicketStatus, ticketId: string) {
      const project = this.getById(projectId)
      if (!project) return
      if (!project.board[status]) {
        project.board[status] = []
      }
      if (!project.board[status].includes(ticketId)) {
        project.board[status].push(ticketId)
      }
    },
    moveTicket(projectId: string, ticketId: string, newStatus: TicketStatus) {
      const project = this.getById(projectId)
      if (!project) return
      TICKET_STATUSES.forEach((status) => {
        project.board[status] = (project.board[status] || []).filter((id) => id !== ticketId)
      })
      if (!project.board[newStatus]) {
        project.board[newStatus] = []
      }
      project.board[newStatus].push(ticketId)
      project.activity.unshift({
        id: generateId('activity'),
        text: `Ticket ${ticketId} moved to ${newStatus}`,
        timestamp: new Date().toISOString(),
      })
    },
    async generateInvite(projectId: string, payload: ProjectInvitePayload) {
      try {
        const { data } = await api.post(`/projects/${projectId}/invites`, payload)
        const project = this.getById(projectId)
        if (project) {
          const inv = (data as any).data ?? data
          project.invites.push({
            code: inv.code,
            maxUses: inv.maxUses,
            uses: inv.uses,
            expiresAt: inv.expiresAt,
          })
        }
        return ((data as any).data ?? data) as ProjectInvite
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async joinByCode(code: string, currentUser: User | null | undefined) {
      if (!currentUser) {
        throw new Error('Please login to join a project')
      }
      try {
        const { data } = await api.post('/projects/join', { code })
        const body = (data as any).data ?? data
        const project = normalizeProject(body)
        this.upsertProject(project)
        return project
      } catch (error) {
        throw handleApiError(error)
      }
    },
    async leaveProject(projectId: string) {
      try {
        await api.delete(`/projects/${projectId}/members/me`)
        this.projects = this.projects.filter((project) => project.id !== projectId)
      } catch (error) {
        throw handleApiError(error)
      }
    },
    syncBoardsWithTickets(tickets: Ticket[]) {
      this.projects.forEach((project) => {
        project.board = buildEmptyBoard()
      })
      tickets.forEach((ticket) => {
        this.addTicketToColumn(ticket.projectId, ticket.status, ticket.id)
      })
    },
    upsertProject(project: Project) {
      const index = this.projects.findIndex((item) => item.id === project.id)
      if (index >= 0) {
        const existing = this.projects[index]
        // Keep existing board state, but prefer fresh invites/activity when provided
        project.board = existing.board
        if (!project.invites?.length) {
          project.invites = existing.invites
        }
        if (!project.activity?.length) {
          project.activity = existing.activity
        }
        if (project.activityNextCursor === undefined) {
          project.activityNextCursor = existing.activityNextCursor ?? null
        }
        this.projects[index] = project
      } else {
        this.projects.push(project)
      }
    },
    reset() {
      this.projects = []
      this.loading = false
      this.loadingMore = false
      this.nextCursor = null
      this.currentQuery = { q: '', status: '' }
    },
  },
})
