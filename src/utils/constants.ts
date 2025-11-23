export const PRIORITY_XP_MAP = {
  low: 5,
  medium: 10,
  high: 20,
  urgent: 30,
} as const

export const TICKET_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const

export const TICKET_TYPES = ['bug', 'feature', 'chore'] as const

export const ROLES = ['admin', 'project_manager', 'developer', 'viewer'] as const

export const STORAGE_KEYS = {
  authUser: 'ttm_auth_user',
  authToken: 'ttm_auth_token',
} as const

export type TicketPriority = keyof typeof PRIORITY_XP_MAP
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketType = (typeof TICKET_TYPES)[number]
export type Role = (typeof ROLES)[number]
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
