<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { AlertTriangle, RotateCcw } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    fallbackMessage?: string
  }>(),
  {
    fallbackMessage: 'Terjadi kesalahan yang tidak terduga.',
  }
)

const hasError = ref(false)
const errorMessage = ref('')

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
}

onErrorCaptured((error, instance, info) => {
  console.error('[ErrorBoundary] Caught error:', error)
  console.error('[ErrorBoundary] Component:', instance)
  console.error('[ErrorBoundary] Info:', info)
  
  hasError.value = true
  errorMessage.value = error instanceof Error ? error.message : String(error)
  
  // Prevent error from propagating
  return false
})
</script>

<template>
  <slot v-if="!hasError" />
  
  <div v-else class="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
      <AlertTriangle class="h-6 w-6 text-red-600" />
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-red-800">Oops! Ada yang salah</h3>
      <p class="mt-1 text-sm text-red-600">{{ fallbackMessage }}</p>
      <p v-if="errorMessage" class="mt-2 font-mono text-xs text-red-500/80">
        {{ errorMessage }}
      </p>
    </div>
    
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
      @click="handleRetry"
    >
      <RotateCcw class="h-4 w-4" />
      Coba Lagi
    </button>
  </div>
</template>
