<template>
  <header class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
    <div class="flex items-center gap-3">
      <button class="text-slate-500 lg:hidden" @click="toggleSidebar">?</button>

      <form @submit.prevent="handleSearch">
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Search</p>
        <div class="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600">
          <span>?</span>
          <input
            type="text"
            class="flex-1 bg-transparent placeholder-slate-400 focus:outline-none"
            placeholder="Tickets, projects, users"
            v-model="search"
          />
        </div>
      </form>
    </div>
    
    <div class="flex items-center gap-4">
      <!-- NOTIFICATION -->
      <button
        class="relative rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
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

        <span class="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-slate-900"></span>
      </button>

      <!-- USER DROPDOWN -->
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 transition hover:border-slate-300"
          @click="toggleMenu"
        >
          <div
            class="relative h-8 w-8 overflow-hidden rounded-full shadow ring-2 ring-indigo-100 ring-offset-2 ring-offset-white"
            :style="avatarGradient(currentUser?.name)"
          >
            <span class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 opacity-80"></span>
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
            Profile
          </button>
          <button class="block w-full px-4 py-2 text-left hover:bg-slate-50" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useSidebar } from '@/components/atoms/ui/sidebar'

const search = ref<string>('')
const showMenu = ref(false)

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)

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
    ['#F59E0B', '#F97316', '#EC4899'],
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
  if (route.path !== '/tickets') {
    router.push({ path: '/tickets', query: q ? { q } : {} })
  } else {
    router.push({ query: q ? { q } : {} })
  }
}

const handleLogout = () => {
  auth.logout()
  showMenu.value = false
  router.push('/login')
}

const goProfile = () => {
  router.push('/profile')
  showMenu.value = false
}

const { toggleSidebar } = useSidebar()
</script>
