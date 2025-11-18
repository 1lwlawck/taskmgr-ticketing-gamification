<template>
  <aside
    class="fixed inset-y-0 z-40 w-64 transform border-r border-slate-200 bg-white p-6 transition-transform lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
    :class="sidebarClasses"
  >
    <div class="mb-10 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket Ops</p>
        <p class="text-xl font-semibold text-slate-900 dark:text-white">Control Center</p>
      </div>
      <button class="text-slate-400 hover:text-slate-900 lg:hidden" @click="$emit('close')" aria-label="Close sidebar">
        ✕
      </button>
    </div>

    <nav class="space-y-2">
      <button
        v-for="item in filteredNav"
        :key="item.to"
        @click="goTo(item.to)"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition"
        :class="
          isActive(item.to)
            ? 'border border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        "
      >
        <span class="icon h-5 w-5" v-html="ICONS[item.icon]"></span>
        {{ item.label }}
      </button>
    </nav>

    <div class="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <p class="text-xs text-slate-500">Current streak</p>
      <p class="text-3xl font-semibold text-slate-900 dark:text-white">{{ stats?.tickets_closed_count ?? 0 }}</p>
      <p class="text-xs text-slate-500">tickets closed</p>
    </div>

    <button
      class="mt-8 flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      @click="handleLogout"
    >
      Logout
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'

const props = defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const gamificationStore = useGamificationStore()

const { currentUser } = storeToRefs(authStore)
const { userStats } = storeToRefs(gamificationStore)

const stats = computed(() => {
  if (!currentUser.value) return null
  return userStats.value[currentUser.value.id]
})

const ICONS = {
  dashboard:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  projects:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 11h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  tickets:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M21 10V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  leaderboard:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M4 16h4V8H4zM10 16h4V4h-4zM16 16h4V11h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  admin:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="2"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  profile:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M5 21v-2a7 7 0 1 1 14 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  join:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
}

const nav = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Projects', to: '/projects', icon: 'projects' },
  { label: 'Tickets', to: '/tickets', icon: 'tickets' },
  { label: 'Leaderboard', to: '/leaderboard', icon: 'leaderboard' },
  { label: 'Admin', to: '/admin/users', icon: 'admin', role: 'admin' },
  { label: 'Profile', to: '/profile', icon: 'profile' },
]

const filteredNav = computed(() =>
  nav.filter((item) => {
    if (!item.role) return true
    return currentUser.value?.role === item.role
  })
)

const sidebarClasses = computed(() =>
  props.open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goTo = (path) => {
  router.push(path)
}

const isActive = (path) => route.path.startsWith(path)
</script>
