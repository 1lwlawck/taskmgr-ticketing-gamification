<template>
  <SidebarRoot class="sidebar-white flex-none border-r border-border text-sidebar-foreground">
    <SidebarHeader class="border-b border-border px-4 py-4">
      <div class="flex items-center gap-3">
        <div
          class="relative h-10 w-10 overflow-hidden rounded-full shadow-lg ring-2 ring-indigo-100 ring-offset-2 ring-offset-white"
          :style="avatarGradient(currentUser?.name)"
        >
          <span class="absolute inset-0 bg-black/10"></span>
          <span class="relative flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-white drop-shadow">
            {{ initials }}
          </span>
        </div>
        <div class="flex-1 space-y-1 text-sm">
          <p class="text-base font-semibold text-sidebar-foreground">
            {{ currentUser?.name ?? t('sidebar.defaultName') }}
          </p>
          <p class="text-xs text-slate-500">{{ currentUser?.role ?? t('sidebar.defaultRole') }}</p>
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
        {{ t('sidebar.tagline') }}
      </p>
    </SidebarHeader>

    <SidebarContent class="flex flex-1 flex-col justify-between px-2 py-4">
      <div class="flex flex-col gap-6">
        <!-- OVERVIEW SECTION -->
        <div class="space-y-2">
          <p class="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ t('nav.categories.overview') }}</p>
          <SidebarMenu class="space-y-1">
            <SidebarMenuItem v-for="item in overviewNav" :key="item.to">
              <SidebarMenuButton
                :is-active="isActive(item.to)"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive(item.to)
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-bold [&_span]:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                ]"
                :style="isActive(item.to) ? activeGradientStyle : undefined"
                @click="navigateTo(item.to)"
              >
                <span class="h-4 w-4 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
                <span class="flex-1 truncate">{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <!-- WORKSPACE SECTION -->
        <div class="space-y-2">
          <p class="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ t('nav.categories.workspace') }}</p>
          <SidebarMenu class="space-y-1">
            <!-- Projects with submenu -->
            <SidebarMenuItem>
              <SidebarMenuButton
                :is-active="isActive('/projects')"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive('/projects')
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                ]"
                :style="isActive('/projects') ? activeGradientStyle : undefined"
                @click="navigateTo('/projects')"
              >
                <span class="h-4 w-4 transition-colors" :class="isActive('/projects') ? 'text-white' : 'text-slate-500'" v-html="ICONS.projects"></span>
                <span class="flex-1 truncate" :class="isActive('/projects') ? 'text-white' : ''">{{ t('nav.projects') }}</span>
                <span 
                  class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="isActive('/projects') ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'"
                >{{ projects?.length ?? 0 }}</span>
              </SidebarMenuButton>

              <!-- Projects submenu -->
              <SidebarMenuSub class="mt-1 ml-5 space-y-0.5 border-l border-slate-200 pl-3">
                <SidebarMenuSubItem v-for="project in highlightedProjects" :key="project.id">
                  <SidebarMenuSubButton
                    :is-active="project.id === activeProjectId"
                    size="sm"
                    :class="[
                      'w-full flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-xs transition-colors',
                      project.id === activeProjectId
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-500 -ml-px'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                    ]"
                    @click="navigateTo(`/projects/${project.id}`)"
                  >
                    <span class="truncate">{{ project.name }}</span>
                    <span 
                      class="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      :class="project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ project.status }}
                    </span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <!-- Other workspace items -->
            <SidebarMenuItem v-for="item in workspaceNav" :key="item.to">
              <SidebarMenuButton
                :is-active="isActive(item.to)"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive(item.to)
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                ]"
                :style="isActive(item.to) ? activeGradientStyle : undefined"
                @click="navigateTo(item.to)"
              >
                <span class="h-4 w-4 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
                <span class="flex-1 truncate">{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <!-- COMMUNITY SECTION -->
        <div class="space-y-2">
          <p class="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ t('nav.categories.community') }}</p>
          <SidebarMenu class="space-y-1">
            <SidebarMenuItem v-for="item in communityNav" :key="item.to">
              <SidebarMenuButton
                :is-active="isActive(item.to)"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive(item.to)
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                ]"
                :style="isActive(item.to) ? activeGradientStyle : undefined"
                @click="navigateTo(item.to)"
              >
                <span class="h-4 w-4 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
                <span class="flex-1 truncate">{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <!-- ACCOUNT SECTION -->
        <div class="space-y-2">
          <p class="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ t('nav.categories.account') }}</p>
          <SidebarMenu class="space-y-1">
            <SidebarMenuItem v-for="item in accountNav" :key="item.to">
              <SidebarMenuButton
                :is-active="isActive(item.to)"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive(item.to)
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-semibold [&_span]:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                ]"
                :style="isActive(item.to) ? activeGradientStyle : undefined"
                @click="navigateTo(item.to)"
              >
                <span class="h-4 w-4 text-slate-500 transition-colors" v-html="ICONS[item.icon]"></span>
                <span class="flex-1 truncate">{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <!-- ADMIN SECTION (only for admins) -->
        <div v-if="adminNav.length" class="space-y-2">
          <p class="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ t('nav.categories.admin') }}</p>
          <SidebarMenu class="space-y-1">
            <SidebarMenuItem v-for="item in adminNav" :key="item.to">
              <SidebarMenuButton
                :is-active="isActive(item.to)"
                :class="[
                  'w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                  isActive(item.to)
                    ? 'border border-slate-800 text-white shadow-md shadow-indigo-500/25 backdrop-blur font-bold [&_span]:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                ]"
                :style="isActive(item.to) ? activeGradientStyle : undefined"
                @click="navigateTo(item.to)"
              >
                <span 
                  class="h-4 w-4 text-slate-500 transition-colors" 
                  v-html="ICONS[item.icon]"
                ></span>
                <span class="flex-1 truncate">{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>

      <div class="flex flex-col gap-3">
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
          <p class="text-xs text-slate-500">{{ t('sidebar.level') }}</p>
          </div>
          <div class="rounded-lg border border-emerald-100 bg-white p-3 text-sm shadow-sm">
            <p class="text-3xl font-semibold text-slate-900">
              {{ stats?.xp ?? 0 }}
            </p>
            <p class="text-xs text-slate-500">{{ t('sidebar.xp') }}</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          class="w-full border-0 bg-[linear-gradient(135deg,#0b1224,#10182f,#1c2650)] text-white shadow-md shadow-indigo-900/30 transition hover:brightness-110 hover:shadow-lg"
          @click="createProject"
        >
          {{ t('sidebar.launchProject') }}
        </Button>
        <Button variant="outline" size="sm" class="w-full hover:border-indigo-200 hover:text-indigo-700" @click="handleLogout">
          {{ t('sidebar.logout') }}
        </Button>
        </SidebarGroup>
        <ConfirmModal
          :open="logoutConfirm"
          :title="t('sidebar.logoutTitle')"
          :message="t('sidebar.logoutMessage')"
          @cancel="logoutConfirm = false"
          @confirm="confirmLogout"
        />
      </div>
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
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()
const localeParam = computed(() => (route.params.locale as string | undefined))

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
  reports:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  kanban:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="18" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="12" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
  team:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  achievements:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="2"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  challenges:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.79 1.03 1.51 1.08H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  activity:
    '<svg viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  logs:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  roles:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
} as const

type IconKey = keyof typeof ICONS

interface NavItem {
  label: string
  to: string
  icon: IconKey
  role?: Role
  category: 'overview' | 'workspace' | 'community' | 'account' | 'admin'
}

const nav = computed<NavItem[]>(() => [
  { label: t('nav.dashboard'), to: '/dashboard', icon: 'dashboard', category: 'overview' },
  { label: t('nav.reports'), to: '/reports', icon: 'reports', category: 'overview' },
  { label: t('nav.epics'), to: '/epics', icon: 'epics', category: 'workspace' },
  { label: t('nav.tickets'), to: '/tickets', icon: 'tickets', category: 'workspace' },
  { label: t('nav.calendar'), to: '/calendar', icon: 'calendar', category: 'workspace' },
  { label: t('nav.kanban'), to: '/kanban', icon: 'kanban', category: 'workspace' },
  { label: t('nav.team'), to: '/team', icon: 'team', category: 'workspace' },
  { label: t('nav.leaderboard'), to: '/leaderboard', icon: 'leaderboard', category: 'community' },
  { label: t('nav.achievements'), to: '/achievements', icon: 'achievements', category: 'community' },
  { label: t('nav.challenges'), to: '/challenges', icon: 'challenges', category: 'community' },
  { label: t('nav.profile'), to: '/profile', icon: 'profile', category: 'account' },
  { label: t('nav.settings'), to: '/settings', icon: 'settings', category: 'account' },
  { label: t('nav.activity'), to: '/activity', icon: 'activity', category: 'account' },
  { label: t('nav.admin'), to: '/admin/roles', icon: 'shield', role: 'admin', category: 'admin' },
  { label: t('nav.adminLogs'), to: '/admin/logs', icon: 'logs', role: 'admin', category: 'admin' },
])

const mainNav = computed(() =>
  nav.value.filter((item) => !item.role || currentUser.value?.role === item.role)
)

// Categorized navigation
const overviewNav = computed(() =>
  mainNav.value.filter((item) => item.category === 'overview')
)

const workspaceNav = computed(() =>
  mainNav.value.filter((item) => item.category === 'workspace')
)

const communityNav = computed(() =>
  mainNav.value.filter((item) => item.category === 'community')
)

const accountNav = computed(() =>
  mainNav.value.filter((item) => item.category === 'account')
)

const adminNav = computed(() =>
  mainNav.value.filter((item) => item.category === 'admin')
)

const highlightedProjects = computed(() =>
  projects.value.slice(0, 3).map((project) => ({
    ...project,
    status: project.status ?? 'Active',
  }))
)

const activeProjectId = computed(() => {
  // Get project ID from current route
  const pathParts = route.path.split('/')
  const projectsIndex = pathParts.findIndex(p => p === 'projects')
  if (projectsIndex !== -1 && pathParts[projectsIndex + 1]) {
    return pathParts[projectsIndex + 1]
  }
  return null
})

const projectBonus = computed(() =>
  projects.value.length >= 3 ? t('sidebar.projectHighlight') : t('sidebar.projectStart')
)

const streakLabel = computed(
  () => `${projectBonus.value} - ${stats.value?.streak ?? '0'} ${t('sidebar.streakLabel')}`
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

const stripLocale = (path: string) => path.replace(/^\/(en|id)(?=\/|$)/, '')
const isActive = (path: string) => {
  const current = stripLocale(route.path)
  return current === path || current.startsWith(`${path}/`)
}

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

  const target = localeParam.value ? { path: `/${localeParam.value}${path}` } : { path }
  router.push(target)
  closeOnMobile()
}

const handleLogout = () => {
  logoutConfirm.value = true
}

const confirmLogout = () => {
  logoutConfirm.value = false
  authStore.logout()
  router.push(localeParam.value ? { path: `/${localeParam.value}/login` } : '/login')
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
