import type { Role, TicketPriority, TicketStatus, TicketType } from '@/utils/constants'

export type MemberRole = Role | 'member' | 'viewer'

export interface User {
  id: string
  name: string
  username: string
  role: MemberRole
  avatar?: string
  badges: string[]
  bio?: string
}

export interface ProjectMember {
  id: string
  name: string
  role: MemberRole
}

export interface ProjectActivity {
  id: string
  text: string
  timestamp: string
}

export interface ProjectInvite {
  code: string
  maxUses: number
  uses: number
  expiresAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: string
  ticketsCount?: number
  members: ProjectMember[]
  invites: ProjectInvite[]
  activity: ProjectActivity[]
  activityNextCursor?: string | null
  board: Record<string, string[]>
}

export interface ProjectInvitePayload {
  maxUses: number
  expiryDays: number
}

export interface CreateProjectPayload {
  name: string
  description: string
  members?: Array<Pick<ProjectMember, 'id' | 'name'> & Partial<Pick<ProjectMember, 'role'>>>
  createdBy: string
}

export interface TicketHistoryEntry {
  id: string
  text: string
  timestamp: string
  actorId?: string
}

export interface TicketComment {
  id: string
  author?: string
  authorId?: string
  text: string
  timestamp: string
}

export interface Ticket {
  epicId: string
  id: string
  projectId: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  reporterId?: string
  assigneeId?: string
  assigneeName?: string
  startDate?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  history: TicketHistoryEntry[]
  comments: TicketComment[]
}

export interface CreateTicketPayload {
  projectId: string
  title: string
  description: string
  priority: TicketPriority
  type: TicketType
  epicId?: string
  assigneeId?: string
  assigneeName?: string
  startDate?: string
  dueDate?: string
  createdBy: string
}

export interface TicketCommentPayload {
  author: string
  text: string
}

export interface GamificationStats {
  xp: number
  level: number
  nextLevelThreshold: number
  tickets_closed_count: number
  streak?: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  username: string
  role: MemberRole
  xp: number
  level: number
  tickets_closed_count: number
  rank: number
  xpGap: number
}

export interface Epic {
  id: string
  projectId: string
  title: string
  description?: string
  status: TicketStatus
  startDate?: string
  dueDate?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
  doneCount?: number
  totalCount?: number
}

export interface XpEvent {
  createdAt: string
  id: string
  userId: string
  ticketId: string
  priority: TicketPriority
  xp: number
  note: string
  timestamp: string
}

export interface ToastPayload {
  title: string
  message: string
}

export interface Toast extends ToastPayload {
  id: string
}

export interface AwardXpPayload {
  userId: string
  ticketId: string
  priority?: TicketPriority
  note?: string
}

export interface AuditEntry {
  id: string
  action: string
  description: string
  userId: string | null
  timestamp: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  name: string
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}
