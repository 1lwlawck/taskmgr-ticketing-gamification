export const generateId = (prefix = 'id'): string => {
  const random = Math.random().toString(36).substring(2, 8)
  const timestamp = Date.now().toString(36)
  return `${prefix}-${timestamp}-${random}`
}

export const generateCode = (length = 6): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const formatDate = (value: Date | string = new Date()): string => {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const randomFromList = <T>(items: T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)]
