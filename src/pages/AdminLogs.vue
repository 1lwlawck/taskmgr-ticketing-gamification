<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('adminLogs.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('adminLogs.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('adminLogs.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ entries.length }}</p>
            <p class="text-xs text-white/70">{{ t('adminLogs.totalEntries') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('adminLogs.searchPlaceholder')"
          class="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        @click="refresh"
        :disabled="loading"
        class="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
      >
        <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ t('common.refresh') || 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading && !entries.length">
      <TableSkeleton :columns="4" :rows="10" />
    </div>

    <!-- Logs Table -->
    <div v-else class="rounded-2xl border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border text-left text-sm text-muted-foreground">
              <th class="px-6 py-4 font-medium">{{ t('adminLogs.timestamp') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminLogs.action') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminLogs.description') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminLogs.user') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in filteredEntries"
              :key="entry.id"
              class="border-b border-border/50 transition hover:bg-slate-50 last:border-0"
            >
              <td class="px-6 py-4">
                <span class="text-sm text-muted-foreground">{{ formatTime(entry.timestamp) }}</span>
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', getActionBadgeClass(entry.action)]">
                  {{ entry.action }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-foreground">{{ entry.description }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-muted-foreground">{{ entry.userId || '-' }}</span>
              </td>
            </tr>
            <tr v-if="!filteredEntries.length">
              <td colspan="4" class="px-6 py-12 text-center text-sm text-muted-foreground">
                {{ t('adminLogs.noLogs') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Load More -->
      <div v-if="nextCursor" class="border-t border-border p-4 text-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-6 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
        >
          {{ loading ? t('common.loading') : t('common.loadMore') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuditStore } from '@/stores/audit'
import { TableSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const auditStore = useAuditStore()
const { entries, loading, nextCursor } = storeToRefs(auditStore)

const searchQuery = ref('')

const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value
  const query = searchQuery.value.toLowerCase()
  return entries.value.filter(
    (e) =>
      e.action.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      (e.userId && e.userId.toLowerCase().includes(query))
  )
})

function getActionBadgeClass(action: string) {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('create') || actionLower.includes('add')) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('change')) {
    return 'bg-blue-100 text-blue-700'
  }
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return 'bg-red-100 text-red-700'
  }
  if (actionLower.includes('login') || actionLower.includes('auth')) {
    return 'bg-purple-100 text-purple-700'
  }
  return 'bg-slate-100 text-slate-700'
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function refresh() {
  auditStore.reset()
  await auditStore.fetchEntries({ limit: 50 })
}

async function loadMore() {
  await auditStore.fetchEntries({ append: true })
}

onMounted(() => {
  auditStore.fetchEntries({ limit: 50 })
})
</script>
