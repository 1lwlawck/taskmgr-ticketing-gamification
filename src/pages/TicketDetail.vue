<template>
  <section v-if="pageLoading" class="space-y-6">
    <PageHeroSkeleton />
    <CardGridSkeleton :count="4" columns-class="md:grid-cols-2" />
    <TableSkeleton :columns="3" :rows="4" />
  </section>

  <section v-else-if="ticket" class="space-y-6">
    <header class="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.3em] text-white/70">{{ t('ticketDetail.ticket', { id: ticket.id }) }}</p>
          <h1 class="text-3xl font-semibold leading-tight">{{ ticket.title }}</h1>
          <p class="text-sm text-white/80">{{ ticket.description || t('ticketDetail.noDescription') }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            {{ t('ticketDetail.status') }}:
            <Select
              :model-value="ticket.status"
              :options="statusOptions"
              variant="glass"
              class="min-w-[130px]"
              @update:model-value="updateStatus"
            />
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            {{ t('ticketDetail.priority') }}:
            <span class="rounded-full bg-white/15 px-3 py-1 text-white">{{ ticket.priority }}</span>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            {{ t('ticketDetail.type') }}:
            <span class="rounded-full bg-white/15 px-3 py-1 text-white">{{ ticket.type }}</span>
          </span>
        </div>
      </div>
    </header>

    <div class="grid gap-4 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card lg:col-span-3">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-lg bg-slate-50 p-3">
            <p class="text-xs uppercase text-slate-500">{{ t('ticketDetail.assignee') }}</p>
            <div class="mt-2 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white"
                :style="getAvatarStyle(assigneeName)"
              >
                {{ getInitials(assigneeName) }}
              </div>
              <Select
                :model-value="ticket.assigneeId || ''"
                :options="assigneeSelectOptions"
                class="flex-1"
                @update:model-value="updateAssignee"
              />
            </div>
          </div>
          <div class="rounded-lg bg-indigo-50 p-3">
            <p class="text-xs uppercase text-indigo-600">{{ t('ticketDetail.xpReward') }}</p>
            <p class="mt-2 text-3xl font-semibold text-indigo-900">{{ xpReward }} XP</p>
            <p class="text-xs text-indigo-700/80">{{ t('ticketDetail.basedOnPriority') }}</p>
          </div>
          <div class="rounded-lg bg-emerald-50 p-3">
            <p class="text-xs uppercase text-emerald-600">{{ t('ticketDetail.status') }}</p>
            <p class="mt-2 text-xl font-semibold capitalize text-emerald-900">{{ displayStatus }}</p>
            <p class="text-xs text-emerald-700/80">{{ t('ticketDetail.realtime') }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p class="text-xs uppercase text-slate-500">{{ t('ticketDetail.meta') }}</p>
        <dl class="mt-3 space-y-2 text-sm text-slate-700">
          <div class="flex justify-between">
            <dt>{{ t('ticketDetail.type') }}</dt>
            <dd class="font-medium">{{ ticket.type }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('ticketDetail.priority') }}</dt>
            <dd class="font-medium capitalize">{{ ticket.priority }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('ticketDetail.status') }}</dt>
            <dd class="font-medium capitalize">{{ displayStatus }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('ticketDetail.assignee') }}</dt>
            <dd class="font-medium">{{ assigneeName || t('ticketDetail.unassigned') }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white shadow-card">
      <div class="flex gap-4 border-b border-slate-200 px-4 py-3 text-sm">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="pb-2"
          :class="activeTab === tab ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'"
          @click="activeTab = tab"
        >
          {{ t(`ticketDetail.tabs.${tab}`) }}
        </button>
      </div>
      <div class="p-4 text-sm text-slate-700">
        <div v-if="activeTab === 'overview'" class="space-y-2 leading-relaxed">
          <p>{{ ticket.description || t('ticketDetail.descriptionEmpty') }}</p>
        </div>
        <div v-else-if="activeTab === 'comments'" class="space-y-4">
          <ul class="space-y-3">
            <li v-for="comment in ticket.comments" :key="comment.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-slate-900">{{ comment.author }}</p>
                  <p class="text-slate-600">{{ comment.text }}</p>
                  <p class="text-xs text-slate-500">{{ comment.timestamp }}</p>
                </div>
                <div v-if="comment.authorId === auth.currentUser?.id" class="flex gap-2 text-xs">
                  <button class="text-indigo-600 hover:underline" @click="promptEditComment(comment)">{{ t('ticketDetail.comments.edit') }}</button>
                  <button class="text-rose-600 hover:underline" @click="confirmDeleteComment(comment)">{{ t('ticketDetail.comments.delete') }}</button>
                </div>
              </div>
            </li>
            <li v-if="ticket.comments.length === 0" class="text-slate-400">{{ t('ticketDetail.comments.none') }}</li>
          </ul>
          <form class="space-y-2" @submit.prevent="addComment">
            <textarea
              v-model="commentText"
              rows="3"
              class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900"
              :placeholder="t('ticketDetail.comments.placeholder')"
            ></textarea>
            <button
              class="rounded-md border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
              type="submit"
            >
              {{ t('ticketDetail.comments.post') }}
            </button>
          </form>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="item in ticket.history"
            :key="item.id"
            class="relative rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div class="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-indigo-200"></div>
            <p class="text-slate-800">{{ item.text }}</p>
            <p class="text-xs text-slate-500">{{ item.timestamp }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <p v-else class="text-slate-500">{{ t('ticketDetail.notFound') }}</p>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { PRIORITY_XP_MAP } from '@/utils/constants'
import type { TicketStatus } from '@/utils/constants'
import { PageHeroSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/molecules/skeletons'
import Select from '@/components/ui/select/Select.vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const ticketsStore = useTicketsStore()
const ticketId = route.params.id as string
const ticket = computed(() => ticketsStore.getById(ticketId))
const loadingTicket = ref(false)
const pageLoading = computed(() => loadingTicket.value && !ticket.value)
const tabs = ['overview', 'comments', 'history'] as const
type TabKey = (typeof tabs)[number]
const activeTab = ref<TabKey>('overview')
const commentText = ref('')
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const auth = useAuthStore()
const { t } = useI18n()
const statusOptions = [
  { value: 'todo', label: t('ticketDetail.statusOptions.todo') },
  { value: 'in_progress', label: t('ticketDetail.statusOptions.in_progress') },
  { value: 'review', label: t('ticketDetail.statusOptions.review') },
  { value: 'done', label: t('ticketDetail.statusOptions.done') },
]

const xpReward = computed(() => PRIORITY_XP_MAP[ticket.value?.priority ?? 'medium'])
const assigneeName = computed(() => users.value.find((u) => u.id === ticket.value?.assigneeId)?.name)
const displayStatus = computed(() => statusOptions.find((s) => s.value === ticket.value?.status)?.label ?? t('ticketDetail.statusOptions.todo'))

const updateStatus = async (status: string) => {
  if (!ticket.value || !status) return
  await ticketsStore.updateTicketStatus(ticket.value.id, status as TicketStatus)
}

const updateAssignee = async (assigneeId: string) => {
  if (!ticket.value) return
  await ticketsStore.updateTicket(ticket.value.id, { assigneeId: assigneeId || undefined })
}

const assigneeSelectOptions = computed(() => [
  { value: '', label: t('ticketDetail.unassigned') },
  ...users.value.map((u) => ({ value: u.id, label: u.name }))
])

const addComment = async () => {
  if (!commentText.value || !ticket.value) return
  await ticketsStore.addComment(ticket.value.id, {
    author: auth.currentUser?.name ?? t('ticketDetail.unassigned'),
    text: commentText.value,
  })
  commentText.value = ''
}

const promptEditComment = async (comment: any) => {
  if (!ticket.value) return
  const next = window.prompt(t('ticketDetail.comments.editPrompt'), comment.text)
  if (next === null || next.trim() === '') return
  await ticketsStore.updateComment(ticket.value.id, comment.id, next.trim())
}

const confirmDeleteComment = async (comment: any) => {
  if (!ticket.value) return
  const ok = window.confirm(t('ticketDetail.comments.deleteConfirm'))
  if (!ok) return
  await ticketsStore.deleteComment(ticket.value.id, comment.id)
}

onMounted(async () => {
  loadingTicket.value = true
  try {
    await ticketsStore.fetchTicket(ticketId)
  } finally {
    loadingTicket.value = false
  }
})

const getInitials = (name?: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const getAvatarStyle = (name?: string) => {
  // Simple palette similar to other components
  if (!name) return { background: '#cbd5e1' } // slate-300
  const palette = [
    ['#6366F1', '#22D3EE'], // Indigo-Cyan
    ['#7C3AED', '#60A5FA'], // Violet-Blue
    ['#06B6D4', '#0EA5E9'], // Cyan-Sky
    ['#4F46E5', '#818CF8'], // Indigo-IndigoLight
  ]
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const colors = palette[hash % palette.length]
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
  }
}
</script>
