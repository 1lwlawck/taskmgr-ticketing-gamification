<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('adminRoles.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('adminRoles.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('adminRoles.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ users.length }}</p>
            <p class="text-xs text-white/70">{{ t('adminRoles.totalUsers') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Definitions -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="role in roleDefinitions" :key="role.value" class="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div class="mb-3 flex items-center gap-3">
          <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', role.bgClass]">
            <span class="text-lg">{{ role.icon }}</span>
          </div>
          <div>
            <h3 class="font-semibold text-foreground">{{ role.label }}</h3>
            <p class="text-xs text-muted-foreground">{{ getUserCountByRole(role.value) }} {{ t('adminRoles.users') }}</p>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">{{ role.description }}</p>
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
          :placeholder="t('adminRoles.searchPlaceholder')"
          class="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <Select
        v-model="roleFilter"
        :options="roleOptions"
        :placeholder="t('adminRoles.allRoles')"
        class="min-w-[180px]"
      />
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <TableSkeleton :columns="4" :rows="10" />
    </div>

    <!-- Users Table -->
    <div v-else class="rounded-2xl border border-border bg-card shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border text-left text-sm text-muted-foreground">
              <th class="px-6 py-4 font-medium">{{ t('adminRoles.user') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminRoles.username') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminRoles.currentRole') }}</th>
              <th class="px-6 py-4 font-medium">{{ t('adminRoles.changeRole') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-b border-border/50 transition hover:bg-slate-50 last:border-0"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-foreground">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-muted-foreground">@{{ user.username }}</td>
              <td class="px-6 py-4">
                <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', getRoleBadgeClass(user.role)]">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <Select
                  :model-value="user.role"
                  :options="roleDefinitions"
                  :disabled="updatingUserId === user.id || !isAdmin"
                  class="min-w-[140px]"
                  @change="(val) => handleRoleChange(user.id, val)"
                />
              </td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="4" class="px-6 py-12 text-center text-sm text-muted-foreground">
                {{ t('adminRoles.noUsers') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Admin Only Notice -->
    <div v-if="!isAdmin" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
      <p class="text-sm text-amber-700">{{ t('adminRoles.adminOnly') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import Select from '@/components/ui/select/Select.vue'
import { TableSkeleton } from '@/components/molecules/skeletons'
import type { Role } from '@/utils/constants'

const { t } = useI18n()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const { users, loading } = storeToRefs(usersStore)

const searchQuery = ref('')
const roleFilter = ref('')
const roleOptions = computed(() => [
  { value: '', label: t('adminRoles.allRoles') },
  ...roleDefinitions
])
const updatingUserId = ref<string | null>(null)

const isAdmin = computed(() => authStore.currentUser?.role === 'admin')

const roleDefinitions = [
  { value: 'admin', label: 'Admin', icon: '👑', bgClass: 'bg-red-100', description: 'Full system access' },
  { value: 'project_manager', label: 'Project Manager', icon: '📋', bgClass: 'bg-purple-100', description: 'Manage projects & teams' },
  { value: 'developer', label: 'Developer', icon: '💻', bgClass: 'bg-blue-100', description: 'Work on tickets' },
  { value: 'viewer', label: 'Viewer', icon: '👁️', bgClass: 'bg-slate-100', description: 'Read-only access' },
]

const filteredUsers = computed(() => {
  let result = users.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (u) => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
    )
  }
  if (roleFilter.value) {
    result = result.filter((u) => u.role === roleFilter.value)
  }
  return result
})

function getUserCountByRole(role: string) {
  return users.value.filter((u) => u.role === role).length
}

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

async function handleRoleChange(userId: string, newRole: string) {
  if (!isAdmin.value) return
  updatingUserId.value = userId
  try {
    await usersStore.updateUserRole(userId, newRole as Role)
  } catch (e) {
    console.error('Failed to update role:', e)
  } finally {
    updatingUserId.value = null
  }
}

onMounted(() => {
  usersStore.fetchUsers()
})
</script>
