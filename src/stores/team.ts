import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, handleApiError } from '@/lib/api'
import type { TeamMember, TeamProjectMember } from '@/types/models'

export const useTeamStore = defineStore('team', () => {
  const members = ref<TeamMember[]>([])
  const projectMembers = ref<TeamProjectMember[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMembers(limit = 50) {
    if (members.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: TeamMember[] }>('/team/members', {
        params: { limit },
      })
      members.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchProjectMembers(projectId: string) {
    if (projectMembers.value.length === 0) {
      loading.value = true
    }
    error.value = null
    try {
      const { data } = await api.get<{ data: TeamProjectMember[] }>(`/team/projects/${projectId}/members`)
      projectMembers.value = data.data || []
    } catch (e) {
      error.value = (e as Error).message
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  function getMemberById(id: string) {
    return members.value.find((m) => m.id === id)
  }

  return {
    members,
    projectMembers,
    loading,
    error,
    fetchMembers,
    fetchProjectMembers,
    getMemberById,
  }
})
