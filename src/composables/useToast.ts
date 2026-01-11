import { ref, readonly } from 'vue'
import { useGamificationStore } from '@/stores/gamification'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title?: string
  message: string
  type?: ToastType
  duration?: number
}

const defaultDuration = 4000

export function useToast() {
  const gamification = useGamificationStore()

  const show = (options: ToastOptions) => {
    gamification.pushToast({
      title: options.title ?? getDefaultTitle(options.type ?? 'info'),
      message: options.message,
      type: options.type ?? 'info',
    })
  }

  const showSuccess = (message: string, title?: string) => {
    show({ message, title, type: 'success' })
  }

  const showError = (message: string, title?: string) => {
    show({ message, title: title ?? 'Error', type: 'error' })
  }

  const showWarning = (message: string, title?: string) => {
    show({ message, title: title ?? 'Warning', type: 'warning' })
  }

  const showInfo = (message: string, title?: string) => {
    show({ message, title, type: 'info' })
  }

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

function getDefaultTitle(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Error'
    case 'warning':
      return 'Warning'
    case 'info':
    default:
      return 'Info'
  }
}
