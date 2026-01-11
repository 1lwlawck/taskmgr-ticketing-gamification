<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('team.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('team.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('team.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ members.length }}</p>
            <p class="text-xs text-white/70">{{ t('team.totalMembers') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('team.searchPlaceholder')"
          class="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <template v-if="loading">
       <CardGridSkeleton :count="8" columns-class="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
    </template>

    <!-- Team Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="member in filteredMembers"
        :key="member.id"
        class="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
      >
        <div class="mb-4 flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white">
            {{ member.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="truncate font-semibold text-foreground">{{ member.name }}</h3>
            <p class="truncate text-sm text-muted-foreground">@{{ member.username }}</p>
          </div>
        </div>

        <div class="mb-4">
          <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', getRoleBadgeClass(member.role)]">
            {{ formatRole(member.role) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-border pt-4 text-center">
          <div>
            <p class="text-lg font-bold text-foreground">{{ member.level }}</p>
            <p class="text-xs text-muted-foreground">{{ t('team.level') }}</p>
          </div>
          <div>
            <p class="text-lg font-bold text-foreground">{{ member.totalXp.toLocaleString() }}</p>
            <p class="text-xs text-muted-foreground">XP</p>
          </div>
          <div>
            <p class="text-lg font-bold text-foreground">{{ member.ticketCount }}</p>
            <p class="text-xs text-muted-foreground">{{ t('team.tickets') }}</p>
          </div>
          <div>
            <p class="text-lg font-bold text-foreground">{{ member.projectCount }}</p>
            <p class="text-xs text-muted-foreground">{{ t('team.projects') }}</p>
          </div>
        </div>

        <div class="mt-4 border-t border-border pt-3 text-center text-xs text-muted-foreground">
          {{ t('team.joined') }} {{ formatDate(member.joinedAt) }}
        </div>
      </div>

      <div v-if="!filteredMembers.length" class="col-span-full rounded-2xl border border-border bg-card p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
        </div>
        <p class="text-muted-foreground">{{ t('team.noMembers') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useTeamStore } from '@/stores/team'
import { CardGridSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const teamStore = useTeamStore()
const { members, loading } = storeToRefs(teamStore)

const searchQuery = ref('')

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(
    (m) =>
      m.name.toLowerCase().includes(query) ||
      m.username.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query)
  )
})

function getRoleBadgeClass(role: string) {
  const classes: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    project_manager: 'bg-purple-100 text-purple-700',
    developer: 'bg-blue-100 text-blue-700',
    viewer: 'bg-slate-100 text-slate-700',
  }
  return classes[role] || 'bg-slate-100 text-slate-700'
}

function formatRole(role: string) {
  const labels: Record<string, string> = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    developer: 'Developer',
    viewer: 'Viewer',
  }
  return labels[role] || role
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

onMounted(() => {
  teamStore.fetchMembers()
})
</script>
