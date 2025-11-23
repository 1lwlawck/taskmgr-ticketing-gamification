import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
const apiKey = import.meta.env.VITE_API_KEY

export const api = axios.create({
  baseURL,
  timeout: 15000,
})

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
    const message = error.response?.data?.error || error.message
    throw new Error(message)
  }
  throw error
}
