const isBrowser = typeof window !== 'undefined'

// Namespace keys by API base to avoid leaking sessions between environments/users
const apiBase =
  (isBrowser ? (window as any).__APP_API_BASE__ : undefined) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (isBrowser ? window.location.origin : 'default')
const namespace = `ttm:${apiBase}`
const withNs = (key: string) => `${namespace}:${key}`

export const loadState = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(withNs(key))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (error) {
    console.warn(`Failed to parse localStorage key ${key}`, error)
    return fallback
  }
}

export const saveState = <T>(key: string, value: T): void => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(withNs(key), JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to persist localStorage key ${key}`, error)
  }
}

export const clearState = (key: string): void => {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(withNs(key))
  } catch (error) {
    console.warn(`Failed to clear localStorage key ${key}`, error)
  }
}

// Remove any legacy auth keys that might still exist (pre-namespace)
const legacyKeys = ['ttm_auth_user', 'ttm_auth_token', 'ttm_auth_refresh']

export const clearAuthStorage = (): void => {
  if (!isBrowser) return
  try {
    legacyKeys.forEach((k) => window.localStorage.removeItem(k))
    // also clear namespaced versions of the same keys
    legacyKeys.forEach((k) => window.localStorage.removeItem(withNs(k)))
  } catch (error) {
    console.warn('Failed to clear auth storage', error)
  }
}
