import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type { Achievement, AchievementProgress } from '@/types/models'

export const useAchievementsStore = defineStore('achievements', () => {
  const allAchievements = ref<Achievement[]>([])
  const userProgress = ref<AchievementProgress[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unlockedCount = computed(() => userProgress.value.filter((p) => p.unlocked).length)
  const totalCount = computed(() => allAchievements.value.length)

  const categorizedAchievements = computed(() => {
    const categories: Record<string, AchievementProgress[]> = {
      tickets: [],
      streaks: [],
      xp: [],
      community: [],
    }
    for (const achievement of allAchievements.value) {
      const progress = userProgress.value.find((p) => p.achievementId === achievement.id)
      if (progress) {
        categories[achievement.category]?.push(progress)
      }
    }
    return categories
  })

  async function fetchAll() {
    if (allAchievements.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: Achievement[] }>('/achievements/')
      allAchievements.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProgress(userId: string) {
    if (userProgress.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: AchievementProgress[] }>(`/achievements/user/${userId}`)
      userProgress.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUnlocked(userId: string) {
    try {
      const { data } = await api.get<{ data: AchievementProgress[] }>(`/achievements/user/${userId}/unlocked`)
      return data.data || []
    } catch (e) {
      handleApiError(e)
      return []
    }
  }

  async function fetchAllForUser(userId: string) {
    // Only show loading if we are missing data
    if (allAchievements.value.length === 0 || userProgress.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      await Promise.all([fetchAll(), fetchUserProgress(userId)])
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    allAchievements,
    userProgress,
    loading,
    error,
    unlockedCount,
    totalCount,
    categorizedAchievements,
    fetchAll,
    fetchUserProgress,
    fetchUnlocked,
    fetchAllForUser,
  }
})
