import { defineStore } from 'pinia'
import { loadState, saveState } from '@/utils/storage'

const THEME_KEY = 'ttm_theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: loadState(THEME_KEY, 'light'),
  }),
  getters: {
    isDark: (state) => state.mode === 'dark',
  },
  actions: {
    applyClass() {
      if (typeof document === 'undefined') return
      document.documentElement.classList.toggle('dark', this.mode === 'dark')
    },
    setMode(mode) {
      this.mode = mode === 'dark' ? 'dark' : 'light'
      saveState(THEME_KEY, this.mode)
      this.applyClass()
    },
    toggleMode() {
      this.setMode(this.mode === 'dark' ? 'light' : 'dark')
    },
  },
})
