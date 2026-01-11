<template>
  <header class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm topbar-blurable">
    <div class="flex items-center gap-3">
      <button class="text-slate-500 lg:hidden" @click="toggleSidebar">☰</button>

      <form @submit.prevent="handleSearch" class="hidden sm:block">
        <div class="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-md">
          <svg class="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            type="text"
            class="w-48 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none lg:w-64"
            :placeholder="t('components.topbar.searchPlaceholder')"
            v-model="search"
          />
          <kbd class="hidden rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 lg:inline-block">⌘K</kbd>
        </div>
      </form>
    </div>
    
    <div class="flex items-center gap-4">
      <!-- NOTIFICATION -->
      <button
        class="relative rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
        :title="t('topbar.notifications')"
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

        <span class="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-slate-900"></span>
      </button>

      <!-- USER DROPDOWN -->
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition hover:border-slate-300"
          @click="toggleMenu"
        >
          <div
            class="relative h-8 w-8 overflow-hidden rounded-full shadow ring-2 ring-indigo-100 ring-offset-2 ring-offset-white"
            :style="avatarGradient(currentUser?.name)"
          >
            <span class="absolute inset-0 bg-black/10"></span>
            <span class="relative flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white drop-shadow">
              {{ initials }}
            </span>
          </div>
          <span>{{ currentUser?.name }}</span>
        </button>

        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white py-2 text-sm shadow-lg"
        >
          <button class="block w-full px-4 py-2 text-left hover:bg-slate-50" @click="goProfile">
            {{ t('topbar.profile') }}
          </button>
          <button class="block w-full px-4 py-2 text-left hover:bg-slate-50" @click="handleLogout">
            {{ t('topbar.logout') }}
          </button>
        </div>
      </div>
    </div>
    <ConfirmModal
      :open="logoutConfirm"
      :title="t('sidebar.logoutTitle')"
      :message="t('sidebar.logoutMessage')"
      @cancel="logoutConfirm = false"
      @confirm="confirmLogout"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useSidebar } from '@/components/atoms/ui/sidebar'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import { useI18n } from 'vue-i18n'

const search = ref<string>('')
const showMenu = ref(false)
const logoutConfirm = ref(false)
const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
const localeParam = computed(() => (route.params.locale as string | undefined))

const initials = computed(() => {
  const name = currentUser.value?.name ?? 'User'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
const avatarGradient = (seed = '') => {
  const palette = [
    ['#6366F1', '#22D3EE', '#34D399'],
    ['#7C3AED', '#60A5FA', '#2DD4BF'],
    ['#06B6D4', '#0EA5E9', '#8B5CF6'],
    ['#06B6D4', '#0EA5E9', '#8B5CF6'],
    // ['#F59E0B', '#F97316', '#EC4899'], // Removed (Orange)
    ['#4F46E5', '#818CF8', '#A5B4FC'], // Added (Indigo/Blue)
  ]
  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const colors = palette[hash % palette.length]
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
  }
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleSearch = () => {
  const q = search.value.trim()
  const basePath = localeParam.value ? `/${localeParam.value}/tickets` : '/tickets'
  router.push({ path: basePath, query: q ? { q } : {} })
}

const handleLogout = () => {
  logoutConfirm.value = true
}

const confirmLogout = () => {
  logoutConfirm.value = false
  auth.logout()
  showMenu.value = false
  router.push(localeParam.value ? { path: `/${localeParam.value}/login` } : '/login')
}

const goProfile = () => {
  const path = localeParam.value ? `/${localeParam.value}/profile` : '/profile'
  router.push(path)
  showMenu.value = false
}

const { toggleSidebar } = useSidebar()
</script>
