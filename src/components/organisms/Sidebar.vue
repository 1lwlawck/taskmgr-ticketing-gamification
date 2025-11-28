<template>
  <SidebarRoot class="sidebar-white flex-none border-r border-border text-sidebar-foreground">
    <SidebarHeader class="border-b border-border px-4 py-4">
      <div class="flex items-center gap-3">
        <div
          class="relative h-10 w-10 overflow-hidden rounded-full shadow-lg ring-2 ring-indigo-100 ring-offset-2 ring-offset-white"
          :style="avatarGradient(currentUser?.name)"
        >
          <span class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 opacity-80"></span>
          <span class="relative flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-white drop-shadow">
            {{ initials }}
          </span>
        </div>
        <div class="flex-1 space-y-1 text-sm">
          <p class="text-base font-semibold text-sidebar-foreground">
            {{ currentUser?.name ?? 'Ticket Operator' }}
          </p>
          <p class="text-xs text-slate-500">{{ currentUser?.role ?? 'viewer' }}</p>
        </div>
        <button
          class="text-slate-400 hover:text-slate-900 lg:hidden"
          aria-label="Close sidebar"
          @click="closeOnMobile"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        Earn badges and sharpen your response streaks.
      </p>
    </SidebarHeader>

    <SidebarContent class="flex flex-col gap-4 px-2 py-4">
      <SidebarMenu class="space-y-2">

        <SidebarMenuItem v-for="item in primaryNav" :key="item.to">
          <SidebarMenuButton
            :is-active="isActive(item.to)"
            :class="[
              'w-full flex items-center gap-4 rounded-8 px-4 py-3 text-base transition-all',
              isActive(item.to)
                ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                : 'text-slate-600 hover:bg-white hover:border hover:border-indigo-100 hover:text-slate-900 font-semibold shadow-sm'
            ]"
            :style="isActive(item.to) ? activeGradientStyle : undefined"
            @click="navigateTo(item.to)"
          >
            <span class="h-5 w-5 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
            <span class="flex-1 truncate">{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- PROJECTS SECTION (langsung setelah Dashboard) -->
        <SidebarMenuItem>
          <SidebarMenuButton
            :is-active="isActive('/projects')"
            :class="[
              'w-full flex items-center gap-4 rounded-md px-4 py-3 text-base transition-all',
              isActive('/projects')
                ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                : 'text-slate-600 hover:bg-white hover:border hover:border-indigo-100 hover:text-slate-900 shadow-sm'
            ]"
            :style="isActive('/projects') ? activeGradientStyle : undefined"
            @click="navigateTo('/projects')"
          >
            <span class="h-5 w-5 text-slate-500 transition-colors" v-html="ICONS.projects"></span>
            <span class="flex-1 truncate font-semibold">Projects</span>
            <span class="text-xs uppercase text-slate-400 font-semibold">team</span>
          </SidebarMenuButton>

          <!-- Sub menu (Projects list) -->
          <SidebarMenuSub class="mt-2 space-y-1">
            <!-- Highlighted Projects -->
            <SidebarMenuSubItem
              v-for="project in highlightedProjects"
              :key="project.id"
            >
              <SidebarMenuSubButton
                :is-active="project.id === activeProjectId"
                size="sm"
                :class="[
                  'w-full flex items-center justify-between rounded-8 px-4 py-3 text-sm transition-all',
                  project.id === activeProjectId
                    ? 'border border-slate-800 text-white shadow backdrop-blur font-medium shadow-indigo-500/25 [&_span]:text-white'
                    : 'text-slate-600 hover:bg-white hover:border hover:border-indigo-100 hover:text-slate-900 shadow-sm'
                ]"
                :style="project.id === activeProjectId ? activeGradientStyle : undefined"
                @click="navigateTo('/projects')"
              >
                <span class="truncate mr-8">{{ project.name }}</span>
                <SidebarMenuBadge class="!text-xs !font-semibold text-white">
                  {{ project.status }}
                </SidebarMenuBadge>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <!-- View all -->
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                size="sm"
                :class="[
                  'w-full flex items-center justify-between rounded-8 px-4 py-3 text-sm transition-all',
                  isActive('/projects')
                    ? 'border border-slate-800 text-white shadow backdrop-blur font-medium shadow-indigo-500/25 [&_span]:text-white'
                    : 'text-slate-600 hover:bg-white hover:border hover:border-indigo-100 hover:text-slate-900 shadow-sm'
                ]"
                :style="isActive('/projects') ? activeGradientStyle : undefined"
                @click="navigateTo('/projects')"
              >
                <span>View all projects</span>
                <span class="text-xs font-semibold text-slate-500">
                  {{ projects?.length ?? 0 }}
                </span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>

        <!-- MAIN NAV (menu lain: Tickets, Leaderboard, Profile, Admin) -->
        <SidebarMenuItem v-for="item in secondaryNav" :key="item.to">
          <SidebarMenuButton
            :is-active="isActive(item.to)"
            :class="[
              'w-full flex items-center gap-4 rounded-8 px-4 py-3 text-base transition-all',
              isActive(item.to)
                ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                : 'text-slate-600 hover:bg-white hover:border hover:border-indigo-100 hover:text-slate-900 font-semibold shadow-sm'
            ]"
            :style="isActive(item.to) ? activeGradientStyle : undefined"
            @click="navigateTo(item.to)"
          >
            <span class="h-5 w-5 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
            <span class="flex-1 truncate">{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>

      <SidebarSeparator class="border-border opacity-40" />

      <SidebarGroup class="space-y-3 px-1">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
            Streak
          </p>
          <p class="text-xs text-slate-400">{{ streakLabel }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-indigo-100 bg-white p-3 text-sm shadow-sm">
            <p class="text-3xl font-semibold text-slate-900">{{ stats?.level ?? 1 }}</p>
            <p class="text-xs text-slate-500">Level</p>
          </div>
          <div class="rounded-lg border border-emerald-100 bg-white p-3 text-sm shadow-sm">
            <p class="text-3xl font-semibold text-slate-900">
              {{ stats?.xp ?? 0 }}
            </p>
            <p class="text-xs text-slate-500">XP</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          class="w-full border-0 bg-[linear-gradient(135deg,#0b1224,#10182f,#1c2650)] text-white shadow-md shadow-indigo-900/30 transition hover:brightness-110 hover:shadow-lg"
          @click="createProject"
        >
          Launch project
        </Button>
        <Button variant="outline" size="sm" class="w-full hover:border-indigo-200 hover:text-indigo-700" @click="handleLogout">
          Logout
        </Button>
      </SidebarGroup>
      <ConfirmModal
        :open="logoutConfirm"
        title="Logout"
        message="Are you sure you want to logout?"
        @cancel="logoutConfirm = false"
        @confirm="confirmLogout"
      />
    </SidebarContent>
  </SidebarRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useProjectsStore } from '@/stores/projects'
import { Button } from '@/components/atoms/ui/button'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/atoms/ui/sidebar'
import type { GamificationStats } from '@/types/models'
import type { Role } from '@/utils/constants'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const gamificationStore = useGamificationStore()
const projectsStore = useProjectsStore()

const { currentUser } = storeToRefs(authStore)
const { userStats } = storeToRefs(gamificationStore)
const { projects } = storeToRefs(projectsStore)

const { isMobile, setOpenMobile } = useSidebar()

const stats = computed<GamificationStats | null>(() => {
  if (!currentUser.value) return null
  return userStats.value[currentUser.value.id] ?? null
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
  epics:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  profile:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M5 21v-2a7 7 0 1 1 14 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4 6v6c0 5 3.5 9 8 9s8-4 8-9V6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 13h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
} as const

type IconKey = keyof typeof ICONS

interface NavItem {
  label: string
  to: string
  icon: IconKey
  role?: Role
}

const nav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Epics', to: '/epics', icon: 'epics' },  
  { label: 'Tickets', to: '/tickets', icon: 'tickets' },
  
  { label: 'Leaderboard', to: '/leaderboard', icon: 'leaderboard' },
  { label: 'Profile', to: '/profile', icon: 'profile' },
  { label: 'Admin', to: '/admin/users', icon: 'shield', role: 'admin' },
]

const mainNav = computed(() =>
  nav.filter((item) => !item.role || currentUser.value?.role === item.role)
)

// Dashboard saja
const primaryNav = computed(() =>
  mainNav.value.filter((item) => item.label === 'Dashboard')
)

// Menu lain setelah Projects
const secondaryNav = computed(() =>
  mainNav.value.filter((item) => item.label !== 'Dashboard')
)

const highlightedProjects = computed(() =>
  projects.value.slice(0, 3).map((project) => ({
    ...project,
    status: project.status ?? 'Active',
  }))
)

const activeProjectId = computed(() => projects.value[0]?.id ?? null)

const projectBonus = computed(() =>
  projects.value.length >= 3 ? 'Hot streak' : 'Getting started'
)

const streakLabel = computed(
  () => `${projectBonus.value} • ${stats.value?.streak ?? '0'} days`
)

const initials = computed(() => {
  if (!currentUser.value?.name) return 'OO'
  return currentUser.value.name
    .split(' ')
    .map((piece) => piece[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})
const avatarGradient = (seed = '') => {
  const palette = [
    ['#6366F1', '#22D3EE', '#34D399'],
    ['#7C3AED', '#60A5FA', '#2DD4BF'],
    ['#06B6D4', '#0EA5E9', '#8B5CF6'],
    ['#F59E0B', '#F97316', '#EC4899'],
  ]
  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const colors = palette[hash % palette.length]
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
  }
}
const activeGradientStyle = {
  background: 'linear-gradient(135deg, #0b1224 0%, #10182f 45%, #1c2650 100%)',
}
const logoutConfirm = ref(false)

const isActive = (path: string) => route.path === path

const closeOnMobile = () => {
  if (isMobile.value) {
    setOpenMobile(false)
  }
}

const navigateTo = (path: string) => {
  if (route.path === path) {
    // sudah di route ini, cukup tutup sidebar mobile
    closeOnMobile()
    return
  }

  router.push(path)
  closeOnMobile()
}

const handleLogout = () => {
  logoutConfirm.value = true
}

const confirmLogout = () => {
  logoutConfirm.value = false
  authStore.logout()
  router.push('/login')
  closeOnMobile()
}

const createProject = () => {
  navigateTo('/projects')
}

watch(
  () => route.fullPath,
  () => {
    closeOnMobile()
  }
)
</script>

<style scoped>
.sidebar-white :deep([data-sidebar="sidebar"]) {
  background: #ffffff;
}
.sidebar-white :deep([data-mobile="true"]) {
  background: #ffffff;
}
</style>
