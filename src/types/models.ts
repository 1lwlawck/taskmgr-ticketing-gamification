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

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastPayload {
  title: string
  message: string
  type?: ToastType
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

// ============ Reports Types ============
export interface ReportSummary {
  totalTickets: number
  openTickets: number
  closedTickets: number
  totalProjects: number
  activeProjects: number
  totalUsers: number
  totalEpics: number
}

export interface StatusBreakdown {
  status: string
  count: number
}

export interface PriorityBreakdown {
  priority: string
  count: number
}

export interface AssigneeBreakdown {
  userId: string
  userName: string
  ticketCount: number
  closedCount: number
  openCount: number
}

export interface TeamPerformance {
  userId: string
  userName: string
  totalXp: number
  level: number
  ticketsClosed: number
  currentStreak: number
  lastActiveAt?: string
}

export interface TicketTrend {
  date: string
  created: number
  closed: number
}

// ============ Calendar Types ============
export interface CalendarEvent {
  id: string
  title: string
  type: 'ticket_deadline' | 'epic_start' | 'epic_end'
  date: string
  projectId?: string
  projectName?: string
  status?: string
  priority?: string
}

export interface CalendarFilter {
  start?: string
  end?: string
  projectId?: string
  type?: 'ticket' | 'epic' | 'all'
}

// ============ Team Types ============
export interface TeamMember {
  id: string
  name: string
  username: string
  role: string
  avatarUrl?: string
  projectCount: number
  ticketCount: number
  totalXp: number
  level: number
  joinedAt: string
}

export interface TeamProjectMember {
  userId: string
  userName: string
  projectId: string
  projectName: string
  role: string
}

// ============ Achievements Types ============
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'tickets' | 'streaks' | 'xp' | 'community'
  threshold: number
  xpReward: number
}

export interface AchievementProgress {
  achievementId: string
  name: string
  description: string
  icon: string
  current: number
  target: number
  percentage: number
  unlocked: boolean
}

// ============ Challenges Types ============
export interface Challenge {
  id: string
  title: string
  description: string
  type: 'tickets' | 'xp' | 'streak' | 'comments'
  target: number
  xpReward: number
  startDate: string
  endDate: string
  active: boolean
}

export interface UserChallenge {
  challengeId: string
  challenge: Challenge
  userId: string
  current: number
  completed: boolean
  percentage: number
  completedAt?: string
}

// ============ Activity Types ============
export interface ActivityItem {
  id: string
  userId?: string
  userName?: string
  action: string
  details?: string
  entityType?: 'ticket' | 'project' | 'epic' | 'comment'
  entityId?: string
  createdAt: string
}

export interface ActivityFilter {
  entityType?: string
  limit?: number
  cursor?: string
}
