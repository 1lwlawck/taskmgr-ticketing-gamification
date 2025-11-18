<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Tickets</h1>
        <p class="text-sm text-slate-500">Manage work, update status, and review XP impact.</p>
      </div>
      <button class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm" @click="openCreate">New Ticket</button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Priority</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Assignee</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-600">
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td class="px-4 py-3">
              <button class="text-left font-medium text-slate-900 underline" @click="openDetail(ticket.id)">{{ ticket.title }}</button>
              <p class="text-xs text-slate-400">Due {{ ticket.dueDate }}</p>
            </td>
            <td class="px-4 py-3 capitalize text-slate-700">{{ ticket.priority }}</td>
            <td class="px-4 py-3 capitalize text-slate-700">{{ ticket.status.replace('_', ' ') }}</td>
            <td class="px-4 py-3 text-slate-700">{{ ticket.assigneeName }}</td>
            <td class="px-4 py-3 text-right">
              <button class="text-xs text-slate-600 underline" @click="editTicket(ticket)">Edit</button>
              <button class="ml-3 text-xs text-slate-400 hover:text-slate-900" @click="promptDelete(ticket)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur">
      <div class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-xl">
        <h2 class="text-xl font-semibold text-slate-900">{{ editing ? 'Edit ticket' : 'New ticket' }}</h2>
        <form class="mt-4 grid gap-4 sm:grid-cols-2" @submit.prevent="handleSubmit">
          <label class="sm:col-span-2">
            <span class="text-xs uppercase text-slate-500">Title</span>
            <input v-model="form.title" required class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900" />
          </label>
          <label class="sm:col-span-2">
            <span class="text-xs uppercase text-slate-500">Description</span>
            <textarea v-model="form.description" rows="3" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900"></textarea>
          </label>
          <label>
            <span class="text-xs uppercase text-slate-500">Priority</span>
            <select v-model="form.priority" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>
            <span class="text-xs uppercase text-slate-500">Type</span>
            <select v-model="form.type" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900">
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="chore">Chore</option>
            </select>
          </label>
          <label>
            <span class="text-xs uppercase text-slate-500">Assignee</span>
            <select v-model="form.assigneeId" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900">
              <option :value="user.id" v-for="user in users" :key="user.id">{{ user.name }}</option>
            </select>
          </label>
          <label>
            <span class="text-xs uppercase text-slate-500">Due Date</span>
            <input type="date" v-model="form.dueDate" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900" />
          </label>
          <label>
            <span class="text-xs uppercase text-slate-500">Project</span>
            <select v-model="form.projectId" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900">
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
          </label>
          <div class="sm:col-span-2 flex justify-end gap-2">
            <button type="button" class="rounded-md px-4 py-2 text-slate-400" @click="closeModal">Cancel</button>
            <button type="submit" class="rounded-md bg-slate-900 px-4 py-2 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal :open="Boolean(confirming)" title="Delete ticket" message="This action cannot be undone." @cancel="confirming = null" @confirm="deleteTicket" />
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useProjectsStore } from '@/stores/projects'

const router = useRouter()
const ticketsStore = useTicketsStore()
const { tickets } = storeToRefs(ticketsStore)
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)
const showModal = ref(false)
const editing = ref(false)
const editingId = ref(null)
const confirming = ref(null)
const defaultProjectId = () => projects.value[0]?.id ?? 'project-core'
const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  type: 'feature',
  assigneeId: '',
  dueDate: '',
  projectId: defaultProjectId(),
})

const openDetail = (id) => router.push(`/tickets/${id}`)

const openCreate = () => {
  editing.value = false
  editingId.value = null
  Object.assign(form, {
    title: '',
    description: '',
    priority: 'medium',
    type: 'feature',
    assigneeId: users.value[0]?.id ?? '',
    dueDate: '',
    projectId: defaultProjectId(),
  })
  showModal.value = true
}

const editTicket = (ticket) => {
  editing.value = true
  editingId.value = ticket.id
  Object.assign(form, {
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    type: ticket.type,
    assigneeId: ticket.assigneeId,
    dueDate: ticket.dueDate,
    projectId: ticket.projectId,
  })
  showModal.value = true
}

const handleSubmit = () => {
  const assignee = users.value.find((user) => user.id === form.assigneeId)
  if (editing.value) {
    ticketsStore.updateTicket(editingId.value, {
      ...form,
      assigneeName: assignee?.name,
    })
  } else {
    ticketsStore.createTicket({
      ...form,
      assigneeName: assignee?.name,
      createdBy: assignee?.id,
    })
  }
  closeModal()
}

const closeModal = () => {
  showModal.value = false
}

const promptDelete = (ticket) => {
  confirming.value = ticket
}

const deleteTicket = () => {
  if (!confirming.value) return
  ticketsStore.deleteTicket(confirming.value.id)
  confirming.value = null
}
</script>
