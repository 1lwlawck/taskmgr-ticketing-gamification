<template>
  <TransitionGroup name="fade" tag="div" class="fixed bottom-4 right-4 z-50 space-y-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-card dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <p class="font-semibold text-slate-900 dark:text-white">{{ toast.title }}</p>
      <p class="text-slate-500 dark:text-slate-300">{{ toast.message }}</p>
      <button class="mt-2 text-xs text-slate-600 underline dark:text-slate-400" @click="dismiss(toast.id)">Dismiss</button>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useGamificationStore } from '@/stores/gamification'

const gamification = useGamificationStore()
const { toasts } = storeToRefs(gamification)

const dismiss = (id) => gamification.dismissToast(id)
</script>
