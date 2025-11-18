<template>
  <section v-if="currentUser" class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div class="flex items-center gap-4">
        <img :src="currentUser.avatar" class="h-20 w-20 rounded-full object-cover" alt="avatar" />
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">{{ currentUser.name }}</h1>
          <p class="text-sm text-slate-500">{{ currentUser.role }}</p>
          <p class="text-xs text-slate-400">@{{ currentUser.username }}</p>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-3 gap-4 text-center text-sm text-slate-500">
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ stats?.level ?? 1 }}</p>
          <p>Level</p>
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ stats?.xp ?? 0 }}</p>
          <p>XP</p>
        </div>
        <div>
          <p class="text-2xl font-semibold text-slate-900">{{ stats?.tickets_closed_count ?? 0 }}</p>
          <p>Tickets</p>
        </div>
      </div>
      <div class="mt-6">
        <h2 class="text-lg font-semibold text-slate-900">Badges</h2>
        <div class="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            v-for="badge in currentUser.badges"
            :key="badge"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 class="text-lg font-semibold text-slate-900">Edit profile</h2>
      <form class="mt-4 space-y-4 text-sm" @submit.prevent="save">
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Name</span>
          <input v-model="form.name" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900" />
        </label>
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Bio</span>
          <textarea v-model="form.bio" rows="4" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900"></textarea>
        </label>
        <button type="submit" class="rounded-md bg-slate-900 px-4 py-2 text-white">Save</button>
        <p v-if="saved" class="text-xs text-slate-500">Saved!</p>
      </form>
    </div>
  </section>
  <p v-else class="text-slate-500">No user.</p>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useGamificationStore } from '@/stores/gamification'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
const usersStore = useUsersStore()
const gamification = useGamificationStore()
const saved = ref(false)

const form = reactive({
  name: '',
  bio: '',
})

watch(
  currentUser,
  (user) => {
    if (!user) return
    form.name = user.name
    form.bio = user.bio ?? ''
  },
  { immediate: true }
)

const stats = computed(() => (currentUser.value ? gamification.userStats[currentUser.value.id] : null))

const save = () => {
  if (!currentUser.value) return
  usersStore.updateUserProfile(currentUser.value.id, { name: form.name, bio: form.bio })
  auth.hydrateFromUsers(currentUser.value.id)
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}
</script>
