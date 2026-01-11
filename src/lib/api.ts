import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
const apiKey = import.meta.env.VITE_API_KEY

// Retry configuration
const RETRY_COUNT = 3
const RETRY_DELAY_BASE = 1000 // 1 second base delay

export const api = axios.create({
  baseURL,
  timeout: 15000,
})

// Helper to check if error is retryable (network errors only, not 4xx/5xx)
const isRetryableError = (error: AxiosError) => {
  // Network errors (no response received)
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')
  }
  return false
}

// Retry interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number }
    
    if (!config || !isRetryableError(error)) {
      return Promise.reject(error)
    }
    
    config._retryCount = config._retryCount ?? 0
    
    if (config._retryCount >= RETRY_COUNT) {
      return Promise.reject(error)
    }
    
    config._retryCount += 1
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = RETRY_DELAY_BASE * Math.pow(2, config._retryCount - 1)
    
    console.warn(`[API] Retrying request (${config._retryCount}/${RETRY_COUNT}) after ${delay}ms...`)
    
    await new Promise((resolve) => setTimeout(resolve, delay))
    
    return api(config)
  }
)

if (apiKey) {
  api.defaults.headers.common['X-API-Key'] = apiKey
}

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const err = error.response?.data?.error
    const message =
      typeof err === 'string'
        ? err
        : err?.message || err?.code || error.message
    const code = typeof err === 'string' ? undefined : err?.code
    const details = typeof err === 'string' ? undefined : err?.details
    const status = error.response?.status
    const apiError = new Error(message) as Error & {
      status?: number
      code?: string
      details?: unknown
    }
    apiError.status = status
    apiError.code = code
    apiError.details = details
    throw apiError
  }
  throw error
}

// Axios interceptor to auto-refresh on 401 (once per request)
let isRefreshing = false
let pending: Array<{ resolve: () => void; reject: (err: unknown) => void }> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error)
    }

    const originalConfig = error.config
    if (originalConfig._retry) {
      return Promise.reject(error)
    }
    originalConfig._retry = true

    const auth = useAuthStore()
    if (isRefreshing) {
      try {
        await new Promise<void>((resolve, reject) => pending.push({ resolve, reject }))
        return api(originalConfig)
      } catch (waitErr) {
        return Promise.reject(waitErr)
      }
    }

    isRefreshing = true
    try {
      const success = await auth.refresh()
      if (!success) {
        pending.forEach(({ reject }) => reject(error))
        pending = []
        return Promise.reject(error)
      }
      pending.forEach(({ resolve }) => resolve())
      pending = []
      return api(originalConfig)
    } catch (err) {
      pending.forEach(({ reject }) => reject(err))
      pending = []
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
