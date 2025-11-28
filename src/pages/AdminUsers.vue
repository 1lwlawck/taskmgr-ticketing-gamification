<template>
  <section class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">Control tower</p>
          <h1 class="text-3xl font-semibold">Admin Panel</h1>
          <p class="text-sm text-white/70">Kelola role, undang user baru, dan awasi audit log.</p>
          <div class="grid gap-4 text-sm sm:grid-cols-3">
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">Total user</p>
              <p class="text-3xl font-semibold">{{ users.length }}</p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">Admin</p>
              <p class="text-3xl font-semibold">{{ adminCount }}</p>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p class="text-xs uppercase text-white/60">Audit terbaru</p>
              <p class="text-lg font-semibold">{{ audit[0]?.action ?? 'Tidak ada' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div class="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">User management</p>
            <h2 class="text-xl font-semibold text-foreground">Daftar user</h2>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              size="sm"
              variant="ghost"
              :class="menuStatus === 'active' ? 'text-foreground font-semibold' : ''"
              @click="menuStatus = 'active'"
            >
              Semua
            </Button>
            <Button
              size="sm"
              variant="ghost"
              :class="menuStatus === 'inactive' ? 'text-foreground font-semibold' : ''"
              @click="menuStatus = 'inactive'"
            >
              Limit 3
            </Button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Input v-model="searchQuery" placeholder="Cari nama atau username" class="w-full flex-1 rounded-2xl border border-border bg-white/80 shadow-sm" />
          <span class="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
            {{ visibleUsers.length }} user
          </span>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-border shadow-inner">
          <table class="min-w-full divide-y divide-border text-sm text-foreground">
            <thead class="bg-muted/50 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th class="px-4 py-3 text-left">User</th>
                <th class="px-4 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border bg-card">
              <tr v-for="user in visibleUsers" :key="user.id" class="transition hover:bg-muted/40">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-lg ring-2 ring-indigo-100 ring-offset-2 ring-offset-white"
                      :style="gradientAvatar(user.name)"
                    >
                      <span class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 opacity-80"></span>
                      <span class="relative flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-white drop-shadow">
                        {{ initials(user.name) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-base font-semibold text-foreground">{{ user.name }}</p>
                      <p class="text-xs text-muted-foreground">@{{ user.username }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <!-- <span class="rounded-full px-3 py-1 text-[11px] font-semibold uppercase" :class="roleBadgeClass(user.role)">
                      {{ roleLabel(user.role) }}
                    </span> -->
                    <select
                      :disabled="!isAdmin"
                      v-model="user.role"
                      class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                      @change="(event) => onRoleChange(user.id, event)"
                    >
                      <option value="admin">Admin</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!isAdmin" class="text-xs text-muted-foreground">Hanya admin yang boleh mengganti role.</p>
      </div>

      <div class="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Audit log</p>
            <h2 class="text-lg font-semibold text-foreground">Aktivitas</h2>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ audit.length }} entries</span>
            <Button
              v-if="nextCursor"
              size="xs"
              variant="outline"
              class="h-7 px-2"
              @click="loadMoreAudit"
            >
              Load more
            </Button>
          </div>
        </div>
        <div class="max-h-[450px] overflow-y-auto rounded-md border border-border/60">
          <ul class="divide-y divide-border">
            <li v-for="entry in audit" :key="entry.id" class="px-4 py-4 text-sm text-foreground">
              <p class="text-base font-semibold text-foreground">{{ entry.action }}</p>
              <p class="text-xs text-muted-foreground">{{ entry.description }} - {{ formatDateTime(entry.timestamp) }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { useAuditStore } from '@/stores/audit'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'
import { formatDateTime } from '@/utils/helpers'
import type { Role } from '@/utils/constants'

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const auditStore = useAuditStore()
const { entries, nextCursor } = storeToRefs(auditStore)
const audit = entries
const auth = useAuthStore()
const isAdmin = computed(() => auth.currentUser?.role === 'admin')
const searchQuery = ref('')
const menuStatus = ref('active')

const visibleUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const filtered = users.value.filter((user) =>
    user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query)
  )
  return filtered.slice(0, menuStatus.value === 'active' ? filtered.length : 3)
})

const adminCount = computed(() => users.value.filter((user) => user.role === 'admin').length)
const roleLabel = (role: Role) => {
  const map: Record<Role, string> = {
    admin: 'Admin',
    project_manager: 'Project Manager',
    developer: 'Developer',
    viewer: 'Viewer',
  }
  return map[role] ?? role
}
const roleBadgeClass = (role: Role) => {
  const map: Record<Role, string> = {
    admin: 'border border-amber-200 bg-amber-50 text-amber-700',
    project_manager: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
    developer: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    viewer: 'border border-slate-200 bg-slate-50 text-slate-600',
  }
  return map[role] ?? 'border border-slate-200 bg-slate-50 text-slate-600'
}
const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
const gradientAvatar = (seed = '') => {
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

const onRoleChange = async (userId: string, event: Event) => {
  const target = event.target as HTMLSelectElement | null
  const role = (target?.value ?? '') as Role
  await updateRole(userId, role)
}

const updateRole = async (userId: string, role: Role) => {
  if (!isAdmin.value) return
  try {
    await usersStore.updateUserRole(userId, role)
  } catch (error) {
    console.error(error)
  }
}

const loadMoreAudit = async () => {
  if (!nextCursor.value) return
  await auditStore.fetchEntries({ append: true })
}
</script>











