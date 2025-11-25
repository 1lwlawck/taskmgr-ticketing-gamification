<template>
  <section class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-14 top-6 h-60 w-60 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">Elite scoreboard</p>
          <h1 class="text-3xl font-semibold">Leaderboard</h1>
          <p class="text-sm text-white/70">
            {{ contendersCount }} operators / {{ formatNumber(totalXp) }} XP minted / {{ formatNumber(totalTickets) }} tickets closed
          </p>
          <div class="grid gap-4 text-sm sm:grid-cols-3">
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">Top performer</p>
              <p class="text-lg font-semibold">{{ topPerformer?.name ?? 'Waiting for progress' }}</p>
              <p class="text-xs text-white/70">
                Level {{ topPerformer?.level ?? 1 }} / {{ formatNumber(topPerformer?.xp ?? 0) }} XP
              </p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">XP lead</p>
              <p class="text-lg font-semibold">{{ formatNumber(xpGapToSecond) }} XP</p>
              <p class="text-xs text-white/70">Gap to #2</p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">XP share</p>
              <p class="text-lg font-semibold">{{ xpShare }}%</p>
              <p class="text-xs text-white/70">Owned by leader</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink to="/dashboard">
              <Button variant="secondary" class="border border-white/30 bg-white/15 text-white hover:bg-white/25">Back to dashboard</Button>
            </RouterLink>
            <Button variant="ghost" class="text-white hover:bg-white/10 hover:text-white">Share board</Button>
          </div>
        </div>
        <div class="w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
          <p class="text-xs uppercase text-white/60">Spotlight</p>
          <p class="text-2xl font-semibold">{{ topPerformer?.name ?? 'No entries yet' }}</p>
          <p class="text-sm text-white/70">
            {{ topPerformer ? formatRole(topPerformer.role) : 'Pending' }} /
            {{ formatNumber(topPerformer?.ticketsClosedCount ?? topPerformer?.tickets_closed_count ?? 0) }} tickets closed
          </p>
          <div class="mt-6 space-y-2">
            <div>
              <p class="text-xs uppercase text-white/60">Last recorded XP</p>
              <p class="text-3xl font-semibold">{{ formatNumber(topPerformer?.xp ?? 0) }} XP</p>
            </div>
            <div>
              <p class="text-xs uppercase text-white/60">Lead vs squad</p>
              <p class="text-lg font-medium">{{ formatNumber(xpGapToSquad) }} XP ahead of team average</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard title="Squad XP" description="Total XP minted by all operators.">
        <p class="text-4xl font-semibold text-foreground">{{ formatNumber(totalXp) }}</p>
        <p class="text-sm text-muted-foreground">Lifetime XP earned.</p>
      </AppCard>
      <AppCard title="Average level" description="Mean level across roster.">
        <p class="text-4xl font-semibold text-foreground">{{ averageLevel }}</p>
        <p class="text-sm text-muted-foreground">{{ contendersCount }} operators tracked.</p>
      </AppCard>
      <AppCard title="Tickets closed" description="All-time ticket completions.">
        <p class="text-4xl font-semibold text-foreground">{{ formatNumber(totalTickets) }}</p>
        <p class="text-sm text-muted-foreground">Fueling the XP climb.</p>
      </AppCard>
    </div>

    <div class="space-y-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Podium</p>
          <h2 class="text-xl font-semibold text-foreground">Top three operators</h2>
        </div>
        <p class="text-sm text-muted-foreground">Evaluated on total XP and tickets.</p>
      </div>
      <div v-if="topThree.length" class="grid gap-6 lg:grid-cols-3">
        <div
          v-for="(user, index) in topThree"
          :key="user?.id ?? index"
          class="rounded-3xl border p-6 text-center shadow-lg"
          :class="podiumAccent(index)"
        >
          <p class="text-xs uppercase text-muted-foreground">#{{ index + 1 }} {{ podiumTitle(index) }}</p>
          <p class="mt-2 text-2xl font-semibold text-foreground">{{ user?.name ?? 'TBD' }}</p>
          <p class="text-sm text-muted-foreground">{{ user ? formatRole(user.role) : 'Awaiting data' }}</p>
          <p class="mt-4 text-3xl font-bold text-foreground">{{ formatNumber(user?.xp ?? 0) }} XP</p>
          <p class="text-xs text-muted-foreground">
            Level {{ user?.level ?? 1 }} / {{ formatNumber(user?.ticketsClosedCount ?? user?.tickets_closed_count ?? 0) }} tickets
          </p>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">No ranked operators yet. Close tickets to climb the podium.</p>
    </div>

    <AppCard title="Squad rankings" description="Full breakdown of XP and ticket closures.">
      <template #action>
        <span class="text-xs uppercase text-muted-foreground">{{ contendersCount }} total operators</span>
      </template>

      <div v-if="rankingWithGap.length" class="overflow-hidden rounded-2xl border border-border">
        <table class="min-w-full divide-y divide-border text-sm">
          <thead class="bg-muted/60 text-muted-foreground">
            <tr>
              <th class="px-4 py-3 text-left">Rank</th>
              <th class="px-4 py-3 text-left">Operator</th>
              <th class="px-4 py-3 text-left">Role</th>
              <th class="px-4 py-3 text-left">Level</th>
              <th class="px-4 py-3 text-left">Tickets</th>
              <th class="px-4 py-3 text-left">XP</th>
              <th class="px-4 py-3 text-right">Gap to #1</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-card text-foreground">
            <tr v-for="user in rankingWithGap" :key="user.id" class="transition hover:bg-muted/40">
              <td class="px-4 py-3 font-semibold">#{{ user.rank }}</td>
              <td class="px-4 py-3">
                <p class="font-semibold text-foreground">{{ user.name }}</p>
                <p class="text-xs text-muted-foreground">{{ user.bio ?? '�' }}</p>
              </td>
              <td class="px-4 py-3 capitalize text-foreground">{{ formatRole(user.role) }}</td>
              <td class="px-4 py-3 text-foreground">{{ user.level }}</td>
              <td class="px-4 py-3 text-foreground">{{ formatNumber(user.tickets_closed_count ?? 0) }}</td>
              <td class="px-4 py-3 font-semibold text-foreground">{{ formatNumber(user.xp ?? 0) }}</td>
              <td class="px-4 py-3 text-right text-sm">
                <span v-if="user.xpGap === 0" class="font-semibold text-emerald-600">Leader</span>
                <span v-else class="text-muted-foreground">-{{ formatNumber(user.xpGap) }} XP</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-sm text-muted-foreground">No operators have earned XP yet.</p>
    </AppCard>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppCard from '@/components/molecules/AppCard.vue'
import { Button } from '@/components/atoms/ui/button'
import { useGamificationStore } from '@/stores/gamification'

const gamificationStore = useGamificationStore()
const { leaderboard } = storeToRefs(gamificationStore)

const loadLeaderboard = async () => {
  try {
    await gamificationStore.fetchLeaderboard()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load leaderboard'
    gamificationStore.pushToast({
      title: 'Leaderboard error',
      message,
    })
  }
}

onMounted(() => {
  if (!leaderboard.value.length) {
    loadLeaderboard()
  }
})

const ranking = computed(() =>
  [...leaderboard.value].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    return (b.xp ?? 0) - (a.xp ?? 0)
  })
)

const rankingWithGap = computed(() => {
  if (!ranking.value.length) return []
  const leaderXp = ranking.value[0]?.xp ?? 0
  return ranking.value.map((entry, index) => ({
    ...entry,
    rank: entry.rank || index + 1,
    xpGap:
      typeof entry.xpGap === 'number' && !Number.isNaN(entry.xpGap)
        ? entry.xpGap
        : Math.max(0, leaderXp - (entry.xp ?? 0)),
  }))
})

const topThree = computed(() => rankingWithGap.value.slice(0, 3))
const topPerformer = computed(() => topThree.value[0] ?? null)
const contendersCount = computed(() => ranking.value.length)
const totalXp = computed(() => ranking.value.reduce((sum, user) => sum + (user.xp ?? 0), 0))
const totalTickets = computed(() =>
  ranking.value.reduce((sum, user) => sum + (user.ticketsClosedCount ?? user.tickets_closed_count ?? 0), 0)
)
const averageLevel = computed(() => {
  if (!ranking.value.length) return 0
  const sum = ranking.value.reduce((acc, user) => acc + (user.level ?? 1), 0)
  return Math.round((sum / ranking.value.length) * 10) / 10
})
const xpGapToSecond = computed(() =>
  ranking.value.length >= 2 ? Math.max(0, (ranking.value[0].xp ?? 0) - (ranking.value[1].xp ?? 0)) : 0
)
const xpShare = computed(() => {
  if (!totalXp.value) return 0
  return Math.round(((topPerformer.value?.xp ?? 0) / totalXp.value) * 100)
})
const xpGapToSquad = computed(() => {
  if (!ranking.value.length) return 0
  const avgXp = totalXp.value / ranking.value.length
  return Math.max(0, (topPerformer.value?.xp ?? 0) - avgXp)
})

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value = 0) => numberFormatter.format(value ?? 0)
const formatRole = (role) => {
  if (!role) return '-'
  return role.replace(/_/g, ' ')
}
const podiumAccent = (index) => {
  const palette = [
    'border-amber-200 bg-amber-50',
    'border-slate-200 bg-slate-50',
    'border-orange-200 bg-orange-50',
  ]
  return palette[index] ?? 'border-border bg-card'
}
const podiumTitle = (index) => ['Champion', 'Runner up', 'Challenger'][index] ?? 'Contender'
</script>

