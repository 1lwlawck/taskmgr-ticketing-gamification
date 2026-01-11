<template>
  <OfflineBanner :show="!isOnline" />
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'
import { useProjectsStore } from '@/stores/projects'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useAuditStore } from '@/stores/audit'
import { useNetwork } from '@/composables/useNetwork'

import ToastContainer from '@/components/atoms/ToastContainer.vue'
import ErrorBoundary from '@/components/atoms/ErrorBoundary.vue'
import OfflineBanner from '@/components/atoms/OfflineBanner.vue'

const auth = useAuthStore()
const gamification = useGamificationStore()
const projects = useProjectsStore()
const tickets = useTicketsStore()
const users = useUsersStore()
const audit = useAuditStore()

// Network status detection
const { isOnline } = useNetwork()

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
      gamification.fetchEvents({ userId: auth.currentUser.id }),
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

