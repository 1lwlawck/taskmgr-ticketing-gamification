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
        <Input v-model="searchQuery" placeholder="Cari nama atau username" class="bg-transparent" />
        <div class="overflow-x-auto rounded-2xl border border-border">
          <table class="min-w-full divide-y divide-border text-sm text-foreground">
            <thead class="bg-muted/50 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th class="px-4 py-3 text-left">User</th>
                <th class="px-4 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border bg-card">
              <tr v-for="user in visibleUsers" :key="user.id">
                <td class="px-4 py-4">
                  <p class="text-base font-semibold text-foreground">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground">@{{ user.username }}</p>
                </td>
                <td class="px-4 py-4">
                  <select
                    :disabled="!isAdmin"
                    v-model="user.role"
                    class="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    @change="(event) => onRoleChange(user.id, event)"
                  >
                    <option value="admin">Admin</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
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











