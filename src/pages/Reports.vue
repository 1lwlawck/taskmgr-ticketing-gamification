<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('reports.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('reports.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('reports.heroDesc') }}</p>
        </div>
        <button
          @click="refresh"
          class="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ t('common.refresh') || 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading && !summary" class="space-y-8">
      <StatCardsSkeleton />
      <CardGridSkeleton :count="2" columns-class="grid-cols-1 lg:grid-cols-2" />
      <CardGridSkeleton :count="2" columns-class="grid-cols-1 lg:grid-cols-2" />
    </div>

    <!-- Summary Cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('reports.totalTickets') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summary?.totalTickets || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('reports.closedTickets') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summary?.closedTickets || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('reports.openTickets') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summary?.openTickets || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('reports.activeProjects') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summary?.activeProjects || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Status Breakdown -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-semibold text-foreground">{{ t('reports.statusBreakdown') }}</h3>
        <div class="space-y-3">
          <div v-for="item in statusBreakdown" :key="item.status" class="flex items-center gap-3">
            <div class="w-24 text-sm text-muted-foreground capitalize">{{ item.status.replace('_', ' ') }}</div>
            <div class="flex-1">
              <div class="h-6 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getStatusColor(item.status)"
                  :style="{ width: `${getPercentage(item.count, totalStatusCount)}%` }"
                ></div>
              </div>
            </div>
            <div class="w-12 text-right text-sm font-medium text-foreground">{{ item.count }}</div>
          </div>
          <div v-if="!statusBreakdown.length" class="py-8 text-center text-sm text-muted-foreground">
            {{ t('common.noData') || 'No data available' }}
          </div>
        </div>
      </div>

      <!-- Priority Breakdown -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-semibold text-foreground">{{ t('reports.priorityBreakdown') }}</h3>
        <div class="space-y-3">
          <div v-for="item in priorityBreakdown" :key="item.priority" class="flex items-center gap-3">
            <div class="w-24 text-sm text-muted-foreground capitalize">{{ item.priority }}</div>
            <div class="flex-1">
              <div class="h-6 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getPriorityColor(item.priority)"
                  :style="{ width: `${getPercentage(item.count, totalPriorityCount)}%` }"
                ></div>
              </div>
            </div>
            <div class="w-12 text-right text-sm font-medium text-foreground">{{ item.count }}</div>
          </div>
          <div v-if="!priorityBreakdown.length" class="py-8 text-center text-sm text-muted-foreground">
            {{ t('common.noData') || 'No data available' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Team Performance -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-foreground">{{ t('reports.teamPerformance') }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border text-left text-sm text-muted-foreground">
              <th class="pb-3 font-medium">{{ t('reports.member') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('reports.level') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('reports.xp') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('reports.ticketsClosed') }}</th>
              <th class="pb-3 font-medium text-center">{{ t('reports.streak') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in teamPerformance" :key="member.userId" class="border-b border-border/50 last:border-0">
              <td class="py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                    {{ member.userName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-foreground">{{ member.userName }}</span>
                </div>
              </td>
              <td class="py-3 text-center">
                <span class="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                  Lv. {{ member.level }}
                </span>
              </td>
              <td class="py-3 text-center font-medium text-foreground">{{ member.totalXp.toLocaleString() }}</td>
              <td class="py-3 text-center font-medium text-foreground">{{ member.ticketsClosed }}</td>
              <td class="py-3 text-center">
                <span v-if="member.currentStreak > 0" class="inline-flex items-center gap-1 text-amber-600">
                  🔥 {{ member.currentStreak }}d
                </span>
                <span v-else class="text-muted-foreground">-</span>
              </td>
            </tr>
            <tr v-if="!teamPerformance.length">
              <td colspan="5" class="py-8 text-center text-sm text-muted-foreground">
                {{ t('common.noData') || 'No data available' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ticket Trend -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-foreground">{{ t('reports.ticketTrend') }}</h3>
      <div class="h-64">
        <div v-if="ticketTrend.length" class="flex h-full items-end gap-1">
          <div
            v-for="(item, idx) in ticketTrend.slice(-14)"
            :key="idx"
            class="group relative h-full flex-1"
          >
            <div class="flex h-full flex-col justify-end gap-1">
              <div
                class="w-full rounded-t bg-emerald-500 transition-all hover:bg-emerald-400"
                :style="{ height: `${getBarHeight(item.closed)}%` }"
              ></div>
              <div
                class="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-400"
                :style="{ height: `${getBarHeight(item.created)}%` }"
              ></div>
            </div>
            <div class="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">
              {{ formatDate(item.date) }}: {{ item.created }} created, {{ item.closed }} closed
            </div>
          </div>
        </div>
        <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">
          {{ t('common.noData') || 'No data available' }}
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="h-3 w-3 rounded bg-indigo-500"></div>
          <span class="text-muted-foreground">{{ t('reports.created') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-3 w-3 rounded bg-emerald-500"></div>
          <span class="text-muted-foreground">{{ t('reports.closed') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useReportsStore } from '@/stores/reports'
import { StatCardsSkeleton, CardGridSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const reportsStore = useReportsStore()

const { summary, statusBreakdown, priorityBreakdown, teamPerformance, ticketTrend, loading } = storeToRefs(reportsStore)

const totalStatusCount = computed(() => statusBreakdown.value.reduce((acc, item) => acc + item.count, 0))
const totalPriorityCount = computed(() => priorityBreakdown.value.reduce((acc, item) => acc + item.count, 0))
const maxTrendValue = computed(() => {
  const max = Math.max(...ticketTrend.value.map((t) => Math.max(t.created, t.closed)), 1)
  return max
})

function getPercentage(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    backlog: 'bg-slate-400',
    todo: 'bg-blue-500',
    in_progress: 'bg-amber-500',
    review: 'bg-purple-500',
    done: 'bg-emerald-500',
  }
  return colors[status] || 'bg-slate-400'
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500',
  }
  return colors[priority] || 'bg-slate-400'
}

function getBarHeight(value: number) {
  return Math.round((value / maxTrendValue.value) * 100)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

async function refresh() {
  await reportsStore.fetchAll()
}

onMounted(() => {
  reportsStore.fetchAll()
})
</script>
