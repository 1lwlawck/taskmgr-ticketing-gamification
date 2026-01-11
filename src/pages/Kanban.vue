<template>
  <section class="space-y-6">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('kanban.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('kanban.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('kanban.heroDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <Select
        v-model="selectedProjectId"
        :options="projectOptions"
        :placeholder="t('kanban.allProjects')"
        class="min-w-[200px]"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="column in columns"
        :key="column.status"
        class="min-w-[300px] flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <!-- Column Header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="['h-3 w-3 rounded-full', column.color]"></div>
            <h3 class="font-semibold text-foreground">{{ column.label }}</h3>
          </div>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {{ getTicketsByStatus(column.status).length }}
          </span>
        </div>

        <!-- Tickets -->
        <div class="space-y-3">
          <div
            v-for="ticket in getTicketsByStatus(column.status)"
            :key="ticket.id"
            draggable="true"
            @dragstart="handleDragStart($event, ticket)"
            @dragend="handleDragEnd"
            class="cursor-move rounded-xl border border-border bg-background p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-2 flex items-start justify-between">
              <h4 class="font-medium text-foreground line-clamp-2">{{ ticket.title }}</h4>
              <span :class="['ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium', getPriorityClass(ticket.priority)]">
                {{ ticket.priority }}
              </span>
            </div>
            <p v-if="ticket.description" class="mb-3 text-sm text-muted-foreground line-clamp-2">
              {{ ticket.description }}
            </p>
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span v-if="ticket.assigneeName" class="flex items-center gap-1">
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-600">
                  {{ ticket.assigneeName.charAt(0) }}
                </div>
                {{ ticket.assigneeName }}
              </span>
              <span v-else>{{ t('kanban.unassigned') }}</span>
              <span v-if="ticket.dueDate" :class="isOverdue(ticket.dueDate) ? 'text-red-500' : ''">
                {{ formatDate(ticket.dueDate) }}
              </span>
            </div>
          </div>

          <!-- Drop Zone -->
          <div
            @dragover.prevent="handleDragOver($event, column.status)"
            @drop="handleDrop($event, column.status)"
            :class="[
              'rounded-xl border-2 border-dashed p-4 text-center text-sm transition',
              dragOverStatus === column.status ? 'border-indigo-400 bg-indigo-50' : 'border-border',
            ]"
          >
            <span class="text-muted-foreground">{{ t('kanban.dropHere') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'
import { useProjectsStore } from '@/stores/projects'
import Select from '@/components/ui/select/Select.vue'
import type { Ticket } from '@/types/models'
import type { TicketStatus } from '@/utils/constants'

const { t } = useI18n()
const ticketsStore = useTicketsStore()
const projectsStore = useProjectsStore()

const { tickets, loading } = storeToRefs(ticketsStore)
const { projects } = storeToRefs(projectsStore)

const selectedProjectId = ref('')
const draggedTicket = ref<Ticket | null>(null)
const dragOverStatus = ref<string | null>(null)

const projectOptions = computed(() => [
  { value: '', label: t('kanban.allProjects') },
  ...projects.value.map((p) => ({ value: p.id, label: p.name }))
])

const columns = [
  { status: 'backlog', label: 'Backlog', color: 'bg-slate-400' },
  { status: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'review', label: 'Review', color: 'bg-purple-500' },
  { status: 'done', label: 'Done', color: 'bg-emerald-500' },
]

const filteredTickets = computed(() => {
  if (!selectedProjectId.value) return tickets.value
  return tickets.value.filter((t) => t.projectId === selectedProjectId.value)
})

function getTicketsByStatus(status: string) {
  return filteredTickets.value.filter((t) => t.status === status)
}

function getPriorityClass(priority: string) {
  const classes: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-amber-100 text-amber-600',
    urgent: 'bg-red-100 text-red-600',
  }
  return classes[priority] || 'bg-slate-100 text-slate-600'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date()
}

function handleDragStart(event: DragEvent, ticket: Ticket) {
  draggedTicket.value = ticket
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', ticket.id)
  }
}

function handleDragEnd() {
  draggedTicket.value = null
  dragOverStatus.value = null
}

function handleDragOver(event: DragEvent, status: string) {
  event.preventDefault()
  dragOverStatus.value = status
}

async function handleDrop(event: DragEvent, newStatus: string) {
  event.preventDefault()
  dragOverStatus.value = null
  
  if (!draggedTicket.value || draggedTicket.value.status === newStatus) return
  
  try {
    await ticketsStore.updateTicketStatus(draggedTicket.value.id, newStatus as TicketStatus)
  } catch (e) {
    console.error('Failed to update ticket status:', e)
  }
  
  draggedTicket.value = null
}

watch(selectedProjectId, () => {
  ticketsStore.fetchTicketsWithFilters({ projectId: selectedProjectId.value || undefined, force: true })
})

onMounted(async () => {
  await Promise.all([
    ticketsStore.fetchTickets(true),
    projectsStore.fetchProjects(),
  ])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
