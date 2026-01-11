<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next'

defineProps<{
  show: boolean
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-full"
  >
    <div
      v-if="show"
      class="fixed inset-x-0 top-0 z-[99] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      <WifiOff class="h-4 w-4" />
      <span>Anda sedang offline. Perubahan mungkin tidak tersimpan.</span>
    </div>
  </Transition>
</template>
