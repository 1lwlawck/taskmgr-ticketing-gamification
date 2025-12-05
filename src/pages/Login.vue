<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white px-4 py-10 text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_52%)]"></div>
    <div class="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:min-h-[65vh] md:flex-row">
      <div class="hidden min-h-full flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-10 py-12 text-white md:flex">
        <div class="space-y-6">
          <p class="text-xs uppercase tracking-[0.5em] text-white/60">{{ t('auth.brand') }}</p>
          <h1 class="text-4xl font-semibold leading-tight">{{ t('auth.heroTitle') }}</h1>
          <p class="text-sm text-white/70">
            {{ t('auth.heroCopy') }}
          </p>
        </div>
        <div class="space-y-4 text-sm text-white/70">
          <p class="text-xs uppercase tracking-[0.3em] text-white/50">{{ t('auth.whyJoin') }}</p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              {{ t('auth.bullet1') }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-300"></span>
              {{ t('auth.bullet2') }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-300"></span>
              {{ t('auth.bullet3') }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-1 items-center bg-white px-8 py-10 text-slate-900 md:px-12 md:min-h-[600px]">
        <div class="w-full">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.4em] text-slate-400">{{ t('auth.welcome') }}</p>
            <h2 class="text-3xl font-semibold text-slate-900">{{ t('auth.signinTitle') }}</h2>
            <p class="text-sm text-slate-500">{{ t('auth.signinHint') }}</p>
          </div>
          <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.username') }} <span class="text-rose-500">*</span></label>
              <Input v-model="form.username" :placeholder="t('auth.username')" required class="bg-transparent" />
              <p v-if="errors.username" class="text-[11px] text-rose-600">{{ errors.username }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.password') }} <span class="text-rose-500">*</span></label>
              <div class="relative">
                <Input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="********"
                  required
                  class="bg-transparent pr-10"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground focus:outline-none"
                  @click="togglePasswordVisibility"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
                  <span class="sr-only">{{ showPassword ? t('auth.hidePassword') : t('auth.showPassword') }}</span>
                </button>
              </div>
              <p v-if="errors.password" class="text-[11px] text-rose-600">{{ errors.password }}</p>
            </div>
            <p v-if="error" class="text-xs text-destructive text-right">{{ error }}</p>
            <Button type="submit" class="w-full" size="lg">{{ t('auth.submit') }}</Button>
          </form>
          <div class="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ t('auth.needAccount') }}</span>
            <RouterLink to="/register">
              <Button variant="ghost" size="sm">{{ t('auth.register') }}</Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
const showPassword = ref(false)
const errors = reactive<{ username?: string; password?: string }>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  errors.username = undefined
  errors.password = undefined
  if (!form.username.trim()) {
    errors.username = t('auth.usernameRequired')
    return
  }
  if (!form.password) {
    errors.password = t('auth.passwordRequired')
    return
  }
  try {
    error.value = ''
    await auth.login(form)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}
</script>
