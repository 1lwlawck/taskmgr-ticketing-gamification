<template>
  <section v-if="pageLoading" class="space-y-8">
    <PageHeroSkeleton />
    <StatCardsSkeleton />
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <CardGridSkeleton :count="4" columns-class="sm:grid-cols-1 md:grid-cols-2" />
        <div class="rounded-3xl border border-border bg-card p-6 shadow-card">
          <Skeleton class="h-6 w-40 rounded-md bg-slate-200" />
          <Skeleton class="mt-4 h-48 w-full rounded-xl bg-slate-100" />
        </div>
      </div>
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
    </div>
    <CardGridSkeleton :count="4" columns-class="sm:grid-cols-2" />
    <div class="grid gap-6 lg:grid-cols-2">
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
      <CardGridSkeleton :count="4" columns-class="sm:grid-cols-2 md:grid-cols-4" />
    </div>
    <TableSkeleton :columns="5" :rows="5" />
  </section>

  <section v-else class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-24 top-6 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-10 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-6 sm:gap-8 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-6">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.4em] text-white/60">{{ t('dashboard.heroLabel') }}</p>
            <h1 class="text-2xl font-semibold sm:text-3xl">
              {{ t('dashboard.heroTitle', { name: currentUser?.name ?? t('sidebar.defaultName') }) }}
            </h1>
            <p class="text-sm text-white/70">
              {{
                t('dashboard.heroSubtitle', {
                  progress: xpProgress,
                  nextLevel: (stats?.level ?? 1) + 1,
                  badge: levelBadge,
                })
              }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4 sm:gap-6 text-sm">
            <div class="min-w-[120px]">
            <p class="text-xs uppercase text-white/60">{{ t('dashboard.statCurrentLevel') }}</p>
            <p class="text-3xl font-semibold">{{ stats?.level ?? 1 }}</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">{{ t('dashboard.statBadge') }}</p>
              <p class="text-lg font-medium">{{ levelBadge }}</p>
            </div>
            <div class="min-w-[140px]">
              <p class="text-xs uppercase text-white/60">{{ t('dashboard.statNextUnlock') }}</p>
              <p class="text-lg font-medium">{{ t('dashboard.statNextUnlockSuffix', { xp: xpToNext }) }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 sm:flex-row">
            <RouterLink :to="localePath('/tickets')">
              <Button variant="secondary" size="sm" class="border border-white/20 bg-white/10 text-white hover:bg-white/20">
                {{ t('dashboard.btnReviewTickets') }}
              </Button>
            </RouterLink>
            <RouterLink :to="localePath('/projects')">
              <Button variant="ghost" size="sm" class="text-white hover:bg-white/10 hover:text-white">
                {{ t('dashboard.btnJumpProjects') }}
              </Button>
            </RouterLink>
          </div>
        </div>
        <div class="w-full max-w-md rounded-md border border-white/15 bg-white/5 p-5 shadow-lg backdrop-blur">
          <div class="mb-3 flex items-center justify-between text-sm text-white/70">
            <span>XP</span>
            <span>{{ stats?.xp ?? 0 }} / {{ stats?.nextLevelThreshold ?? 100 }} XP</span>
          </div>
          <XPBar
            :xp="stats?.xp ?? 0"
            :level="stats?.level ?? 1"
            :next-level-threshold="stats?.nextLevelThreshold ?? 100"
          />
          <div class="mt-4 flex items-center justify-between text-xs text-white/70">
            <span>{{ t('dashboard.statStreak', { days: stats?.streak ?? 0 }) }}</span>
            <span>{{ xpProgress }}% complete</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard :title="t('dashboard.cards.activeQueueTitle')" :description="t('dashboard.cards.activeQueueDesc')">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ assignedTickets.length }}</p>
          <p class="text-sm text-muted-foreground">
            {{ t('dashboard.cards.highPriority', { count: highPriorityTickets }) }} /
            {{ t('dashboard.cards.dueSoon', { count: dueSoonTickets }) }}
          </p>
          <div class="flex items-center gap-3">
            <span class="h-2 flex-1 rounded-full bg-slate-200">
              <span
                class="block h-2 rounded-full bg-slate-900 transition-all"
                :style="{ width: Math.min(assignedTickets.length * 12, 100) + '%' }"
              ></span>
            </span>
            <span class="text-xs uppercase text-muted-foreground">{{ t('dashboard.cards.focus') }}</span>
          </div>
        </div>
      </AppCard>
      <AppCard :title="t('dashboard.cards.winsTitle')" :description="t('dashboard.cards.winsDesc')">
        <div class="space-y-3">
            <div class="flex items-center justify-between">
            <p class="text-4xl font-semibold text-foreground">{{ closedTickets }}</p>
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {{ t('dashboard.cards.normalWins', { count: Math.max(closedTickets - highPriorityTickets, 0) }) }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">{{ t('dashboard.cards.lifetime') }}</p>
          <div class="rounded-md border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-4 py-3 text-white shadow">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>{{ t('dashboard.streakLabel') }}</span>
              <span>{{ t('dashboard.statStreak', { days: stats?.streak ?? 0 }) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-sm text-white/80">
              <p class="font-semibold">{{ t('dashboard.cards.highPriority', { count: highPriorityTickets }) }}</p>
              <span class="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white/80">
                {{ t('dashboard.cards.dueSoon', { count: dueSoonTickets }) }}
              </span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-white/20">
              <span
                class="block h-2 rounded-full bg-emerald-400 transition-all"
                :style="{ width: Math.min(closedTickets * 8, 100) + '%' }"
              ></span>
            </div>
          </div>
        </div>
      </AppCard>
      <AppCard :title="t('dashboard.cards.nextDeadlineTitle')" :description="t('dashboard.cards.nextDeadlineDesc')">
        <div class="space-y-3">
          <p class="text-3xl font-semibold text-foreground">{{ dueSoonTickets }}</p>
          <p class="text-sm text-muted-foreground">
            {{ nextDueTicket ? t('dashboard.cards.nextUp', { title: nextDueTicket.title }) : t('dashboard.cards.noDeadlines') }}
          </p>
          <div
            v-if="nextDueTicket"
            class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p class="font-medium">{{ formatDate(nextDueTicket.dueDate) }}</p>
            <p class="text-xs uppercase tracking-[0.2em] text-amber-600">
              {{ t('dashboard.cards.priority', { priority: nextDueTicket.priority }) }}
            </p>
          </div>
        </div>
      </AppCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <AppCard class="lg:col-span-2" :title="t('dashboard.cards.assignedTitle')" :description="t('dashboard.cards.assignedDesc')">
        <template #action>
          <RouterLink :to="localePath('/tickets')">
            <Button variant="ghost" size="sm">{{ t('dashboard.cards.viewAll') }}</Button>
          </RouterLink>
        </template>
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <TicketCard
            v-for="ticket in assignedTickets"
            :key="ticket.id"
            :ticket="ticket"
            @open="openTicket"
          />
          <p v-if="assignedTickets.length === 0" class="text-sm text-muted-foreground">{{ t('dashboard.cards.noneAssigned') }}</p>
        </div>
      </AppCard>

      <AppCard :title="t('dashboard.cards.productivityTitle')" :description="t('dashboard.cards.productivityDesc')">
        <div class="rounded-md border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-4 py-3 text-sm text-white shadow">
          <div class="flex items-center justify-between gap-3">
            <div >
              <p class="text-xs uppercase tracking-[0.35em] text-white/60">{{ t('dashboard.cards.dailyOutput') }}</p>
              <p class="text-lg font-semibold text-white">{{ t('dashboard.cards.goal') }}</p>
            </div>
            <div class="flex items-center gap-2 text-xs text-white/70">
              <span class="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white/80">{{ t('dashboard.cards.last7days') }}</span>
              <span class="rounded-full border border-emerald-300/40 bg-emerald-200/10 px-3 py-1 text-emerald-100">
                {{ t('dashboard.cards.avgPerDay', { count: avgWeeklyClosed }) }}
              </span>
            </div>
          </div>
        </div>
        <ChartLegend :items="chartLegendItems" class="my-4" />
        <VisXYContainer :height="260" :margin="{ top: 32, right: 16, bottom: 28, left: 0 }">
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

    <AppCard :title="t('dashboard.cards.xpEventsTitle')" :description="t('dashboard.cards.xpEventsTitle')">
      <div v-if="xpEvents.length" class="space-y-3">
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="event in xpEvents"
            :key="event.id"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-[0.25em] text-slate-400">+{{ event.xp ?? 0 }} XP</span>
              <span
                v-if="event.priority"
                class="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-700"
              >
                {{ event.priority }}
              </span>
            </div>
            <p class="mt-1 text-sm font-semibold text-foreground">{{ event.note || 'XP update' }}</p>
            <p class="text-xs text-muted-foreground">{{ formatDate(event.timestamp ?? event.createdAt) }}</p>
          </div>
        </div>
        <div class="flex justify-end">
          <Button
            v-if="eventsNextCursor"
            variant="outline"
            size="sm"
            :disabled="eventsLoadingMore"
            @click="loadMoreEvents"
          >
            {{ eventsLoadingMore ? t('dashboard.cards.loading') : t('dashboard.cards.loadMore') }}
          </Button>
        </div>
      </div>
      <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-muted-foreground">
        {{ t('dashboard.cards.xpEventsEmpty') }}
      </div>
    </AppCard>

    <div class="grid gap-6 lg:grid-cols-2">
      <AppCard :title="t('dashboard.cards.focusStackTitle')" :description="t('dashboard.cards.focusStackDesc')">
        <ul v-if="focusTickets.length" class="space-y-3 text-sm">
          <li
            v-for="ticket in focusTickets"
            :key="ticket.id"
            class="flex items-start justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-foreground">{{ ticket.title }}</p>
              <p class="text-xs text-muted-foreground">
                {{ ticket.projectId }} /
                {{
                  ticket.dueDate
                    ? t('dashboard.cards.dueLabel', { date: formatDate(ticket.dueDate) })
                    : t('dashboard.cards.noDue')
                }}
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
        <p v-else class="text-sm text-muted-foreground">{{ t('dashboard.cards.emptyFocus') }}</p>
      </AppCard>

      <AppCard :title="t('dashboard.cards.badgesTitle')" :description="badgeCopy">
        <template #action>
          <Button variant="ghost" size="sm">{{ t('dashboard.cards.badgesAction') }}</Button>
        </template>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <BadgeCard v-for="badge in badges" :key="badge.title" v-bind="badge" />
        </div>
      </AppCard>
    </div>

    <AppCard :title="t('dashboard.cards.myQueueTitle')" :description="t('dashboard.cards.myQueueDesc')">
      <template #action>
        <RouterLink :to="localePath('/tickets')">
          <Button variant="ghost" size="sm">{{ t('dashboard.cards.goTickets') }}</Button>
        </RouterLink>
      </template>
      <div class="-mx-2 overflow-x-auto sm:mx-0">
        <table class="min-w-[720px] w-full divide-y divide-slate-100 text-sm">
          <thead class="text-left text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <tr>
              <th class="px-2 py-3 font-medium">{{ t('dashboard.cards.table.ticket') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('dashboard.cards.table.priority') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('dashboard.cards.table.due') }}</th>
              <th class="px-2 py-3 font-medium">{{ t('dashboard.cards.table.status') }}</th>
              <th class="px-2 py-3 text-right font-medium">{{ t('dashboard.cards.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!myTicketRows.length">
              <td colspan="5" class="px-2 py-6 text-center text-sm text-muted-foreground">
                {{ t('dashboard.cards.table.empty') }}
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="ticket in myTicketRows"
                :key="ticket.id"
                class="border-b border-slate-100 last:border-none"
              >
                <td class="px-2 py-3">
                  <p class="font-medium text-foreground">{{ ticket.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ ticket.projectId }}</p>
                </td>
                <td class="px-2 py-3">
                  <span
                    :class="[
                      'rounded-full border px-3 py-0.5 text-xs font-medium capitalize',
                      priorityBadgeClass(ticket.priority),
                    ]"
                  >
                    {{ ticket.priority }}
                  </span>
                </td>
                <td class="px-2 py-3 text-sm text-foreground">
                  {{
                    ticket.dueDate
                      ? formatDate(ticket.dueDate)
                      : t('dashboard.cards.noDue')
                  }}
                </td>
                <td class="px-2 py-3">
                  <span
                    :class="[
                      'rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.2em]',
                      statusBadgeClass(ticket.status),
                    ]"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-2 py-3 text-right">
                  <Button size="sm" variant="outline" class="text-xs" @click="openTicket(ticket.id)">{{ t('dashboard.cards.table.detail') }}</Button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </AppCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import XPBar from '@/components/molecules/XPBar.vue'
import BadgeCard from '@/components/molecules/BadgeCard.vue'
import TicketCard from '@/components/molecules/TicketCard.vue'
import AppCard from '@/components/molecules/AppCard.vue'
import { Button } from '@/components/atoms/ui/button'
import { ChartCrosshair, ChartLegend, defaultColors } from '@/components/atoms/ui/chart'
import { VisXYContainer, VisStackedBar, VisAxis, VisLine } from '@unovis/vue'
import type { BulletLegendItemInterface } from '@unovis/ts'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useTicketsStore } from '@/stores/tickets'
import { formatDate } from '@/utils/helpers'
import type { Ticket } from '@/types/models'
import { PageHeroSkeleton, StatCardsSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/molecules/skeletons'
import { Skeleton } from '@/components/atoms/ui/skeleton'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const localeParam = computed(() => (route.params.locale as string | undefined))
const localePath = (path = '') => (localeParam.value ? `/${localeParam.value}${path}` : path)
const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

const gamification = useGamificationStore()
const { userStats, xpEvents, eventsNextCursor } = storeToRefs(gamification)
const eventsLoadingMore = ref(false)
const ticketsStore = useTicketsStore()
const pageLoading = computed(() => gamification.loading || ticketsStore.loading || !currentUser.value)

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

const loadMoreEvents = async () => {
  if (!eventsNextCursor.value) return
  eventsLoadingMore.value = true
  try {
    await gamification.fetchEvents({ userId: auth.currentUser?.id, append: true })
  } finally {
    eventsLoadingMore.value = false
  }
}

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

const myTicketRows = computed(() => {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  return [...assignedTickets.value].sort((a, b) => {
    const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    if (dueA !== dueB) return dueA - dueB
    const priorityDiff = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
    if (priorityDiff !== 0) return priorityDiff
    return a.title.localeCompare(b.title)
  })
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

const statusBadgeClass = (status?: string) => {
  const palette: Record<string, string> = {
    todo: 'border-slate-200 bg-slate-50 text-slate-600',
    in_progress: 'border-sky-300 bg-sky-50 text-sky-700',
    review: 'border-violet-300 bg-violet-50 text-violet-700',
    done: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  }
  return palette[status ?? ''] ?? 'border-slate-200 bg-slate-50 text-slate-600'
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const latestDoneDate = (ticket: Ticket) => {
  const doneHistory = ticket.history?.find((h) => h.text?.toLowerCase().includes('status changed to done'))
  if (doneHistory?.timestamp) return new Date(doneHistory.timestamp)
  if (ticket.status === 'done' && ticket.updatedAt) return new Date(ticket.updatedAt)
  return undefined
}

const last7Days = computed(() => {
  const now = new Date()
  return Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      return d
    })
    .map((date) => ({
      key: date.toISOString().slice(0, 10),
      day: dayLabels[date.getDay()],
      date,
    }))
})

const productivityBuckets = computed(() => {
  const buckets = new Map<string, number>()
  last7Days.value.forEach((d) => buckets.set(d.key, 0))
  ticketsStore.tickets.forEach((ticket) => {
    const doneAt = latestDoneDate(ticket)
    if (!doneAt) return
    const key = doneAt.toISOString().slice(0, 10)
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
  })
  return last7Days.value.map((d) => ({
    day: d.day,
    value: buckets.get(d.key) ?? 0,
  }))
})

const chartPoints = computed(() =>
  productivityBuckets.value.map((entry, index) => ({ ...entry, position: index }))
)

// goalPoints provides a constant goal line (e.g. goal 5 tickets/day) aligned with chartPoints
const goalPoints = computed(() =>
  productivityBuckets.value.map((entry, index) => ({ ...entry, position: index, value: 5 }))
)
const goalAccessor = (d) => d.value

const chartColors = ['#22d3ee']
const chartLegendItems = computed<BulletLegendItemInterface[]>(() => [
  { name: 'Tickets closed', color: chartColors[0] },
])
const xAccessor = (d) => d.position
const yAccessor = (d) => d.value
const chartIndex = 'day'
const formatXAxis = (tick: number) => productivityBuckets.value[tick]?.day ?? ''
const avgWeeklyClosed = computed(() => {
  const total = productivityBuckets.value.reduce((acc, d) => acc + (d.value ?? 0), 0)
  return Math.round((total / 7) * 10) / 10
})

const levelBadge = computed(() => {
  const level = stats.value?.level ?? 1
  if (level >= 5) return t('dashboard.badgeElite')
  if (level >= 3) return t('dashboard.badgeMomentum')
  return t('dashboard.badgeRookie')
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

const openTicket = (ticketId) => router.push(localePath(`/tickets/${ticketId}`))
</script>
