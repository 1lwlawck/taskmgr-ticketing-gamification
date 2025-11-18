<template>
  <article class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:shadow dark:border-slate-700 dark:bg-slate-900">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ project.name }}</h3>
      <span class="text-xs uppercase tracking-wide text-slate-500">{{ project.status }}</span>
    </div>
    <p class="text-sm text-slate-500 dark:text-slate-300">{{ project.description }}</p>
    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
      <span>Tickets: {{ project.tickets?.length ?? 0 }}</span>
      <button class="text-slate-900 underline" @click="$emit('open', project.id)">Open</button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
</script>
