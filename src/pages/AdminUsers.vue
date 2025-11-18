<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold text-slate-900">Admin Panel</h1>
      <p class="text-sm text-slate-500">Manage user roles and view audit events.</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white shadow-card">
      <div class="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">Users</div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-2 text-left">User</th>
              <th class="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
            <tr v-for="user in users" :key="user.id">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-900">{{ user.name }}</p>
                <p class="text-xs text-slate-400">{{ user.username }}</p>
              </td>
              <td class="px-4 py-3">
                <select
                  :disabled="!isAdmin"
                  v-model="user.role"
                  class="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 disabled:opacity-40"
                  @change="(event) => updateRole(user.id, event.target.value)"
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
      <p v-if="!isAdmin" class="p-4 text-xs text-slate-500">Only admins can change roles.</p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white shadow-card">
      <div class="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">Audit log</div>
      <ul class="divide-y divide-slate-100">
        <li v-for="entry in audit" :key="entry.id" class="px-4 py-3 text-sm text-slate-700">
          <p class="text-slate-900">{{ entry.action }}</p>
          <p class="text-xs text-slate-500">{{ entry.description }} • {{ entry.timestamp }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { useAuditStore } from '@/stores/audit'
import { useAuthStore } from '@/stores/auth'

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const auditStore = useAuditStore()
const { entries } = storeToRefs(auditStore)
const audit = entries
const auth = useAuthStore()
const isAdmin = computed(() => auth.currentUser?.role === 'admin')

const updateRole = (userId, role) => {
  if (!isAdmin.value) return
  usersStore.updateUserRole(userId, role)
}
</script>
