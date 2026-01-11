<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('settings.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('settings.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('settings.heroDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Settings Cards -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Profile Settings -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-foreground">{{ t('settings.profile') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.profileDesc') }}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">{{ t('settings.name') }}</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">{{ t('settings.bio') }}</label>
            <textarea
              v-model="profileForm.bio"
              rows="3"
              class="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>
          <button
            @click="saveProfile"
            :disabled="savingProfile"
            class="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {{ savingProfile ? t('common.loading') : t('settings.saveProfile') }}
          </button>
        </div>
      </div>

      <!-- Language Settings -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-foreground">{{ t('settings.language') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.languageDesc') }}</p>
          </div>
        </div>
        <div class="space-y-3">
          <label
            v-for="lang in languages"
            :key="lang.code"
            :class="[
              'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition',
              currentLocale === lang.code ? 'border-indigo-500 bg-indigo-50' : 'border-border hover:bg-slate-50',
            ]"
          >
            <input
              type="radio"
              :value="lang.code"
              v-model="selectedLanguage"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-2xl">{{ lang.flag }}</span>
            <span class="font-medium text-foreground">{{ lang.name }}</span>
          </label>
        </div>
      </div>

      <!-- Appearance Settings -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-foreground">{{ t('settings.appearance') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.appearanceDesc') }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <button
            v-for="theme in themes"
            :key="theme.value"
            @click="selectedTheme = theme.value"
            :class="[
              'flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition',
              selectedTheme === theme.value ? 'border-indigo-500 bg-indigo-50' : 'border-border hover:bg-slate-50',
            ]"
          >
            <div :class="['h-8 w-8 rounded-full', theme.preview]"></div>
            <span class="text-sm font-medium text-foreground">{{ theme.label }}</span>
          </button>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-foreground">{{ t('settings.security') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.securityDesc') }}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">{{ t('settings.currentPassword') }}</label>
            <input
              v-model="passwordForm.current"
              type="password"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">{{ t('settings.newPassword') }}</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">{{ t('settings.confirmPassword') }}</label>
            <input
              v-model="passwordForm.confirm"
              type="password"
              class="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <p v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</p>
          <button
            @click="changePassword"
            :disabled="savingPassword"
            class="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {{ savingPassword ? t('common.loading') : t('settings.changePassword') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const profileForm = ref({
  name: '',
  bio: '',
})

const passwordForm = ref({
  current: '',
  newPassword: '',
  confirm: '',
})

const savingProfile = ref(false)
const savingPassword = ref(false)
const passwordError = ref('')

const selectedLanguage = ref(locale.value)
const selectedTheme = ref('light')

const currentLocale = computed(() => locale.value)

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
]

const themes = [
  { value: 'light', label: 'Light', preview: 'bg-white border border-slate-200' },
  { value: 'dark', label: 'Dark', preview: 'bg-slate-800' },
  { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-slate-800' },
]

watch(selectedLanguage, (newLang) => {
  locale.value = newLang
  localStorage.setItem('locale', newLang)
})

async function saveProfile() {
  savingProfile.value = true
  try {
    // Profile update would go here when API is available
    await new Promise((r) => setTimeout(r, 500))
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  
  if (!passwordForm.value.current || !passwordForm.value.newPassword || !passwordForm.value.confirm) {
    passwordError.value = t('settings.allFieldsRequired')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
    passwordError.value = t('settings.passwordMismatch')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = t('settings.passwordTooShort')
    return
  }
  
  savingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.value.current, passwordForm.value.newPassword)
    passwordForm.value = { current: '', newPassword: '', confirm: '' }
  } catch (e) {
    passwordError.value = (e as Error).message
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  if (authStore.currentUser) {
    profileForm.value.name = authStore.currentUser.name || ''
    profileForm.value.bio = authStore.currentUser.bio || ''
  }
  selectedLanguage.value = localStorage.getItem('locale') || 'en'
})
</script>
