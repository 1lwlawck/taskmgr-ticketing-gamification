import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGamificationStore } from '@/stores/gamification'
import { PRIORITY_XP_MAP } from '@/utils/constants'

describe('gamification store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
  })

  it('awards XP when tickets are completed', () => {
    const store = useGamificationStore()
    store.userStats = {}
    store.pushToast = vi.fn()

    store.ensureUserStats('user-1')
    store.awardXp({ userId: 'user-1', ticketId: 'ticket-xyz', priority: 'urgent' })

    expect(store.userStats['user-1'].xp).toBe(PRIORITY_XP_MAP.urgent)
    expect(store.userStats['user-1'].tickets_closed_count).toBe(1)
    expect(store.xpEvents[0]).toMatchObject({ userId: 'user-1', ticketId: 'ticket-xyz' })
    expect(store.pushToast).toHaveBeenCalled()
  })
})
