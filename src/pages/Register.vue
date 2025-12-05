<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white px-4 py-10 text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_52%)]"></div>
    <div class="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:flex-row">
      <div class="hidden min-h-full flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-10 py-12 text-white md:flex">
        <div class="space-y-6">
          <p class="text-xs uppercase tracking-[0.5em] text-white/60">{{ t('auth.brand') }}</p>
          <h1 class="text-4xl font-semibold leading-tight">{{ t('auth.registerTitle') }}</h1>
          <p class="text-sm text-white/70">
            {{ t('auth.registerCopy') }}
          </p>
        </div>
        <div class="space-y-4 text-sm text-white/70">
          <p class="text-xs uppercase tracking-[0.3em] text-white/50">{{ t('auth.registerSteps') }}</p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              {{ t('auth.regBullet1') }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-300"></span>
              {{ t('auth.regBullet2') }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-300"></span>
              {{ t('auth.regBullet3') }}
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-1 items-center bg-white px-8 py-10 text-slate-900 md:px-12">
        <div class="w-full">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.4em] text-slate-400">{{ t('auth.createAccount') }}</p>
            <h2 class="text-3xl font-semibold text-slate-900">{{ t('auth.launchControl') }}</h2>
            <p class="text-sm text-slate-500">{{ t('auth.registerHint') }}</p>
          </div>
          <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.name') }} <span class="text-rose-500">*</span></label>
              <Input v-model="form.name" :placeholder="t('auth.name')" required class="bg-transparent" />
              <p v-if="errors.name" class="text-[11px] text-rose-600">{{ errors.name }}</p>
            </div>
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
                  minlength="4"
                  :placeholder="t('auth.password')"
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
            <Button type="submit" class="w-full" size="lg">{{ t('auth.submitRegister') }}</Button>
          </form>
          <div class="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ t('auth.haveAccount') }}</span>
            <RouterLink to="/login">
              <Button variant="ghost" size="sm">{{ t('auth.login') }}</Button>
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
const form = reactive({ name: '', username: '', password: '' })
const error = ref('')
const showPassword = ref(false)
const errors = reactive<{ name?: string; username?: string; password?: string }>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleRegister = async () => {
  errors.name = errors.username = errors.password = undefined
  if (!form.name || !form.username || !form.password) {
    if (!form.name) errors.name = t('auth.nameRequired')
    if (!form.username) errors.username = t('auth.usernameRequired')
    if (!form.password) errors.password = t('auth.passwordRequired')
    error.value = ''
    return
  }
  try {
    error.value = ''
    await auth.register(form)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}
</script>
