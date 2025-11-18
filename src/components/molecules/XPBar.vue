<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
    <div class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
      <span>Level {{ level }}</span>
      <span>{{ xp }} / {{ nextLevelThreshold }} XP</span>
    </div>
    <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
      <div class="h-full rounded-full bg-slate-900 transition-all duration-500" :style="{ width: `${progress}%` }"></div>
    </div>
    <p class="mt-2 text-xs text-slate-500">Keep closing tickets to advance to the next tier.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  xp: { type: Number, required: true },
  level: { type: Number, default: 1 },
  nextLevelThreshold: { type: Number, default: 100 },
})

const progress = computed(() => {
  const ratio = props.xp / props.nextLevelThreshold
  return Math.min(100, Math.round(ratio * 100))
})
</script>
