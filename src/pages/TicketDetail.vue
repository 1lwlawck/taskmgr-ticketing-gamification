<template>
  <section v-if="ticket" class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div>
        <p class="text-xs uppercase text-slate-400">Ticket #{{ ticket.id }}</p>
        <h1 class="text-2xl font-semibold text-slate-900">{{ ticket.title }}</h1>
      </div>
      <div class="flex gap-3 text-sm text-slate-600">
        <select :value="ticket.status" class="rounded-md border border-slate-200 bg-white px-3 py-2" @change="updateStatus($event.target.value)">
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select :value="ticket.assigneeId" class="rounded-md border border-slate-200 bg-white px-3 py-2" @change="updateAssignee($event.target.value)">
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
      </div>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <p class="text-sm text-slate-500">Priority: <span class="font-semibold text-slate-900">{{ ticket.priority }}</span></p>
      <p class="text-sm text-slate-500">Type: <span class="font-semibold text-slate-900">{{ ticket.type }}</span></p>
      <p class="text-sm text-slate-500">XP Reward: <span class="font-semibold text-slate-900">{{ xpReward }} XP</span></p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white shadow-card">
      <div class="flex gap-4 border-b border-slate-200 px-4 py-3 text-sm">
        <button v-for="tab in tabs" :key="tab" class="pb-2" :class="activeTab === tab ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>
      <div class="p-4 text-sm text-slate-700">
        <div v-if="activeTab === 'Overview'">
          <p>{{ ticket.description }}</p>
        </div>
        <div v-else-if="activeTab === 'Comments'" class="space-y-4">
          <ul class="space-y-3">
            <li v-for="comment in ticket.comments" :key="comment.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="text-slate-900">{{ comment.author }}</p>
              <p class="text-slate-600">{{ comment.text }}</p>
              <p class="text-xs text-slate-500">{{ comment.timestamp }}</p>
            </li>
            <li v-if="ticket.comments.length === 0" class="text-slate-400">No comments yet.</li>
          </ul>
          <form class="space-y-2" @submit.prevent="addComment">
            <textarea v-model="commentText" rows="3" class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900" placeholder="Share an update..."></textarea>
            <button class="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">Post comment</button>
          </form>
        </div>
        <div v-else class="space-y-2">
          <div v-for="item in ticket.history" :key="item.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-slate-800">{{ item.text }}</p>
            <p class="text-xs text-slate-500">{{ item.timestamp }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <p v-else class="text-slate-500">Ticket not found.</p>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { PRIORITY_XP_MAP } from '@/utils/constants'

const route = useRoute()
const ticketsStore = useTicketsStore()
const ticket = computed(() => ticketsStore.getById(route.params.id))
const tabs = ['Overview', 'Comments', 'History']
const activeTab = ref('Overview')
const commentText = ref('')
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const auth = useAuthStore()

const xpReward = computed(() => PRIORITY_XP_MAP[ticket.value?.priority ?? 'medium'])

const updateStatus = (status) => {
  ticketsStore.updateTicketStatus(ticket.value.id, status, auth.currentUser?.id)
}

const updateAssignee = (assigneeId) => {
  const assignee = users.value.find((user) => user.id === assigneeId)
  if (!assignee) return
  ticketsStore.updateTicket(ticket.value.id, { assigneeId: assignee.id, assigneeName: assignee.name })
}

const addComment = () => {
  if (!commentText.value || !ticket.value) return
  ticketsStore.addComment(ticket.value.id, {
    author: auth.currentUser?.name ?? 'Unknown',
    text: commentText.value,
  })
  commentText.value = ''
}
</script>
