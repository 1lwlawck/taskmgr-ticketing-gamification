<template>
<RouterLink
  :to="localePath(`/projects/${project.id}`)"
  class="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
>
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-slate-900">{{ project.name }}</h3>
    <span class="rounded-full border border-slate-200 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-500">
      {{ project.status }}
    </span>
  </div>
  <p class="text-sm text-slate-500 line-clamp-3">{{ project.description }}</p>
  <div class="flex items-center justify-between text-xs text-slate-500">
    <span>{{ t('components.projectCard.tickets', { count: ticketCount }) }}</span>
    <span class="inline-flex items-center gap-1 text-slate-900 transition group-hover:translate-x-0.5">
      {{ t('common.view') || 'Open' }}
      <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none">
        <path d="M5 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </div>
</RouterLink>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { TICKET_STATUSES } from '@/utils/constants'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const { project } = toRefs(props)
const { t } = useI18n()
const route = useRoute()
const localeParam = computed(() => route.params.locale as string | undefined)
const localePath = (path: string) => (localeParam.value ? `/${localeParam.value}${path}` : path)

const ticketCount = computed(() => {
  if (typeof project.value.ticketsCount === 'number') return project.value.ticketsCount
  const board = project.value.board || {}
  return TICKET_STATUSES.map((status) => board[status]?.length || 0).reduce((a, b) => a + b, 0)
})
</script>
