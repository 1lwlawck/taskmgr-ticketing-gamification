<template>
  <section v-if="ticket" class="space-y-6">
    <header class="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.3em] text-white/70">Ticket #{{ ticket.id }}</p>
          <h1 class="text-3xl font-semibold leading-tight">{{ ticket.title }}</h1>
          <p class="text-sm text-white/80">{{ ticket.description || 'No description provided yet.' }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            Status:
            <select
              :value="ticket.status"
              class="rounded-md border border-white/30 bg-white/15 px-3 py-1 text-white"
              @change="updateStatus"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value" class="text-slate-900">
                {{ option.label }}
              </option>
            </select>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            Priority:
            <span class="rounded-full bg-white/15 px-3 py-1 text-white">{{ ticket.priority }}</span>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            Type:
            <span class="rounded-full bg-white/15 px-3 py-1 text-white">{{ ticket.type }}</span>
          </span>
        </div>
      </div>
    </header>

    <div class="grid gap-4 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card lg:col-span-3">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-lg bg-slate-50 p-3">
            <p class="text-xs uppercase text-slate-500">Assignee</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="inline-block h-8 w-9 rounded-full bg-slate-200"></span>
              <div>
                <p class="text-slate-900">{{ assigneeName || 'Unassigned' }}</p>
                <select
                  :value="ticket.assigneeId || ''"
                  class="mt-1 rounded-md border border-slate-200 bg-white px-5 py-1 text-sm text-slate-700"
                  @change="updateAssignee"
                >
                  <option value="">Unassigned</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="rounded-lg bg-indigo-50 p-3">
            <p class="text-xs uppercase text-indigo-600">XP Reward</p>
            <p class="mt-2 text-3xl font-semibold text-indigo-900">{{ xpReward }} XP</p>
            <p class="text-xs text-indigo-700/80">Based on priority</p>
          </div>
          <div class="rounded-lg bg-emerald-50 p-3">
            <p class="text-xs uppercase text-emerald-600">Status</p>
            <p class="mt-2 text-xl font-semibold capitalize text-emerald-900">{{ displayStatus }}</p>
            <p class="text-xs text-emerald-700/80">Realtime updates</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p class="text-xs uppercase text-slate-500">Meta</p>
        <dl class="mt-3 space-y-2 text-sm text-slate-700">
          <div class="flex justify-between">
            <dt>Type</dt>
            <dd class="font-medium">{{ ticket.type }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Priority</dt>
            <dd class="font-medium capitalize">{{ ticket.priority }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Status</dt>
            <dd class="font-medium capitalize">{{ displayStatus }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Assignee</dt>
            <dd class="font-medium">{{ assigneeName || 'Unassigned' }}</dd>
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
          {{ tab }}
        </button>
      </div>
      <div class="p-4 text-sm text-slate-700">
        <div v-if="activeTab === 'Overview'" class="space-y-2 leading-relaxed">
          <p>{{ ticket.description || 'No description yet.' }}</p>
        </div>
        <div v-else-if="activeTab === 'Comments'" class="space-y-4">
          <ul class="space-y-3">
            <li v-for="comment in ticket.comments" :key="comment.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-slate-900">{{ comment.author }}</p>
                  <p class="text-slate-600">{{ comment.text }}</p>
                  <p class="text-xs text-slate-500">{{ comment.timestamp }}</p>
                </div>
                <div v-if="comment.authorId === auth.currentUser?.id" class="flex gap-2 text-xs">
                  <button class="text-indigo-600 hover:underline" @click="promptEditComment(comment)">Edit</button>
                  <button class="text-rose-600 hover:underline" @click="confirmDeleteComment(comment)">Delete</button>
                </div>
              </div>
            </li>
            <li v-if="ticket.comments.length === 0" class="text-slate-400">No comments yet.</li>
          </ul>
          <form class="space-y-2" @submit.prevent="addComment">
            <textarea
              v-model="commentText"
              rows="3"
              class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900"
              placeholder="Share an update..."
            ></textarea>
            <button class="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">Post comment</button>
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
  <p v-else class="text-slate-500">Ticket not found.</p>
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

const route = useRoute()
const ticketsStore = useTicketsStore()
const ticketId = route.params.id as string
const ticket = computed(() => ticketsStore.getById(ticketId))
const tabs = ['Overview', 'Comments', 'History']
const activeTab = ref('Overview')
const commentText = ref('')
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const auth = useAuthStore()
const statusOptions = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const xpReward = computed(() => PRIORITY_XP_MAP[ticket.value?.priority ?? 'medium'])
const assigneeName = computed(() => users.value.find((u) => u.id === ticket.value?.assigneeId)?.name)
const displayStatus = computed(() => statusOptions.find((s) => s.value === ticket.value?.status)?.label ?? 'Todo')

const updateStatus = async (event: Event) => {
  const status = (event.target as HTMLSelectElement | null)?.value as TicketStatus | undefined
  if (!ticket.value) return
  if (!status) return
  await ticketsStore.updateTicketStatus(ticket.value.id, status)
}

const updateAssignee = async (event: Event) => {
  const assigneeId = (event.target as HTMLSelectElement | null)?.value
  if (!ticket.value) return
  if (!assigneeId) return
  await ticketsStore.updateTicket(ticket.value.id, { assigneeId })
}

const addComment = async () => {
  if (!commentText.value || !ticket.value) return
  await ticketsStore.addComment(ticket.value.id, {
    author: auth.currentUser?.name ?? 'Unknown',
    text: commentText.value,
  })
  commentText.value = ''
}

const promptEditComment = async (comment: any) => {
  if (!ticket.value) return
  const next = window.prompt('Edit comment', comment.text)
  if (next === null || next.trim() === '') return
  await ticketsStore.updateComment(ticket.value.id, comment.id, next.trim())
}

const confirmDeleteComment = async (comment: any) => {
  if (!ticket.value) return
  const ok = window.confirm('Delete this comment?')
  if (!ok) return
  await ticketsStore.deleteComment(ticket.value.id, comment.id)
}

onMounted(() => {
  ticketsStore.fetchTicket(ticketId)
})
</script>
