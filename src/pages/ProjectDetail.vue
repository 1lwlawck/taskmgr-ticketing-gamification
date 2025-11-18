<template>
  <section v-if="project" class="grid gap-6 lg:grid-cols-[260px_1fr_260px]">
    <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-card">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">Members</h2>
        <button class="text-xs text-slate-500 underline" @click="showInvite = true">Invite</button>
      </div>
      <div class="space-y-3">
        <div
          v-for="member in project.members"
          :key="member.id"
          class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <div>
            <p class="text-sm text-slate-900">{{ resolveUser(member.id)?.name ?? member.name }}</p>
            <p class="text-xs uppercase text-slate-500">{{ member.role }}</p>
          </div>
          <span class="text-xl text-slate-400">•</span>
        </div>
      </div>
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        <p>Active invites</p>
        <ul class="mt-2 space-y-1">
          <li v-for="invite in project.invites" :key="invite.code" class="flex justify-between text-slate-600">
            <span>{{ invite.code }}</span>
            <span>{{ invite.uses }}/{{ invite.maxUses }}</span>
          </li>
          <li v-if="project.invites.length === 0" class="text-slate-400">None yet</li>
        </ul>
      </div>
    </div>

    <div class="space-y-4">
      <header>
        <h1 class="text-2xl font-semibold text-slate-900">{{ project.name }}</h1>
        <p class="text-sm text-slate-500">{{ project.description }}</p>
      </header>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="status in statuses"
          :key="status.value"
          class="rounded-xl border border-slate-200 bg-white p-3 shadow-card"
        >
          <div class="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span class="font-semibold uppercase text-slate-700">{{ status.label }}</span>
            <span>{{ ticketsByStatus(status.value).length }}</span>
          </div>
          <div :ref="setColumnRef(status.value)" class="space-y-3" :data-status="status.value">
            <article
              v-for="ticket in ticketsByStatus(status.value)"
              :key="ticket.id"
              class="cursor-grab rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
              :data-id="ticket.id"
            >
              <p class="font-semibold text-slate-900">{{ ticket.title }}</p>
              <p class="text-xs text-slate-500">{{ ticket.priority }} • {{ ticket.type }}</p>
              <button class="mt-2 text-xs text-slate-700 underline" @click="openTicket(ticket.id)">Open</button>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-card">
      <h2 class="text-lg font-semibold text-slate-900">Activity</h2>
      <ul class="space-y-3">
        <li v-for="item in project.activity" :key="item.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p class="text-slate-700">{{ item.text }}</p>
          <p class="text-xs text-slate-500">{{ item.timestamp }}</p>
        </li>
      </ul>
    </div>

    <InviteModal :open="showInvite" :invite-code="latestInvite" @close="showInvite = false" @generate="generateInvite" />
  </section>
  <p v-else class="text-slate-500">Project not found.</p>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import InviteModal from '@/components/InviteModal.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { TICKET_STATUSES } from '@/utils/constants'

const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()
const usersStore = useUsersStore()
const showInvite = ref(false)
const columnRefs = reactive({})
const sortables = []
const auth = useAuthStore()

const project = computed(() => projectsStore.getById(route.params.id))
const statuses = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
]

const ticketsByStatus = (status) => {
  const boardIds = project.value?.board?.[status] ?? []
  return boardIds.map((id) => ticketsStore.getById(id)).filter(Boolean)
}

const setColumnRef = (status) => (el) => {
  if (el) columnRefs[status] = el
}

const initSortable = () => {
  destroySortable()
  TICKET_STATUSES.forEach((status) => {
    const el = columnRefs[status]
    if (!el) return
    const sortable = new Sortable(el, {
      group: 'tickets',
      animation: 150,
      onEnd: (evt) => handleDrop(evt, status),
    })
    sortables.push(sortable)
  })
}

const destroySortable = () => {
  while (sortables.length) {
    const instance = sortables.pop()
    instance?.destroy()
  }
}

const handleDrop = (evt, status) => {
  const ticketId = evt.item?.dataset?.id
  if (!ticketId || evt.from.dataset.status === status) return
  ticketsStore.updateTicketStatus(ticketId, status, auth.currentUser?.id)
}

const openTicket = (ticketId) => router.push(`/tickets/${ticketId}`)

watch(
  () => project.value?.board,
  () => {
    nextTick(() => initSortable())
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => initSortable())
})

onBeforeUnmount(() => destroySortable())

const generateInvite = ({ maxUses, expiryDays }) => {
  if (!project.value) return
  const invite = projectsStore.generateInvite(project.value.id, { maxUses, expiryDays })
  latestInvite.value = invite?.code ?? ''
  showInvite.value = false
}

const latestInvite = ref('')

const resolveUser = (id) => usersStore.getById(id)
</script>
