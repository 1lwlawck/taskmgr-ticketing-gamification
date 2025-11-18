export const generateId = (prefix = 'id') => {
  const random = Math.random().toString(36).substring(2, 8)
  const timestamp = Date.now().toString(36)
  return `${prefix}-${timestamp}-${random}`
}

export const generateCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const formatDate = (value = new Date()) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const randomFromList = (items = []) => items[Math.floor(Math.random() * items.length)]
