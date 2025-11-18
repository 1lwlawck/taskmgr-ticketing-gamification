<template>
  <section class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <XPBar :xp="stats?.xp ?? 0" :level="stats?.level ?? 1" :next-level-threshold="stats?.nextLevelThreshold ?? 100" />
      <div class="rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-card dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <p class="text-xs uppercase text-slate-500">Level Badge</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{{ levelBadge }}</p>
        <p class="text-slate-500 dark:text-slate-300">{{ badgeCopy }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card lg:col-span-2 dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Assigned tickets</h2>
          <RouterLink class="text-sm text-slate-500 underline" to="/tickets">View all</RouterLink>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <TicketCard v-for="ticket in assignedTickets" :key="ticket.id" :ticket="ticket" @open="openTicket" />
          <p v-if="assignedTickets.length === 0" class="text-sm text-slate-500 dark:text-slate-400">No tickets assigned yet.</p>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-900">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Weekly productivity</h2>
        <canvas ref="chartRef" height="160"></canvas>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Badges</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <BadgeCard v-for="badge in badges" :key="badge.title" v-bind="badge" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Chart } from 'chart.js/auto'
import XPBar from '@/components/XPBar.vue'
import BadgeCard from '@/components/BadgeCard.vue'
import TicketCard from '@/components/TicketCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useTicketsStore } from '@/stores/tickets'

const router = useRouter()
const chartRef = ref(null)
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

onMounted(() => {
  if (!chartRef.value) return
  new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Tickets closed',
          data: [3, 2, 4, 1, 5, 0, 2],
          borderRadius: 6,
          backgroundColor: '#0f172a',
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#e2e8f0' }, ticks: { color: '#94a3b8', precision: 0 } },
      },
    },
  })
})
</script>
