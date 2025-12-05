<template>
  <section v-if="pageLoading" class="space-y-8">
    <PageHeroSkeleton />
    <StatCardsSkeleton />
    <CardGridSkeleton :count="3" columns-class="lg:grid-cols-3" />
    <TableSkeleton :columns="7" :rows="6" />
  </section>

  <section v-else class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-14 top-6 h-60 w-60 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('leaderboard.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('leaderboard.title') }}</h1>
          <p class="text-sm text-white/70">
            {{
              t('leaderboard.heroSummary', {
                count: contendersCount,
                xp: formatNumber(totalXp),
                tickets: formatNumber(totalTickets),
              })
            }}
          </p>
          <div class="grid gap-4 text-sm sm:grid-cols-3">
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">{{ t('leaderboard.topPerformer') }}</p>
              <p class="text-lg font-semibold">{{ topPerformer?.name ?? t('leaderboard.waiting') }}</p>
              <p class="text-xs text-white/70">
                {{
                  t('leaderboard.levelXp', {
                    level: topPerformer?.level ?? 1,
                    xp: formatNumber(topPerformer?.xp ?? 0),
                  })
                }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">{{ t('leaderboard.xpLead') }}</p>
              <p class="text-lg font-semibold">{{ formatNumber(xpGapToSecond) }} XP</p>
              <p class="text-xs text-white/70">{{ t('leaderboard.gapToSecond') }}</p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">{{ t('leaderboard.xpShare') }}</p>
              <p class="text-lg font-semibold">{{ xpShare }}%</p>
              <p class="text-xs text-white/70">{{ t('leaderboard.ownedByLeader') }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink :to="localePath('/dashboard')">
              <Button variant="secondary" class="border border-white/30 bg-white/15 text-white hover:bg-white/25">
                {{ t('leaderboard.backDashboard') }}
              </Button>
            </RouterLink>
            <Button variant="ghost" class="text-white hover:bg-white/10 hover:text-white">
              {{ t('leaderboard.shareBoard') }}
            </Button>
          </div>
        </div>
        <div class="w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
          <p class="text-xs uppercase text-white/60">{{ t('leaderboard.spotlight') }}</p>
          <p class="text-2xl font-semibold">{{ topPerformer?.name ?? t('leaderboard.noEntries') }}</p>
          <p class="text-sm text-white/70">
            {{ topPerformer ? formatRole(topPerformer.role) : t('leaderboard.pending') }} /
            {{
              t('leaderboard.ticketsClosed', {
                count: formatNumber(topPerformer?.ticketsClosedCount ?? topPerformer?.tickets_closed_count ?? 0),
              })
            }}
          </p>
          <div class="mt-6 space-y-2">
            <div>
              <p class="text-xs uppercase text-white/60">{{ t('leaderboard.lastXp') }}</p>
              <p class="text-3xl font-semibold">{{ formatNumber(topPerformer?.xp ?? 0) }} XP</p>
            </div>
            <div>
              <p class="text-xs uppercase text-white/60">{{ t('leaderboard.leadVsSquad') }}</p>
              <p class="text-lg font-medium">
                {{ t('leaderboard.xpAhead', { gap: formatNumber(xpGapToSquad) }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard :title="t('leaderboard.cards.squadXp')" :description="t('leaderboard.cards.squadXpDesc')">
        <p class="text-4xl font-semibold text-foreground">{{ formatNumber(totalXp) }}</p>
        <p class="text-sm text-muted-foreground">{{ t('leaderboard.cards.lifetimeXp') }}</p>
      </AppCard>
      <AppCard :title="t('leaderboard.cards.averageLevel')" :description="t('leaderboard.cards.averageLevelDesc')">
        <p class="text-4xl font-semibold text-foreground">{{ averageLevel }}</p>
        <p class="text-sm text-muted-foreground">
          {{ t('leaderboard.cards.operatorsTracked', { count: contendersCount }) }}
        </p>
      </AppCard>
      <AppCard :title="t('leaderboard.cards.tickets')" :description="t('leaderboard.cards.ticketsDesc')">
        <p class="text-4xl font-semibold text-foreground">{{ formatNumber(totalTickets) }}</p>
        <p class="text-sm text-muted-foreground">{{ t('leaderboard.cards.fueling') }}</p>
      </AppCard>
    </div>

    <div class="space-y-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">{{ t('leaderboard.podium.label') }}</p>
          <h2 class="text-xl font-semibold text-foreground">{{ t('leaderboard.podium.title') }}</h2>
        </div>
        <p class="text-sm text-muted-foreground">{{ t('leaderboard.podium.subtitle') }}</p>
      </div>
      <div v-if="topThree.length" class="grid gap-6 lg:grid-cols-3">
        <div
          v-for="(user, index) in topThree"
          :key="user?.id ?? index"
          class="rounded-3xl border p-6 text-center shadow-lg"
          :class="podiumAccent(index)"
        >
          <p class="text-xs uppercase text-muted-foreground">#{{ index + 1 }} {{ podiumTitle(index) }}</p>
          <p class="mt-2 text-2xl font-semibold text-foreground">{{ user?.name ?? t('leaderboard.pending') }}</p>
          <p class="text-sm text-muted-foreground">{{ user ? formatRole(user.role) : t('leaderboard.waiting') }}</p>
          <p class="mt-4 text-3xl font-bold text-foreground">{{ formatNumber(user?.xp ?? 0) }} XP</p>
          <p class="text-xs text-muted-foreground">
            Level {{ user?.level ?? 1 }} / {{ formatNumber(user?.ticketsClosedCount ?? user?.tickets_closed_count ?? 0) }} tickets
          </p>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">{{ t('leaderboard.podium.empty') }}</p>
    </div>

    <AppCard :title="t('leaderboard.table.title')" :description="t('leaderboard.table.description')">
      <template #action>
        <div class="flex items-center gap-3">
          <span class="text-xs uppercase text-muted-foreground">
            {{ t('leaderboard.table.totalOperators', { count: contendersCount }) }}
          </span>
          <Button
            v-if="leaderboardNextCursor != null"
            size="sm"
            variant="outline"
            :disabled="leaderboardLoading"
            @click="loadMore"
          >
            {{ leaderboardLoading ? t('common.loading') : t('common.loadMore') }}
          </Button>
        </div>
      </template>

      <div v-if="rankingWithGap.length" class="overflow-hidden rounded-2xl border border-border">
        <table class="min-w-full divide-y divide-border text-sm">
          <thead class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white">
            <tr>
              <th class="px-4 py-3 text-left">{{ t('leaderboard.table.rank') }}</th>
              <th class="px-4 py-3 text-left">{{ t('leaderboard.table.operator') }}</th>
              <th class="px-4 py-3 text-left">{{ t('leaderboard.table.role') }}</th>
              <th class="px-4 py-3 text-center">{{ t('leaderboard.table.level') }}</th>
              <th class="px-4 py-3 text-center">{{ t('leaderboard.table.tickets') }}</th>
              <th class="px-4 py-3 text-center">{{ t('leaderboard.table.xp') }}</th>
              <th class="px-4 py-3 text-right">{{ t('leaderboard.table.gap') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-card text-foreground px-3 py-2">
            <tr v-for="user in rankingWithGap" :key="user.id" class="transition hover:bg-muted/40">
              <td class="px-4 py-3 font-semibold">#{{ user.rank }}</td>
              <td class="px-4 py-3">
                <p class="font-semibold text-foreground">{{ user.name }}</p>
                <p class="text-xs text-muted-foreground">{{ user.bio ?? '' }}</p>
              </td>
              <td class="px-4 py-3 capitalize text-foreground">{{ formatRole(user.role) }}</td>
              <td class="px-4 py-3 text-center text-foreground">{{ user.level }}</td>
              <td class="px-4 py-3 text-center text-foreground">{{ formatNumber(user.tickets_closed_count ?? 0) }}</td>
              <td class="px-4 py-3 text-center font-semibold text-foreground">{{ formatNumber(user.xp ?? 0) }}</td>
              <td class="px-4 py-3 text-right text-sm">
                <span v-if="user.xpGap === 0" class="font-semibold text-emerald-600">{{ t('leaderboard.table.leader') }}</span>
                <span v-else class="text-muted-foreground">-{{ formatNumber(user.xpGap) }} XP</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-sm text-muted-foreground">{{ t('leaderboard.table.none') }}</p>
    </AppCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppCard from '@/components/molecules/AppCard.vue'
import { Button } from '@/components/atoms/ui/button'
import { useGamificationStore } from '@/stores/gamification'
import { PageHeroSkeleton, StatCardsSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/molecules/skeletons'
import { useI18n } from 'vue-i18n'

const gamificationStore = useGamificationStore()
const { leaderboard, leaderboardNextCursor, leaderboardLoading } = storeToRefs(gamificationStore)
const { t } = useI18n()
const route = useRoute()
const localeParam = computed(() => route.params.locale as string | undefined)
const localePath = (path = '') => (localeParam.value ? `/${localeParam.value}${path}` : path)
const pageLoading = computed(() => leaderboardLoading.value || !leaderboard.value.length)

const loadLeaderboard = async () => {
  try {
    await gamificationStore.fetchLeaderboard()
  } catch (error) {
    const message = error instanceof Error ? error.message : t('leaderboard.empty')
    gamificationStore.pushToast({
      title: t('leaderboard.title'),
      message,
    })
  }
}

onMounted(() => {
  if (!leaderboard.value.length) {
    loadLeaderboard()
  }
})

const loadMore = async () => {
  if (leaderboardNextCursor.value == null) return
  await gamificationStore.fetchLeaderboard({ append: true })
}

const ranking = computed<any[]>(() =>
  [...leaderboard.value].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    return (b.xp ?? 0) - (a.xp ?? 0)
  })
)

const rankingWithGap = computed<any[]>(() => {
  if (!ranking.value.length) return []
  const leaderXp = ranking.value[0]?.xp ?? 0
  return ranking.value.map((entry, index) => ({
    ...entry,
    rank: entry.rank || index + 1,
    xpGap: typeof entry.xpGap === 'number' && !Number.isNaN(entry.xpGap) ? entry.xpGap : Math.max(0, leaderXp - (entry.xp ?? 0)),
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
const podiumTitle = (index) => [t('leaderboard.podium.champion'), t('leaderboard.podium.runnerUp'), t('leaderboard.podium.challenger')][index] ?? t('leaderboard.podium.label')
</script>
