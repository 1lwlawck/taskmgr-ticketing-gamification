<template>
  <section class="space-y-8">
    <div v-if="notFound" class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow">
      Epic tidak ditemukan atau kamu tidak punya akses.
      <RouterLink to="/epics" class="ml-2 underline">Kembali ke daftar epics</RouterLink>
    </div>
    <template v-else>
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/60">Epic</p>
          <h1 class="text-3xl font-semibold">{{ epic?.title ?? 'Loading...' }}</h1>
          <p class="text-sm text-white/70">{{ epic?.description || 'No description' }}</p>
          <div class="flex flex-wrap gap-4 text-sm">
            <div>
              <p class="text-xs uppercase text-white/60">Status</p>
              <p class="text-lg font-semibold capitalize">{{ epic?.status?.replace('_', ' ') ?? '-' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-white/60">Progress</p>
              <p class="text-lg font-semibold">{{ progress }}%</p>
            </div>
            <div>
              <p class="text-xs uppercase text-white/60">Dates</p>
              <p class="text-lg font-semibold">
                {{ dateLabel(epic?.startDate) }} → {{ dateLabel(epic?.dueDate) }}
              </p>
            </div>
          </div>
        </div>
        <RouterLink to="/epics">
          <button class="rounded-2xl border border-white/30 bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/25">
            ← Back to epics
          </button>
        </RouterLink>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
      <div class="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tickets</p>
            <h2 class="text-lg font-semibold text-foreground">Belongs to this epic</h2>
          </div>
          <span class="text-xs text-muted-foreground">{{ epicTickets.length }} items</span>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="ticket in epicTickets"
            :key="ticket.id"
            class="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:shadow"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-foreground">{{ ticket.title }}</p>
                <p class="text-xs text-muted-foreground">{{ ticket.description || 'No description' }}</p>
                <p class="text-[11px] text-muted-foreground">
                  Status: <span class="capitalize">{{ ticket.status.replace('_', ' ') }}</span> · Priority: <span class="capitalize">{{ ticket.priority }}</span>
                </p>
              </div>
              <RouterLink :to="`/tickets/${ticket.id}`" class="text-xs text-primary underline">View</RouterLink>
            </div>
          </div>
          <p v-if="!epicTickets.length" class="text-sm text-muted-foreground">No tickets linked to this epic yet.</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card text-sm">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Summary</p>
          <div class="mt-3 space-y-2 text-foreground">
            <div class="flex items-center justify-between">
              <span>Total tickets</span>
              <span class="font-semibold">{{ epic?.totalCount ?? epicTickets.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Done</span>
              <span class="font-semibold">{{ epic?.doneCount ?? doneTickets }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>In progress</span>
              <span class="font-semibold">{{ inProgressTickets }}</span>
            </div>
          </div>
          <div class="mt-4 h-2 rounded-full bg-slate-200">
            <span class="block h-full rounded-full bg-indigo-500" :style="{ width: progress + '%' }"></span>
          </div>
        </div>
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card text-sm text-muted-foreground">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tips</p>
          <ul class="mt-2 list-disc space-y-1 pl-4">
            <li>Link tickets to the epic via the ticket modal.</li>
            <li>Backlog status cocok untuk draft sebelum dikerjakan.</li>
            <li>Isi start/due untuk memunculkan radar deadline.</li>
          </ul>
        </div>
      </div>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEpicsStore } from '@/stores/epics'
import { useTicketsStore } from '@/stores/tickets'
import { formatDate } from '@/utils/helpers'

const route = useRoute()
const epicId = route.params.id as string

const epicsStore = useEpicsStore()
const ticketsStore = useTicketsStore()
const { tickets } = storeToRefs(ticketsStore)

const epic = ref<any>(null)
const notFound = ref(false)

const epicTickets = computed(() => tickets.value.filter((t) => t.epicId === epicId))
const doneTickets = computed(() => epicTickets.value.filter((t) => t.status === 'done').length)
const inProgressTickets = computed(() =>
  epicTickets.value.filter((t) => ['in_progress', 'review'].includes(t.status)).length
)
const progress = computed(() => {
  const total = epic.value?.totalCount ?? epicTickets.value.length
  const done = epic.value?.doneCount ?? doneTickets.value
  if (!total) return 0
  return Math.round((done / total) * 100)
})

const dateLabel = (value?: string) => (value ? formatDate(value) : '-')

const load = async () => {
  await Promise.allSettled([
    ticketsStore.fetchTicketsByEpic(epicId),
    ticketsStore.fetchTickets(true),
    epicsStore.fetchEpic(epicId),
  ])
  const epicData = epicsStore.items.find((e) => e.id === epicId) || null
  epic.value = epicData
  if (!epicData) {
    notFound.value = true
  }
}

onMounted(() => {
  load()
})
</script>
