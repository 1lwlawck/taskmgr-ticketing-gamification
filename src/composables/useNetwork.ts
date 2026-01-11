import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from './useToast'

export function useNetwork() {
  const isOnline = ref(navigator.onLine)
  const wasOffline = ref(false)

  const toast = useToast()

  const handleOnline = () => {
    isOnline.value = true
    if (wasOffline.value) {
      toast.showSuccess('Koneksi internet kembali tersedia', 'Online')
      wasOffline.value = false
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    wasOffline.value = true
    toast.showWarning('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.', 'Offline')
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
  }
}
