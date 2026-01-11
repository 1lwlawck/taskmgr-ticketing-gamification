<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '@/stores/gamification'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'
import type { ToastType } from '@/types/models'

const gamification = useGamificationStore()

const toasts = computed(() => gamification.toasts)

const getIcon = (type?: ToastType) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
}

const getColorClasses = (type?: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 border-emerald-200 text-emerald-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-amber-50 border-amber-200 text-amber-800'
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

const getIconClasses = (type?: ToastType) => {
  switch (type) {
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-amber-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
}

const dismiss = (id: string) => {
  gamification.dismissToast(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-sm"
          :class="getColorClasses(toast.type)"
        >
          <div class="flex items-start gap-3">
            <component
              :is="getIcon(toast.type)"
              class="h-5 w-5 shrink-0 mt-0.5"
              :class="getIconClasses(toast.type)"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm">{{ toast.title }}</p>
              <p class="text-sm opacity-90 mt-0.5">{{ toast.message }}</p>
            </div>
            <button
              type="button"
              class="shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
              @click="dismiss(toast.id)"
            >
              <X class="h-4 w-4 opacity-60" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
