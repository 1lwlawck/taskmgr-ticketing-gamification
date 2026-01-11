<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('achievements.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('achievements.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('achievements.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ unlockedCount }}</p>
            <p class="text-xs text-white/70">{{ t('achievements.unlocked') }}</p>
          </div>
          <div class="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
            <p class="text-2xl font-bold">{{ totalCount }}</p>
            <p class="text-xs text-white/70">{{ t('achievements.total') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        :class="[
          'rounded-xl px-4 py-2 text-sm font-medium transition',
          activeCategory === cat.id
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
            : 'bg-card border border-border text-muted-foreground hover:bg-slate-50',
        ]"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <CardGridSkeleton :count="6" columns-class="sm:grid-cols-2 lg:grid-cols-3" />
    </div>

    <!-- Achievements Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.achievementId"
        :class="[
          'rounded-2xl border p-6 shadow-sm transition',
          achievement.unlocked
            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
            : 'border-border bg-card opacity-75',
        ]"
      >
        <div class="mb-4 flex items-start justify-between">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
            {{ achievement.icon }}
          </div>
          <span
            v-if="achievement.unlocked"
            class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ t('achievements.unlocked') }}
          </span>
        </div>

        <h3 class="mb-1 font-semibold text-foreground">{{ achievement.name }}</h3>
        <p class="mb-4 text-sm text-muted-foreground">{{ achievement.description }}</p>

        <!-- Progress Bar -->
        <div class="mb-2">
          <div class="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              :style="{ width: `${achievement.percentage}%` }"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">{{ achievement.current }} / {{ achievement.target }}</span>
          <span class="font-medium text-foreground">{{ achievement.percentage }}%</span>
        </div>
      </div>

      <div v-if="!filteredAchievements.length" class="col-span-full rounded-2xl border border-border bg-card p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg class="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        </div>
        <p class="text-muted-foreground">{{ t('achievements.noAchievements') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAchievementsStore } from '@/stores/achievements'
import { useAuthStore } from '@/stores/auth'
import { CardGridSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const achievementsStore = useAchievementsStore()
const authStore = useAuthStore()

const { userProgress, loading, unlockedCount, totalCount } = storeToRefs(achievementsStore)

const activeCategory = ref('all')

const categories = [
  { id: 'all', label: t('achievements.all') || 'All', icon: '🏆' },
  { id: 'tickets', label: t('achievements.tickets') || 'Tickets', icon: '🎫' },
  { id: 'streaks', label: t('achievements.streaks') || 'Streaks', icon: '🔥' },
  { id: 'xp', label: t('achievements.xp') || 'XP', icon: '⭐' },
]

const filteredAchievements = computed(() => {
  if (activeCategory.value === 'all') return userProgress.value
  return userProgress.value.filter((a) => {
    // Match category from achievement name patterns
    if (activeCategory.value === 'tickets') {
      return a.achievementId.includes('ticket') || a.name.toLowerCase().includes('ticket')
    }
    if (activeCategory.value === 'streaks') {
      return a.achievementId.includes('streak') || a.name.toLowerCase().includes('streak')
    }
    if (activeCategory.value === 'xp') {
      return a.achievementId.includes('xp') || a.achievementId.includes('level') || a.name.toLowerCase().includes('xp')
    }
    return true
  })
})

onMounted(async () => {
  const userId = authStore.currentUser?.id
  if (userId) {
    await achievementsStore.fetchAllForUser(userId)
  }
})
</script>
