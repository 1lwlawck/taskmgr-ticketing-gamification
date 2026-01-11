<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('challenges.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('challenges.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('challenges.heroDesc') }}</p>
        </div>
        <div v-if="timeRemaining" class="flex items-center gap-4">
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ timeRemaining.days }}d {{ timeRemaining.hours }}h</p>
            <p class="text-xs text-white/70">{{ t('challenges.timeLeft') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('challenges.activeChallenges') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ activeCount }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('challenges.completed') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ completedCount }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ t('challenges.potentialXp') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ totalPotentialXp }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
    </div>

    <!-- Challenges List -->
    <div v-else class="space-y-4">
      <h2 class="text-lg font-semibold text-foreground">{{ t('challenges.weeklyTitle') }}</h2>

      <div
        v-for="challenge in userChallenges"
        :key="challenge.challengeId"
        :class="[
          'rounded-2xl border p-6 shadow-sm transition',
          challenge.completed
            ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'
            : 'border-border bg-card',
        ]"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-4">
            <div :class="['flex h-12 w-12 items-center justify-center rounded-xl', getChallengeIconClass(challenge.challenge.type)]">
              <span class="text-2xl">{{ getChallengeIcon(challenge.challenge.type) }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-foreground">{{ challenge.challenge.title }}</h3>
                <span
                  v-if="challenge.completed"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ t('challenges.done') }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">{{ challenge.challenge.description }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-amber-100 px-3 py-1.5 text-center">
              <p class="text-sm font-bold text-amber-700">+{{ challenge.challenge.xpReward }} XP</p>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('challenges.progress') }}</span>
            <span class="font-medium text-foreground">{{ challenge.current }} / {{ challenge.challenge.target }}</span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              :class="[
                'h-full rounded-full transition-all duration-500',
                challenge.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-emerald-500',
              ]"
              :style="{ width: `${challenge.percentage}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Active Challenges without user progress -->
      <div
        v-for="challenge in activeChallengesWithoutProgress"
        :key="challenge.id"
        class="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-4">
            <div :class="['flex h-12 w-12 items-center justify-center rounded-xl', getChallengeIconClass(challenge.type)]">
              <span class="text-2xl">{{ getChallengeIcon(challenge.type) }}</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">{{ challenge.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ challenge.description }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-amber-100 px-3 py-1.5 text-center">
              <p class="text-sm font-bold text-amber-700">+{{ challenge.xpReward }} XP</p>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('challenges.progress') }}</span>
            <span class="font-medium text-foreground">0 / {{ challenge.target }}</span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full w-0 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-500"></div>
          </div>
        </div>
      </div>

      <div v-if="!userChallenges.length && !activeChallenges.length" class="rounded-2xl border border-border bg-card p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg class="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        <p class="text-muted-foreground">{{ t('challenges.noChallenges') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useChallengesStore } from '@/stores/challenges'
import { useAuthStore } from '@/stores/auth'
import { CardGridSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const challengesStore = useChallengesStore()
const authStore = useAuthStore()

const { activeChallenges, userChallenges, loading, completedCount, activeCount, timeRemaining } = storeToRefs(challengesStore)

const totalPotentialXp = computed(() => {
  return activeChallenges.value.reduce((acc, c) => acc + c.xpReward, 0)
})

const activeChallengesWithoutProgress = computed(() => {
  const progressIds = userChallenges.value.map((uc) => uc.challengeId)
  return activeChallenges.value.filter((c) => !progressIds.includes(c.id))
})

function getChallengeIcon(type: string) {
  const icons: Record<string, string> = {
    tickets: '🎫',
    xp: '⭐',
    streak: '🔥',
    comments: '💬',
  }
  return icons[type] || '🎯'
}

function getChallengeIconClass(type: string) {
  const classes: Record<string, string> = {
    tickets: 'bg-blue-100',
    xp: 'bg-amber-100',
    streak: 'bg-orange-100',
    comments: 'bg-purple-100',
  }
  return classes[type] || 'bg-slate-100'
}

onMounted(async () => {
  const userId = authStore.currentUser?.id
  if (userId) {
    await challengesStore.fetchAllForUser(userId)
  } else {
    await challengesStore.fetchActive()
  }
})
</script>
