<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_52%)]"></div>
    <div class="relative mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white px-8 py-12 text-center shadow-xl">
      <!-- Success State -->
      <div v-if="verified" class="space-y-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg class="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.emailVerified') || 'Email Verified!' }}</h1>
        <p class="text-slate-600">{{ t('auth.emailVerifiedDesc') || 'Your email has been verified successfully. You can now login to your account.' }}</p>
        <RouterLink to="/login">
          <Button size="lg" class="w-full">
            {{ t('auth.goToLogin') }} <span class="ml-1 text-xs font-normal opacity-75">({{ countdown }}s)</span>
          </Button>
        </RouterLink>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <svg class="h-10 w-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.verificationFailed') || 'Verification Failed' }}</h1>
        <p class="text-slate-600">{{ error }}</p>
        <div class="space-y-3">
          <RouterLink to="/register">
            <Button variant="outline" size="lg" class="w-full">{{ t('auth.tryAgain') || 'Register Again' }}</Button>
          </RouterLink>
          <RouterLink to="/login">
            <Button variant="ghost" size="lg" class="w-full">{{ t('auth.backToLogin') || 'Back to Login' }}</Button>
          </RouterLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="space-y-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
          <svg class="h-10 w-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.verifyingEmail') || 'Verifying Email...' }}</h1>
        <p class="text-slate-600">{{ t('auth.pleaseWait') || 'Please wait while we verify your email address.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/atoms/ui/button'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const verified = ref(false)
const error = ref('')
const countdown = ref(3)
let countdownInterval: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    error.value = t('auth.noVerificationToken') || 'No verification token provided'
    return
  }
  
  try {
    await auth.verifyEmail(token)
    verified.value = true
    
    // Auto redirect
    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval)
        router.push('/login')
      }
    }, 1000)
  } catch (err: any) {
    error.value = err.message || t('auth.verificationError') || 'Verification failed. The link may be expired or invalid.'
  }
})
</script>
