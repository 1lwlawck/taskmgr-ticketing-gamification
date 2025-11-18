<template>
  <div class="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-4 text-center shadow-card">
    <span
      class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700"
      v-html="iconMarkup"
    ></span>
    <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
    <p class="text-xs text-slate-500">{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const ICONS = {
  check:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  flash:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mentor:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2"/><path d="M5 21c0-3 3-5 7-5s7 2 7 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bug:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9h12M6 9c-.5-2-2-4-3-4M6 9v10M18 9V5c-1 0-2 1-2 4M18 9v10M9 21h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 6v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  star:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.39 4.84 5.33.78-3.86 3.76.91 5.32L12 17.77l-4.77 2.53.91-5.32L4.28 8.62l5.33-.78L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

const props = defineProps({
  title: String,
  description: String,
  icon: {
    type: String,
    default: 'star',
  },
})

const iconMarkup = computed(() => ICONS[props.icon] ?? ICONS.star)
</script>
