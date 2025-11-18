const isBrowser = typeof window !== 'undefined'

export const loadState = (key, fallback = null) => {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`Failed to parse localStorage key ${key}`, error)
    return fallback
  }
}

export const saveState = (key, value) => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to persist localStorage key ${key}`, error)
  }
}

export const clearState = (key) => {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to clear localStorage key ${key}`, error)
  }
}
