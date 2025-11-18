import { defineStore } from 'pinia'
import { loadState, saveState } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { generateId } from '@/utils/helpers'

const defaultAudit = [
  {
    id: 'audit-1',
    action: 'system_boot',
    description: 'Workspace seeded with demo data',
    userId: null,
    timestamp: new Date().toISOString(),
  },
]

export const useAuditStore = defineStore('audit', {
  state: () => ({
    entries: loadState(STORAGE_KEYS.audit, defaultAudit),
  }),
  actions: {
    log(action, description, userId = null) {
      this.entries.unshift({
        id: generateId('audit'),
        action,
        description,
        userId,
        timestamp: new Date().toISOString(),
      })
      this.persist()
    },
    persist() {
      saveState(STORAGE_KEYS.audit, this.entries)
    },
    reset() {
      this.entries = [...defaultAudit]
      this.persist()
    },
  },
})
