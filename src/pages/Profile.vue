<template>
  <section v-if="currentUser" class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-white/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-6">
          <img :src="currentUser.avatar" class="h-24 w-24 rounded-full border-4 border-white/30 object-cover shadow-lg" alt="avatar" />
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.4em] text-white/70">Operator Profile</p>
            <h1 class="text-3xl font-semibold">{{ currentUser.name }}</h1>
            <p class="text-sm text-white/80">
              {{ formatRole(currentUser.role) }} / @{{ currentUser.username }}
            </p>
          </div>
        </div>
        <div class="grid gap-4 text-center sm:grid-cols-3">
          <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p class="text-xs uppercase text-white/60">Level</p>
            <p class="text-3xl font-semibold">{{ stats?.level ?? 1 }}</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p class="text-xs uppercase text-white/60">XP</p>
            <p class="text-3xl font-semibold">{{ formatNumber(stats?.xp ?? 0) }}</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p class="text-xs uppercase text-white/60">Tickets</p>
            <p class="text-3xl font-semibold">{{ formatNumber(stats?.tickets_closed_count ?? 0) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-3xl border border-border bg-card p-6 shadow-lg lg:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Mission log</p>
            <h2 class="text-2xl font-semibold text-foreground">Performance overview</h2>
          </div>
            <span class="text-xs uppercase text-muted-foreground">Streak {{ stats?.streak ?? 0 }} days</span>
        </div>
        <div class="mt-6 space-y-6">
          <div class="rounded-2xl border border-muted bg-muted/50 p-4">
            <p class="text-xs uppercase text-muted-foreground">XP progress</p>
            <div class="mt-3">
              <div class="flex items-center justify-between text-sm text-muted-foreground">
                <span>Level {{ stats?.level ?? 1 }}</span>
                <span>{{ stats?.xp ?? 0 }} / {{ stats?.nextLevelThreshold ?? 100 }} XP</span>
              </div>
              <div class="mt-2 h-2 rounded-full bg-slate-200">
                <span class="block h-2 rounded-full bg-slate-900 transition-all" :style="{ width: xpProgress + '%' }"></span>
              </div>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-3 text-center text-sm">
            <div class="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <p class="text-4xl font-semibold text-foreground">{{ focusMetric }}</p>
              <p class="text-xs uppercase text-muted-foreground">XP pace</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <p class="text-4xl font-semibold text-foreground">{{ nextBadge }}</p>
              <p class="text-xs uppercase text-muted-foreground">Next badge</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <p class="text-4xl font-semibold text-foreground">{{ xpToNext }}</p>
              <p class="text-xs uppercase text-muted-foreground">XP to level up</p>
            </div>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Badges</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <span
                v-for="badge in badgeList"
                :key="badge"
                class="rounded-full border border-border bg-muted px-4 py-1 text-xs font-medium text-muted-foreground"
              >
                {{ badge }}
              </span>
              <p v-if="badgeList.length === 0" class="text-sm text-muted-foreground">No badges yet.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-border bg-card p-6 shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Profile</p>
            <h2 class="text-xl font-semibold text-foreground">Edit details</h2>
          </div>
          <span v-if="saved" class="text-xs text-emerald-600">Saved</span>
        </div>
        <form class="mt-6 space-y-5 text-sm" @submit.prevent="save">
          <label class="block space-y-1">
            <span class="text-xs uppercase text-muted-foreground">Name</span>
            <input v-model="form.name" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" />
          </label>
          <label class="block space-y-1">
            <span class="text-xs uppercase text-muted-foreground">Bio</span>
            <textarea v-model="form.bio" rows="4" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm"></textarea>
          </label>
          <Button type="submit" class="w-full bg-slate-900 text-white">Save changes</Button>
        </form>
        <div class="mt-8 space-y-3 border-t border-border pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Security</p>
              <h3 class="text-lg font-semibold text-foreground">Change password</h3>
            </div>
            <span v-if="passwordSaved" class="text-xs text-emerald-600">Updated</span>
          </div>
          <form class="space-y-3 text-sm" @submit.prevent="submitPassword">
            <label class="block space-y-1">
              <span class="text-xs uppercase text-muted-foreground">Current password</span>
              <input v-model="pwd.old" type="password" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" required />
            </label>
            <label class="block space-y-1">
              <span class="text-xs uppercase text-muted-foreground">New password</span>
              <input v-model="pwd.new1" type="password" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" required />
            </label>
            <label class="block space-y-1">
              <span class="text-xs uppercase text-muted-foreground">Confirm new password</span>
              <input v-model="pwd.new2" type="password" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" required />
            </label>
            <p v-if="pwdError" class="text-xs text-rose-600">{{ pwdError }}</p>
            <Button type="submit" class="w-full bg-slate-900 text-white" :disabled="pwdSubmitting">
              {{ pwdSubmitting ? 'Updating...' : 'Update password' }}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </section>
  <p v-else class="text-slate-500">No user.</p>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/atoms/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useGamificationStore } from '@/stores/gamification'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
const usersStore = useUsersStore()
const gamification = useGamificationStore()
const saved = ref(false)
const passwordSaved = ref(false)
const pwdSubmitting = ref(false)
const pwdError = ref('')
const pwd = reactive({ old: '', new1: '', new2: '' })

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

const xpToNext = computed(() => Math.max(0, (stats.value?.nextLevelThreshold ?? 100) - (stats.value?.xp ?? 0)))
const xpProgress = computed(() => {
  const threshold = stats.value?.nextLevelThreshold ?? 100
  if (!threshold) return 0
  return Math.min(100, Math.round(((stats.value?.xp ?? 0) / threshold) * 100))
})
const badgeList = computed(() => currentUser.value?.badges ?? [])
const focusMetric = computed(() => Math.max(stats.value?.xp ?? 0, 0))
const nextBadge = computed(() => (badgeList.value[0] ? badgeList.value[0] : 'No badge'))

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value = 0) => numberFormatter.format(value ?? 0)
const formatRole = (role) => (role ? role.replace(/_/g, ' ') : '-')

const save = async () => {
  if (!currentUser.value) return
  try {
    const updated = await usersStore.updateUserProfile(currentUser.value.id, {
      name: form.name,
      bio: form.bio,
    })
    auth.currentUser = updated
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (error) {
    console.error(error)
  }
}

const submitPassword = async () => {
  if (!currentUser.value) return
  pwdError.value = ''
  if (!pwd.old || !pwd.new1 || !pwd.new2) {
    pwdError.value = 'Please fill all fields'
    return
  }
  if (pwd.new1 !== pwd.new2) {
    pwdError.value = 'New password and confirmation must match'
    return
  }
  if (pwd.new1.length < 6) {
    pwdError.value = 'Use at least 6 characters'
    return
  }
  pwdSubmitting.value = true
  try {
    await auth.changePassword(pwd.old, pwd.new1)
    passwordSaved.value = true
    pwd.old = ''
    pwd.new1 = ''
    pwd.new2 = ''
    setTimeout(() => (passwordSaved.value = false), 2000)
  } catch (error) {
    pwdError.value = error instanceof Error ? error.message : 'Failed to update password'
  } finally {
    pwdSubmitting.value = false
  }
}
</script>
