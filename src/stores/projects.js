import { defineStore } from 'pinia'
import { loadState, saveState } from '@/utils/storage'
import { STORAGE_KEYS, TICKET_STATUSES } from '@/utils/constants'
import { generateId, generateCode, formatDate } from '@/utils/helpers'
import { useAuditStore } from './audit'

const defaultProjects = [
  {
    id: 'project-core',
    name: 'Core Platform Refresh',
    description: 'Streamlining ticket visibility and improving gamification loops.',
    status: 'Active',
    members: [
      { id: 'user-admin', name: 'Avery Admin', role: 'admin' },
      { id: 'user-pm', name: 'Parker PM', role: 'project_manager' },
    ],
    invites: [],
    activity: [
      { id: 'activity-1', text: 'Sprint 12 synced', timestamp: formatDate() },
    ],
    board: {
      todo: ['ticket-1'],
      in_progress: ['ticket-2'],
      review: [],
      done: [],
    },
  },
]

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: loadState(STORAGE_KEYS.projects, defaultProjects),
  }),
  getters: {
    getById: (state) => (id) => state.projects.find((project) => project.id === id),
  },
  actions: {
    // TODO: wire this up to project service once APIs are available (create/read/update).
    createProject(payload) {
      const project = {
        id: generateId('project'),
        name: payload.name,
        description: payload.description,
        status: 'Active',
        members: payload.members || [],
        invites: [],
        activity: [
          { id: generateId('activity'), text: 'Project created', timestamp: formatDate() },
        ],
        board: Object.fromEntries(TICKET_STATUSES.map((status) => [status, []])),
      }
      this.projects.push(project)
      this.persist()
      useAuditStore().log('project_created', `${payload.name} created`, payload.createdBy)
      return project
    },
    addMember(projectId, member) {
      const project = this.getById(projectId)
      if (!project) return
      if (!project.members.find((m) => m.id === member.id)) {
        project.members.push(member)
        project.activity.unshift({
          id: generateId('activity'),
          text: `${member.name} joined the team`,
          timestamp: formatDate(),
        })
        this.persist()
      }
    },
    addTicketToColumn(projectId, status, ticketId) {
      const project = this.getById(projectId)
      if (!project) return
      if (!project.board[status]) {
        project.board[status] = []
      }
      if (!project.board[status].includes(ticketId)) {
        project.board[status].push(ticketId)
        this.persist()
      }
    },
    moveTicket(projectId, ticketId, newStatus) {
      const project = this.getById(projectId)
      if (!project) return
      TICKET_STATUSES.forEach((status) => {
        project.board[status] = project.board[status].filter((id) => id !== ticketId)
      })
      if (!project.board[newStatus]) {
        project.board[newStatus] = []
      }
      project.board[newStatus].push(ticketId)
      project.activity.unshift({
        id: generateId('activity'),
        text: `Ticket ${ticketId} moved to ${newStatus}`,
        timestamp: formatDate(),
      })
      this.persist()
    },
    generateInvite(projectId, { maxUses, expiryDays }) {
      const project = this.getById(projectId)
      if (!project) return null
      const invite = {
        code: generateCode(),
        maxUses,
        uses: 0,
        expiresAt: new Date(Date.now() + expiryDays * 86400000).toISOString(),
      }
      project.invites.push(invite)
      this.persist()
      useAuditStore().log('invite_created', `Invite for ${project.name}`, null)
      return invite
    },
    joinByCode(code, currentUser) {
      const project = this.projects.find((proj) =>
        proj.invites.some((invite) => invite.code === code)
      )
      if (!project) {
        throw new Error('Invite code not found')
      }
      const invite = project.invites.find((i) => i.code === code)
      if (invite.uses >= invite.maxUses) {
        throw new Error('Invite already used up')
      }
      if (new Date(invite.expiresAt) < new Date()) {
        throw new Error('Invite expired')
      }
      invite.uses += 1
      this.addMember(project.id, { id: currentUser.id, name: currentUser.name, role: 'member' })
      this.persist()
      useAuditStore().log('project_joined', `${currentUser.name} joined ${project.name}`, currentUser.id)
      return project
    },
    persist() {
      saveState(STORAGE_KEYS.projects, this.projects)
    },
    reset() {
      this.projects = [...defaultProjects]
      this.persist()
    },
  },
})
