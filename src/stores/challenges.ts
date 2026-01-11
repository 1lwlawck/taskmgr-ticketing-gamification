import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type { Challenge, UserChallenge } from '@/types/models'

export const useChallengesStore = defineStore('challenges', () => {
  const activeChallenges = ref<Challenge[]>([])
  const userChallenges = ref<UserChallenge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const completedCount = computed(() => userChallenges.value.filter((c) => c.completed).length)
  const activeCount = computed(() => activeChallenges.value.length)

  const timeRemaining = computed(() => {
    if (activeChallenges.value.length === 0) return null
    const endDate = new Date(activeChallenges.value[0].endDate)
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { days, hours, minutes }
  })

  async function fetchActive() {
    if (activeChallenges.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: Challenge[] }>('/challenges/active')
      activeChallenges.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserProgress(userId: string) {
    if (userChallenges.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: UserChallenge[] }>(`/challenges/user/${userId}`)
      userChallenges.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllForUser(userId: string) {
    if (activeChallenges.value.length === 0 || userChallenges.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      await Promise.all([fetchActive(), fetchUserProgress(userId)])
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    activeChallenges,
    userChallenges,
    loading,
    error,
    completedCount,
    activeCount,
    timeRemaining,
    fetchActive,
    fetchUserProgress,
    fetchAllForUser,
  }
})
