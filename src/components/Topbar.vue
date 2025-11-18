<template>
  <header
    class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm
           dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
  >
    <div class="flex items-center gap-3">
      <button class="text-slate-500 lg:hidden dark:text-slate-300" @click="$emit('toggleSidebar')">☰</button>

      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Search</p>
        <div
          class="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600
                 dark:border-slate-700 dark:text-slate-300"
        >
          <span>⌕</span>
          <input
            type="text"
            class="flex-1 bg-transparent placeholder-slate-400 focus:outline-none"
            placeholder="Tickets, projects, users"
            v-model="search"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4">
      
      <!-- NOTIFICATION -->
      <button
        class="relative rounded-full border border-slate-200 p-2 text-slate-500 transition
               hover:border-slate-400 hover:text-slate-900
               dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-500"
        title="Notifications"
      >
        <!-- Bell Icon -->
        <span class="h-4 w-4 flex">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M15 17h-6a2 2 0 0 1-2-2v-4a6 6 0 1 1 12 0v4a2 2 0 0 1-2 2z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            />
            <path
              d="M13 21h-2a2 2 0 0 0 4 0h-2z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
        </span>

        <span class="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-slate-900 dark:bg-white"></span>
      </button>

      <!-- THEME SWITCH -->
      <button
        class="rounded-full border border-slate-200 p-2 text-slate-500 transition
               hover:border-slate-400 hover:text-slate-900
               dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-500"
        :title="themeLabel"
        @click="toggleTheme"
      >
        <span class="h-4 w-4 flex">

          <!-- Dark Mode Icon -->
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>

          <!-- Light Mode Icon -->
          <svg v-else viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
                 M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
            />
          </svg>

        </span>
      </button>

      <!-- USER DROPDOWN -->
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 transition
                 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
          @click="toggleMenu"
        >
          <img :src="avatar" alt="avatar" class="h-8 w-8 rounded-full object-cover" />
          <span>{{ currentUser?.name }}</span>
        </button>

        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white py-2 text-sm shadow-lg
                 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <button class="block w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  @click="goProfile">
            Profile
          </button>
          <button class="block w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['toggleSidebar'])
const search = ref('')
const showMenu = ref(false)

const router = useRouter()

// AUTH STORE
const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

// AVATAR
const fallbackAvatar = new URL('../assets/avatars/avatar-1.svg', import.meta.url).href
const avatar = computed(() => currentUser.value?.avatar ?? fallbackAvatar)

// MENU
const toggleMenu = () => (showMenu.value = !showMenu.value)

const handleLogout = () => {
  auth.logout()
  showMenu.value = false
  router.push('/login')
}

const goProfile = () => {
  router.push('/profile')
  showMenu.value = false
}

// THEME STORE
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// apply/remove class <html class="dark">
watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
})

// manual toggle
const toggleTheme = () => {
  themeStore.toggleMode()
}

const themeLabel = computed(() => (isDark.value ? 'Switch to light' : 'Switch to dark'))
</script>
