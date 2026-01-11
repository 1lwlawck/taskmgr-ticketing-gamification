<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('activity.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('activity.heroTitle') }}</h1>
        </div>
      </div>
    </div>

    <!-- Filters (Disabled for Personal Activity) -->
    <div class="hidden items-center gap-4">
      <Select
        v-model="selectedFilter"
        :options="filterOptions"
        :placeholder="t('activity.allTypes')"
        class="min-w-[200px]"
      />
    </div>

    <!-- Loading State (Skeleton) -->
    <div v-if="loading && !activities.length" class="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div v-for="i in 5" :key="i" class="flex gap-4 pl-4">
        <!-- Dot Skeleton -->
        <Skeleton class="h-8 w-8 rounded-full" />
        <div class="flex-1 space-y-2">
          <!-- Text Skeleton -->
          <div class="flex justify-between">
            <Skeleton class="h-4 w-1/3" />
            <Skeleton class="h-3 w-20" />
          </div>
          <Skeleton class="h-3 w-1/2" />
        </div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div v-else class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="relative">
        <!-- Timeline Line -->
        <div class="absolute left-6 top-0 h-full w-0.5 bg-border"></div>

        <!-- Activity Items -->
        <div class="space-y-6">
          <div
            v-for="item in activities"
            :key="item.id"
            class="relative flex gap-4 pl-4"
          >
            <!-- Timeline Dot -->
            <div :class="['relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background', getActivityDotClass(item.entityType)]">
              <svg v-if="item.entityType === 'ticket'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <svg v-else-if="item.entityType === 'project'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <svg v-else-if="item.entityType === 'epic'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <svg v-else-if="item.entityType === 'comment'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>

            <!-- Activity Content -->
            <div class="flex-1 pb-6">
              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-medium text-foreground">
                    {{ formatAction(item.action, item.entityType) }}
                  </p>
                  <p v-if="item.details" class="text-sm text-muted-foreground">{{ item.details }}</p>
                  <p v-if="item.entityId" class="text-xs text-muted-foreground/70 font-mono mt-0.5">
                    ID: {{ item.entityId.substring(0, 8) }}...
                  </p>
                </div>
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ formatTime(item.createdAt) }}</span>
              </div>

              <div v-if="item.entityType" class="mt-2">
                <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', getEntityBadgeClass(item.entityType)]">
                  {{ getEntityLabel(item.entityType) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!activities.length" class="py-12 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <p class="text-muted-foreground">{{ t('activity.noActivity') }}</p>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <!-- Item Count -->
        <p class="text-sm text-muted-foreground">
          Showing <span class="font-medium text-foreground">{{ activities.length }}</span> activities
        </p>
        
        <!-- Load More Button -->
        <div v-if="nextCursor" class="flex items-center gap-3">
          <button
            @click="loadMore"
            :disabled="loading"
            class="inline-flex items-center gap-2 rounded-xl border border-indigo-500 bg-transparent px-6 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
          >
            <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {{ loading ? t('common.loading') : t('common.loadMore') }}
          </button>
        </div>
        
        <!-- End of List Indicator -->
        <p v-else-if="activities.length > 0" class="text-sm text-muted-foreground italic">
          — End of activity log —
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores/activity'
import { useAuthStore } from '@/stores/auth'
import Select from '@/components/ui/select/Select.vue'

import { Skeleton } from '@/components/atoms/ui/skeleton'

const { t } = useI18n()
const activityStore = useActivityStore()
const { activities, loading, nextCursor } = storeToRefs(activityStore)
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

// Activity User endpoint currently does not support filtering by type
// So we will hide the filter for now or keep it disabled
const selectedFilter = ref('')

const filterOptions = computed(() => [
  { value: '', label: t('activity.allTypes') },
  { value: 'ticket', label: t('activity.tickets') },
  { value: 'project', label: t('activity.projects') },
  { value: 'epic', label: t('activity.epics') },
  { value: 'comment', label: t('activity.comments') },
])

function getActivityDotClass(entityType?: string) {
  const classes: Record<string, string> = {
    ticket: 'bg-blue-100 text-blue-600',
    project: 'bg-purple-100 text-purple-600',
    epic: 'bg-amber-100 text-amber-600',
    comment: 'bg-emerald-100 text-emerald-600',
  }
  return classes[entityType || ''] || 'bg-slate-100 text-slate-600'
}

function getEntityBadgeClass(entityType: string) {
  const classes: Record<string, string> = {
    ticket: 'bg-blue-100 text-blue-700',
    project: 'bg-purple-100 text-purple-700',
    epic: 'bg-amber-100 text-amber-700',
    comment: 'bg-emerald-100 text-emerald-700',
  }
  return classes[entityType] || 'bg-slate-100 text-slate-700'
}

function getEntityLabel(entityType: string) {
  const labels: Record<string, string> = {
    ticket: t('activity.ticket') || 'Ticket',
    project: t('activity.project') || 'Project',
    epic: t('activity.epic') || 'Epic',
    comment: t('activity.comment') || 'Comment',
    user: t('activity.user') || 'User',
    xp_event: t('activity.xpEvent') || 'XP Event',
  }
  return labels[entityType] || entityType
}

// Format raw action names into human-readable descriptions
function formatAction(action: string, entityType?: string): string {
  const actionMap: Record<string, string> = {
    // Ticket actions
    'ticket_created': 'Created a new ticket',
    'ticket_updated': 'Updated ticket details',
    'ticket_status': 'Changed ticket status',
    'ticket_priority': 'Changed ticket priority',
    'ticket_assigned': 'Assigned ticket',
    'ticket_deleted': 'Deleted a ticket',
    'ticket_closed': 'Closed the ticket',
    'ticket_reopened': 'Reopened the ticket',
    
    // Project actions
    'project_created': 'Created a new project',
    'project_updated': 'Updated project details',
    'project_joined': 'Joined a project',
    'project_left': 'Left a project',
    'project_invite_created': 'Sent project invitation',
    'project_member_added': 'Added project member',
    'project_member_removed': 'Removed project member',
    
    // Epic actions
    'epic_created': 'Created a new epic',
    'epic_updated': 'Updated epic details',
    'epic_deleted': 'Deleted an epic',
    
    // Comment actions
    'comment_created': 'Added a comment',
    'comment_updated': 'Edited a comment',
    'comment_deleted': 'Deleted a comment',
    
    // User actions
    'user_registered': 'Registered an account',
    'user_login': 'Logged in',
    'user_logout': 'Logged out',
    'user_profile_updated': 'Updated profile',
    
    // XP actions
    'xp_earned': 'Earned XP',
    'level_up': 'Leveled up!',
    'achievement_unlocked': 'Unlocked achievement',
  }
  
  // Try exact match first
  if (actionMap[action]) {
    return actionMap[action]
  }
  
  // Try to format snake_case to readable text
  const formatted = action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
  
  return formatted
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return t('activity.justNow') || 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function loadMore() {
  if (currentUser.value) {
    await activityStore.loadMoreUserActivity(currentUser.value.id, {  })
  }
}

// Watch removed as filter is disabled/hidden
// watch(selectedFilter, async () => {
//   activityStore.reset()
//   await activityStore.fetchActivity({
//     entityType: selectedFilter.value || undefined,
//     limit: 20,
//   })
// })

watch(currentUser, (user) => {
  if (user) {
    activityStore.fetchUserActivity(user.id, { limit: 20 })
  }
}, { immediate: true })

// Removed onMounted since immediate watcher handles it
// onMounted(() => {
//   if (currentUser.value) {
//     activityStore.fetchUserActivity(currentUser.value.id, { limit: 20 })
//   }
// })
</script>
