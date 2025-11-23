<template>
  <SidebarRoot class="flex-none border-r border-border bg-slate-50 text-sidebar-foreground">
    <SidebarHeader class="border-b border-border px-4 py-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <span class="text-sm font-semibold">{{ initials }}</span>
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
            :disabled="isActive(item.to)"
            :class="[
              'w-full flex items-center gap-4 rounded-8 px-4 py-3 text-base transition-all',
              isActive(item.to)
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-900 shadow-md font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
            ]"
            @click="navigateTo(item.to)"
          >
            <span class="h-5 w-5" v-html="ICONS[item.icon]"></span>
            <span class="flex-1 truncate">{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- PROJECTS SECTION (langsung setelah Dashboard) -->
        <SidebarMenuItem>
          <SidebarMenuButton
            :is-active="isActive('/projects')"
            :disabled="isActive('/projects')"
            :class="[
              'w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-base transition-all',
              isActive('/projects')
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-900 shadow-md font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            ]"
            @click="navigateTo('/projects')"
          >
            <span class="h-5 w-5" v-html="ICONS.projects"></span>
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
                :disabled="project.id === activeProjectId"
                size="sm"
                :class="[
                  'w-full flex items-center justify-between rounded-8 px-4 py-3 text-sm transition-all',
                  project.id === activeProjectId
                    ? 'bg-zinc-100 border border-zinc-300 shadow text-zinc-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
                @click="navigateTo('/projects')"
              >
                <span class="truncate mr-8">{{ project.name }}</span>
                <SidebarMenuBadge class="!text-xs !font-semibold">
                  {{ project.status }}
                </SidebarMenuBadge>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <!-- View all -->
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                size="sm"
                :disabled="isActive('/projects')"
                :class="[
                  'w-full flex items-center justify-between rounded-8 px-4 py-3 text-sm transition-all',
                  isActive('/projects')
                    ? 'bg-zinc-100 border border-zinc-300 shadow text-zinc-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
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
            :disabled="isActive(item.to)"
            :class="[
              'w-full flex items-center gap-4 rounded-8 px-4 py-3 text-base transition-all',
              isActive(item.to)
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-900 shadow-md font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
            ]"
            @click="navigateTo(item.to)"
          >
            <span class="h-5 w-5" v-html="ICONS[item.icon]"></span>
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
          <div class="rounded-lg border border-border bg-background p-3 text-sm">
            <p class="text-3xl font-semibold text-slate-900">{{ stats?.level ?? 1 }}</p>
            <p class="text-xs text-slate-500">Level</p>
          </div>
          <div class="rounded-lg border border-border bg-background p-3 text-sm">
            <p class="text-3xl font-semibold text-slate-900">
              {{ stats?.xp ?? 0 }}
            </p>
            <p class="text-xs text-slate-500">XP</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" class="w-full" @click="createProject">
          Launch project
        </Button>
        <Button variant="outline" size="sm" class="w-full" @click="handleLogout">
          Logout
        </Button>
      </SidebarGroup>
    </SidebarContent>
  </SidebarRoot>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useProjectsStore } from '@/stores/projects'
import { Button } from '@/components/atoms/ui/button'
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
