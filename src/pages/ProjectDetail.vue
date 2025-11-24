<template>
  <section v-if="project" class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ projectStatusLabel }}</p>
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <h1 class="text-3xl font-semibold">{{ project.name }}</h1>
              <p class="text-sm text-white/70">{{ project.description }}</p>
            </div>
            <span class="rounded-full border border-white/30 px-3 py-1 text-xs uppercase">{{ boardHealth }}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-sm">
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">Members</p>
              <p class="text-3xl font-semibold">{{ memberCount }}</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">Tickets</p>
              <p class="text-3xl font-semibold">{{ totalTickets }}</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">Open</p>
              <p class="text-3xl font-semibold">{{ openTickets }}</p>
            </div>
          </div>
        </div>
        <div class="grid gap-4 text-sm md:grid-cols-3">
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-xs uppercase text-white/60">Last activity</p>
            <p class="text-lg font-semibold">{{ lastActivity?.text ?? 'Belum ada aktivitas' }}</p>
            <p class="text-xs text-white/70">{{ lastActivity?.timestamp ?? '-' }}</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-xs uppercase text-white/60">Invites</p>
            <p class="text-3xl font-semibold">{{ project.invites.length }}</p>
            <p class="text-xs text-white/70">Aktif saat ini</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-xs uppercase text-white/60">Aksi</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" class="border border-white/30 bg-white/15 text-white hover:bg-white/25" @click="showInvite = true">
                Invite
              </Button>
              <RouterLink to="/tickets">
                <Button variant="ghost" size="sm" class="text-white hover:bg-white/10">Tiket</Button>
              </RouterLink>
              <Button
                v-if="canLeaveProject"
                variant="destructive"
                size="sm"
                class="bg-rose-500 text-white hover:bg-rose-600"
                @click="confirmLeaveProject"
              >
                Leave
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[300px_1fr_280px]">
      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Squad</p>
              <h2 class="text-lg font-semibold text-foreground">Anggota</h2>
            </div>
            <Button variant="ghost" size="sm" class="text-muted-foreground" @click="showInvite = true">Invite</Button>
          </div>
          <div class="mt-4 space-y-3">
            <div
              v-for="member in project.members"
              :key="member.id"
              class="flex items-center justify-between rounded-2xl border border-muted bg-muted/60 px-3 py-2 text-sm"
            >
              <div>
                <p class="font-semibold text-foreground">{{ resolveUser(member.id)?.name ?? member.name }}</p>
                <p class="text-xs uppercase text-muted-foreground">{{ member.role }}</p>
              </div>
              <span class="text-xs text-muted-foreground">{{ statsBadge(member) }}</span>
            </div>
            <p v-if="project.members.length === 0" class="text-sm text-muted-foreground">Belum ada anggota.</p>
          </div>
        </div>

        <div class="rounded-3xl border border-border bg-card p-5 text-sm">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Active invites</p>
          <ul class="mt-3 space-y-2">
            <li v-for="invite in project.invites" :key="invite.code" class="flex items-center justify-between rounded-2xl border border-muted bg-muted/40 px-3 py-2">
              <span class="font-mono text-foreground">{{ invite.code }}</span>
              <span class="text-xs text-muted-foreground">{{ invite.uses }}/{{ invite.maxUses }}</span>
            </li>
            <li v-if="project.invites.length === 0" class="text-xs text-muted-foreground">Belum ada kode.</li>
          </ul>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Board</p>
            <h2 class="text-xl font-semibold text-foreground">Ticket pipeline</h2>
          </div>
          <p class="text-xs text-muted-foreground">{{ totalTickets }} tickets · {{ openTickets }} open</p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="status in statuses"
            :key="status.value"
            class="rounded-2xl border border-border bg-background/80 p-4 shadow-card"
          >
            <div class="mb-4 flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span class="font-semibold text-foreground">{{ status.label }}</span>
              <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">{{ ticketsByStatus(status.value).length }}</span>
            </div>
            <div :ref="setColumnRef(status.value)" class="space-y-3" :data-status="status.value">
              <article
                v-for="ticket in ticketsByStatus(status.value)"
                :key="ticket.id"
                class="cursor-grab rounded-2xl border border-border bg-white/95 p-4 text-sm shadow-sm transition hover:border-primary/50 hover:shadow-lg"
                :data-id="ticket.id"
              >
                <p class="font-semibold text-foreground">{{ ticket.title }}</p>
                <p class="text-xs text-muted-foreground capitalize">{{ ticket.priority }} / {{ ticket.type }}</p>
                <p v-if="ticket.epicTitle" class="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 mr-2">
                  Epic: {{ ticket.epicTitle }}
                </p>
                <button class="mt-2 text-xs text-primary underline" @click="openTicket(ticket.id)">Open ticket</button>
              </article>
              <p v-if="ticketsByStatus(status.value).length === 0" class="text-xs text-muted-foreground">Belum ada tiket.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Activity</p>
          <ul class="mt-4 space-y-3">
            <li v-for="item in project.activity" :key="item.id" class="rounded-2xl border border-muted bg-muted/40 p-3 text-sm">
              <p class="font-semibold text-foreground">{{ item.text }}</p>
              <p class="text-xs text-muted-foreground">{{ item.timestamp }}</p>
            </li>
            <li v-if="project.activity.length === 0" class="text-sm text-muted-foreground">Belum ada aktivitas.</li>
          </ul>
        </div>
      </div>
    </div>

    <InviteModal :open="showInvite" :invite-code="latestInvite" @close="showInvite = false" @generate="generateInvite" />
  </section>
  <p v-else class="text-slate-500">Project not found.</p>

  <div v-if="showLeaveConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
    <div class="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-sm shadow-2xl">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Leave</p>
          <h2 class="text-xl font-semibold text-foreground">{{ project?.name }}</h2>
        </div>
        <button class="text-sm text-muted-foreground" @click="cancelLeaveProject">Close</button>
      </div>
      <p class="mt-4 text-sm text-muted-foreground">
        Are you sure you want to leave this project? You will lose access until invited again.
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" class="text-muted-foreground" @click="cancelLeaveProject">Cancel</Button>
        <Button type="button" variant="destructive" size="sm" @click="leaveProject">Leave project</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Sortable, { SortableEvent } from 'sortablejs'
import InviteModal from '@/components/molecules/InviteModal.vue'
import { Button } from '@/components/atoms/ui/button'
import { useProjectsStore } from '@/stores/projects'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useEpicsStore } from '@/stores/epics'
import { TICKET_STATUSES, type TicketStatus } from '@/utils/constants'
import type { ProjectInvitePayload, ProjectMember, Ticket } from '@/types/models'

defineOptions({ inheritAttrs: false })

const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()
const ticketsStore = useTicketsStore()
const usersStore = useUsersStore()
const gamificationStore = useGamificationStore()
const epicsStore = useEpicsStore()
const showInvite = ref(false)
const showLeaveConfirm = ref(false)
const columnRefs = reactive<Record<string, HTMLElement | null>>({})
const sortables: Sortable[] = []
const auth = useAuthStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectsStore.getById(projectId.value))
const isMember = computed(() => {
  if (!auth.currentUser || !project.value) return false
  return project.value.members.some((member) => member.id === auth.currentUser?.id)
})
const canLeaveProject = computed(() => isMember.value)
const statuses: Array<{ label: string; value: TicketStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
]

const ticketsByStatus = (status: TicketStatus) => {
  const boardIds = project.value?.board?.[status] ?? []
  return boardIds
    .map((id) => ticketsStore.getById(id))
    .filter((ticket): ticket is Ticket => Boolean(ticket))
    .map((ticket) => ({
      ...ticket,
      epicTitle: ticket.epicId ? resolveEpicTitle(ticket.epicId) : undefined,
    }))
}

const setColumnRef = (status: TicketStatus) => (el: HTMLElement | null) => {
  if (el) columnRefs[status] = el
}

const initSortable = () => {
  destroySortable()
  TICKET_STATUSES.forEach((status) => {
    const el = columnRefs[status]
    if (!el) return
    const sortable = new Sortable(el, {
      group: 'project-board',
      animation: 180,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (evt) => handleDrop(evt),
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

const handleDrop = async (evt: SortableEvent) => {
  const ticketId = evt.item?.dataset?.id
  const fromStatus = evt.from?.dataset?.status as TicketStatus | undefined
  const toStatus = evt.to?.dataset?.status as TicketStatus | undefined
  if (!ticketId || !toStatus || fromStatus === toStatus) return
  await ticketsStore.updateTicketStatus(ticketId, toStatus)
}

const openTicket = (ticketId: string) => router.push(`/tickets/${ticketId}`)

watch(
  () => project.value?.board,
  () => {
    nextTick(() => initSortable())
  },
  { deep: true }
)

const loadProject = async () => {
  if (!projectId.value) return
  try {
    await projectsStore.fetchProject(projectId.value)
  } catch (error) {
    console.error('Failed to load project', error)
  }
}

onMounted(async () => {
  await loadProject()
  nextTick(() => initSortable())
})

watch(
  () => projectId.value,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await loadProject()
    }
  }
)

onBeforeUnmount(() => destroySortable())

const generateInvite = async ({ maxUses, expiryDays }: ProjectInvitePayload) => {
  if (!project.value) return
  const invite = await projectsStore.generateInvite(project.value.id, { maxUses, expiryDays })
  latestInvite.value = invite?.code ?? ''
  showInvite.value = false
}

const latestInvite = ref('')

const resolveUser = (id: string) => usersStore.getById(id)

const memberCount = computed(() => project.value?.members?.length ?? 0)
const totalTickets = computed(() =>
  statuses.reduce((sum, status) => sum + ticketsByStatus(status.value).length, 0)
)
const openTickets = computed(() =>
  statuses
    .filter((status) => status.value !== 'done')
    .reduce((sum, status) => sum + ticketsByStatus(status.value).length, 0)
)
const lastActivity = computed(() => project.value?.activity?.[0] ?? null)
const projectStatusLabel = computed(() => project.value?.status ?? 'Active')
const boardHealth = computed(() => {
  if (!totalTickets.value) return 'No tickets'
  const ratio = openTickets.value / totalTickets.value
  if (ratio > 0.75) return 'High load'
  if (ratio > 0.4) return 'Balanced'
  return 'Chill'
})
const statsBadge = (member: ProjectMember) => (member.role === 'admin' ? 'Owner' : 'Member')
const resolveEpicTitle = (epicId: string) => {
  const epic = epicsStore.items.find((e) => e.id === epicId)
  return epic?.title
}

const confirmLeaveProject = () => {
  showLeaveConfirm.value = true
}

const cancelLeaveProject = () => {
  showLeaveConfirm.value = false
}

const leaveProject = async () => {
  if (!project.value) return
  try {
    await projectsStore.leaveProject(project.value.id)
    gamificationStore.pushToast({
      title: 'Left project',
      message: `You left ${project.value.name}`,
    })
    showLeaveConfirm.value = false
    router.push('/projects')
  } catch (error) {
    gamificationStore.pushToast({
      title: 'Failed to leave project',
      message: error instanceof Error ? error.message : 'Please try again later',
    })
  }
}
</script>

<style scoped>
.sortable-ghost {
  opacity: 0.6;
  transform: scale(0.98);
}
.sortable-chosen {
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
}
.sortable-drag {
  cursor: grabbing !important;
}
</style>
