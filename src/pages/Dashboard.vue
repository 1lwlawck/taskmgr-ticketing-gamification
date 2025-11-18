<template>
  <section class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-24 top-6 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-10 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-6">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.4em] text-white/60">Mission control</p>
            <h1 class="text-3xl font-semibold">Stay sharp, {{ currentUser?.name ?? 'Operator' }}</h1>
            <p class="text-sm text-white/70">
              You're {{ xpProgress }}% toward level {{ (stats?.level ?? 1) + 1 }}. Keep pushing to secure the {{ levelBadge }} badge.
            </p>
          </div>
          <div class="flex flex-wrap gap-6 text-sm">
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">Current level</p>
              <p class="text-3xl font-semibold">{{ stats?.level ?? 1 }}</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">Badge</p>
              <p class="text-lg font-medium">{{ levelBadge }}</p>
            </div>
            <div class="min-w-[140px]">
              <p class="text-xs uppercase text-white/60">Next unlock</p>
              <p class="text-lg font-medium">{{ xpToNext }} XP to go</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink to="/tickets">
              <Button variant="secondary" size="sm" class="border border-white/20 bg-white/10 text-white hover:bg-white/20">
                Review tickets
              </Button>
            </RouterLink>
            <RouterLink to="/projects">
              <Button variant="ghost" size="sm" class="text-white hover:bg-white/10">
                Jump to projects
              </Button>
            </RouterLink>
          </div>
        </div>
        <div class="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 shadow-lg backdrop-blur">
          <div class="mb-3 flex items-center justify-between text-sm text-white/70">
            <span>XP progress</span>
            <span>{{ stats?.xp ?? 0 }} / {{ stats?.nextLevelThreshold ?? 100 }} XP</span>
          </div>
          <XPBar
            :xp="stats?.xp ?? 0"
            :level="stats?.level ?? 1"
            :next-level-threshold="stats?.nextLevelThreshold ?? 100"
          />
          <div class="mt-4 flex items-center justify-between text-xs text-white/70">
            <span>Streak {{ stats?.streak ?? 0 }} days</span>
            <span>{{ xpProgress }}% complete</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard title="Active queue" description="Assignments on your desk">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ assignedTickets.length }}</p>
          <p class="text-sm text-muted-foreground">
            {{ highPriorityTickets }} high priority / {{ dueSoonTickets }} due soon
          </p>
          <div class="flex items-center gap-3">
            <span class="h-2 flex-1 rounded-full bg-slate-200">
              <span
                class="block h-2 rounded-full bg-slate-900 transition-all"
                :style="{ width: Math.min(assignedTickets.length * 12, 100) + '%' }"
              ></span>
            </span>
            <span class="text-xs uppercase text-muted-foreground">focus</span>
          </div>
        </div>
      </AppCard>
      <AppCard title="Wins logged" description="Closed tickets">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ closedTickets }}</p>
          <p class="text-sm text-muted-foreground">Lifetime closes tracked by gamification.</p>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-xs uppercase text-slate-500">Streak</p>
            <p class="text-lg font-semibold text-slate-900">{{ stats?.streak ?? 0 }} days active</p>
          </div>
        </div>
      </AppCard>
      <AppCard title="Next deadline" description="Stay ahead of due dates">
        <div class="space-y-3">
          <p class="text-3xl font-semibold text-foreground">{{ dueSoonTickets }}</p>
          <p class="text-sm text-muted-foreground">
            {{ nextDueTicket ? 'Next up: ' + nextDueTicket.title : 'No deadlines on the radar.' }}
          </p>
          <div
            v-if="nextDueTicket"
            class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p class="font-medium">{{ formatDate(nextDueTicket.dueDate) }}</p>
            <p class="text-xs uppercase tracking-[0.2em] text-amber-600">{{ nextDueTicket.priority }} priority</p>
          </div>
        </div>
      </AppCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <AppCard class="lg:col-span-2" title="Assigned tickets" description="Work that needs your attention">
        <template #action>
          <RouterLink to="/tickets">
            <Button variant="ghost" size="sm">View all</Button>
          </RouterLink>
        </template>
        <div class="grid gap-4 md:grid-cols-2">
          <TicketCard
            v-for="ticket in assignedTickets"
            :key="ticket.id"
            :ticket="ticket"
            @open="openTicket"
          />
          <p v-if="assignedTickets.length === 0" class="text-sm text-muted-foreground">No tickets assigned yet.</p>
        </div>
      </AppCard>

      <AppCard title="Weekly productivity" description="Ticket closures (last 7 days)">
        <div class="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <p>Daily output vs goal</p>
          <p class="text-xs">Goal 5 tickets/day</p>
        </div>
        <ChartLegend :items="chartLegendItems" class="my-4" />
        <VisXYContainer :height="240" :margin="{ top: 24, right: 16, bottom: 24, left: 0 }">
          <VisStackedBar
            :data="chartPoints"
            :x="xAccessor"
            :y="yAccessor"
            :color="chartColors[0]"
            :rounded-corners="6"
            :bar-padding="0.2"
            :duration="500"
          />
          <VisLine :data="goalPoints" :x="xAccessor" :y="goalAccessor" color="#94a3b8" :dash-pattern="[4,4]" />
          <VisAxis type="x" :tick-format="formatXAxis" />
          <VisAxis type="y" />
          <ChartCrosshair :colors="chartColors" :index="chartIndex" :items="chartLegendItems" />
        </VisXYContainer>
      </AppCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <AppCard title="Focus stack" description="Top priorities sorted by urgency">
        <ul v-if="focusTickets.length" class="space-y-4">
          <li
            v-for="ticket in focusTickets"
            :key="ticket.id"
            class="flex items-start justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-foreground">{{ ticket.title }}</p>
              <p class="text-xs text-muted-foreground">
                {{ ticket.projectId }} /
                {{ ticket.dueDate ? 'Due ' + formatDate(ticket.dueDate) : 'No due date' }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span
                :class="[
                  'rounded-full border px-3 py-0.5 text-xs font-medium capitalize',
                  priorityBadgeClass(ticket.priority),
                ]"
              >
                {{ ticket.priority ?? 'normal' }}
              </span>
              <span class="text-xs uppercase tracking-[0.2em] text-muted-foreground">{{ ticket.status }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">
          No critical work queued. Triage new tickets or help your squad.
        </p>
      </AppCard>

      <AppCard title="Badges" :description="badgeCopy">
        <template #action>
          <Button variant="ghost" size="sm">See progress</Button>
        </template>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <BadgeCard v-for="badge in badges" :key="badge.title" v-bind="badge" />
        </div>
      </AppCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import XPBar from '@/components/molecules/XPBar.vue'
import BadgeCard from '@/components/molecules/BadgeCard.vue'
import TicketCard from '@/components/molecules/TicketCard.vue'
import AppCard from '@/components/molecules/AppCard.vue'
import { Button } from '@/components/atoms/ui/button'
import { ChartCrosshair, ChartLegend, defaultColors } from '@/components/atoms/ui/chart'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/vue'
import type { BulletLegendItemInterface } from '@unovis/ts'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useTicketsStore } from '@/stores/tickets'
import { formatDate } from '@/utils/helpers'

const router = useRouter()
const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

const gamification = useGamificationStore()
const { userStats } = storeToRefs(gamification)
const ticketsStore = useTicketsStore()

const stats = computed(() => {
  if (!currentUser.value) return null
  return userStats.value[currentUser.value.id]
})

const assignedTickets = computed(() =>
  ticketsStore.tickets.filter((ticket) => ticket.assigneeId === currentUser.value?.id)
)

const xpToNext = computed(() => {
  const threshold = stats.value?.nextLevelThreshold ?? 100
  const xp = stats.value?.xp ?? 0
  return Math.max(0, threshold - xp)
})

const xpProgress = computed(() => {
  const threshold = stats.value?.nextLevelThreshold ?? 100
  if (!threshold) return 0
  const xp = stats.value?.xp ?? 0
  return Math.min(100, Math.round((xp / threshold) * 100))
})

const closedTickets = computed(() =>
  ticketsStore.tickets.filter(
    (ticket) => ticket.status === 'done' && ticket.assigneeId === currentUser.value?.id
  ).length
)

const highPriorityTickets = computed(() =>
  assignedTickets.value.filter((ticket) => ticket.priority === 'high' && ticket.status !== 'done').length
)

const dueSoonTickets = computed(() => {
  const now = new Date()
  return assignedTickets.value.filter((ticket) => {
    if (!ticket.dueDate) return false
    const due = new Date(ticket.dueDate)
    if (Number.isNaN(due.getTime())) return false
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 5
  }).length
})

const focusTickets = computed(() => {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...assignedTickets.value]
    .filter((ticket) => ticket.status !== 'done')
    .sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
      if (priorityDiff !== 0) return priorityDiff

      const aDue = new Date(a.dueDate ?? '')
      const bDue = new Date(b.dueDate ?? '')
      const aTime = Number.isNaN(aDue.getTime()) ? Infinity : aDue.getTime()
      const bTime = Number.isNaN(bDue.getTime()) ? Infinity : bDue.getTime()
      return aTime - bTime
    })
    .slice(0, 3)
})

const nextDueTicket = computed(() => {
  const sorted = assignedTickets.value
    .filter((ticket) => ticket.dueDate && ticket.status !== 'done')
    .map((ticket) => ({ ticket, due: new Date(ticket.dueDate) }))
    .filter(({ due }) => !Number.isNaN(due.getTime()))
    .sort((a, b) => a.due.getTime() - b.due.getTime())

  return sorted[0]?.ticket ?? null
})

const priorityBadgeClass = (priority?: string) => {
  const palette: Record<string, string> = {
    high: 'border-rose-300 bg-rose-50 text-rose-700',
    medium: 'border-amber-300 bg-amber-50 text-amber-700',
    low: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  }

  return palette[priority ?? ''] ?? 'border-slate-200 bg-slate-50 text-slate-600'
}

const productivityData = ref([
  { day: 'Mon', value: 3 },
  { day: 'Tue', value: 4 },
  { day: 'Wed', value: 2 },
  { day: 'Thu', value: 6 },
  { day: 'Fri', value: 5 },
  { day: 'Sat', value: 4 },
  { day: 'Sun', value: 3 },
])

const chartPoints = computed(() =>
  productivityData.value.map((entry, index) => ({ ...entry, position: index }))
)

// goalPoints provides a constant goal line (e.g. goal 5 tickets/day) aligned with chartPoints
const goalPoints = computed(() =>
  productivityData.value.map((entry, index) => ({ ...entry, position: index, value: 5 }))
)
const goalAccessor = (d) => d.value

const chartColors = defaultColors(1)
const chartLegendItems = computed<BulletLegendItemInterface[]>(() => [
  { name: 'Tickets closed', color: chartColors[0] },
])
const xAccessor = (d) => d.position
const yAccessor = (d) => d.value
const chartIndex = 'day'
const formatXAxis = (tick: number) => productivityData.value[tick]?.day ?? ''

const levelBadge = computed(() => {
  const level = stats.value?.level ?? 1
  if (level >= 5) return 'Elite Operator'
  if (level >= 3) return 'Momentum Maker'
  return 'Rookie Closer'
})

const badgeCopy = computed(() =>
  `Complete ${Math.max(0, 25 - (stats.value?.tickets_closed_count ?? 0))} more tickets to unlock Elite.`
)

const badges = computed(() => [
  { title: 'Zero Inbox', description: 'Clear backlog once', icon: 'check' },
  { title: 'Rapid Review', description: 'Close 3 tickets/day', icon: 'flash' },
  { title: 'Squad Captain', description: 'Mentor teammates', icon: 'mentor' },
  { title: 'Bug Hunter', description: 'Resolve urgent bugs', icon: 'bug' },
])

const openTicket = (ticketId) => router.push(`/tickets/${ticketId}`)
</script>
