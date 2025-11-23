<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useProjectsStore } from '@/stores/projects'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuditStore } from '@/stores/audit'

const auth = useAuthStore()
const gamification = useGamificationStore()
const projects = useProjectsStore()
const tickets = useTicketsStore()
const users = useUsersStore()
const audit = useAuditStore()

const canManageUsers = () => ['admin', 'project_manager'].includes(auth.currentUser?.role ?? '')

const loadWorkspace = async () => {
  if (!auth.currentUser) return
  try {
    const requests: Promise<any>[] = [projects.fetchProjects(), tickets.fetchTickets()]
    if (canManageUsers()) {
      requests.push(users.fetchUsers(), audit.fetchEntries())
    } else {
      users.reset()
      audit.reset()
    }
    await Promise.all(requests)
    projects.syncBoardsWithTickets(tickets.tickets)
    await Promise.all([
      gamification.fetchStats(auth.currentUser.id),
      gamification.fetchEvents(auth.currentUser.id),
    ])
  } catch (error) {
    console.error('Failed to load workspace data', error)
  }
}

onMounted(async () => {
  if (auth.token) {
    await auth.bootstrap()
  }
  if (auth.currentUser) {
    await loadWorkspace()
  }
})

watch(
  () => auth.currentUser?.id,
  async (userId, previous) => {
    if (userId) {
      await loadWorkspace()
    } else if (previous) {
      users.reset()
      projects.reset()
      tickets.reset()
      gamification.reset()
      audit.reset()
    }
  }
)
</script>
