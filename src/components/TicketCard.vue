<template>
  <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-card hover:shadow dark:border-slate-700 dark:bg-slate-800">
    <header class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-200">
      <p class="font-semibold text-slate-900 dark:text-white">{{ ticket.title }}</p>
      <span class="rounded-full px-2 py-0.5 text-xs uppercase" :class="priorityClass">{{ ticket.priority }}</span>
    </header>
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-300">{{ ticket.description }}</p>
    <div class="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
      <span>Assignee: {{ ticket.assigneeName }}</span>
      <button class="text-slate-900 underline dark:text-white" @click="$emit('open', ticket.id)">View</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
})

const priorityClass = computed(() => {
  switch (props.ticket.priority) {
    case 'urgent':
      return 'bg-slate-900 text-white'
    case 'high':
      return 'bg-slate-600 text-white'
    case 'medium':
      return 'bg-slate-200 text-slate-800'
    default:
      return 'bg-slate-100 text-slate-600'
  }
})
</script>
