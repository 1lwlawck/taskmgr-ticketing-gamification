<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_52%)]"></div>
    <div class="relative mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white px-8 py-12 text-center shadow-xl">
      <!-- Email Icon -->
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
        <svg class="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.checkYourEmail') || 'Check Your Email' }}</h1>
      <p class="mt-3 text-slate-600">
        {{ t('auth.verificationSent') }} <span class="font-semibold text-slate-800">{{ email }}</span>. {{ t('auth.checkInbox') || 'Please check your inbox and click the link to verify your account.' }}
      </p>

      <!-- Resend Section -->
      <div class="mt-8 rounded-xl bg-slate-50 p-4">
        <p class="text-sm text-slate-500">{{ t('auth.didntReceiveEmail') || "Didn't receive the email?" }}</p>
        <button
          @click="handleResend"
          :disabled="resending || cooldown > 0"
          class="mt-2 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg v-if="resending" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="cooldown > 0">{{ t('auth.resendIn') || 'Resend in' }} {{ cooldown }}s</span>
          <span v-else>{{ t('auth.resendEmail') || 'Resend verification email' }}</span>
        </button>
      </div>

      <!-- Success Message -->
      <p v-if="success" class="mt-4 text-sm text-emerald-600">
        {{ t('auth.emailResent') || 'Verification email has been resent!' }}
      </p>

      <!-- Error Message -->
      <p v-if="error" class="mt-4 text-sm text-rose-600">{{ error }}</p>

      <!-- Back to Login -->
      <div class="mt-8 border-t border-slate-200 pt-6">
        <p class="text-sm text-slate-500">{{ t('auth.alreadyVerified') || 'Already verified?' }}</p>
        <RouterLink to="/login">
          <Button variant="ghost" class="mt-2">{{ t('auth.goToLogin') || 'Go to Login' }}</Button>
        </RouterLink>
        
        <div class="mt-4">
          <button @click="showChangeEmailModal = true" class="text-xs text-indigo-600 hover:underline">
            {{ t('auth.wrongEmail') }} {{ t('auth.changeEmail') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Email Modal -->
    <div v-if="showChangeEmailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-900 mb-4">{{ t('auth.changeEmail') }}</h3>
        
        <form @submit.prevent="handleChangeEmail" class="space-y-4">
          <div class="space-y-1 text-left">
            <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.newEmail') }}</label>
            <Input v-model="newEmail" type="email" required class="bg-slate-50" />
          </div>
          
          <div class="space-y-1 text-left">
            <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.password') }}</label>
            <Input v-model="password" type="password" required class="bg-slate-50" />
          </div>

          <p v-if="changeEmailError" class="text-xs text-rose-600">{{ changeEmailError }}</p>

          <div class="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" @click="showChangeEmailModal = false">{{ t('auth.cancel') }}</Button>
            <Button type="submit" :disabled="updatingEmail">
              <span v-if="updatingEmail">...</span>
              <span v-else>{{ t('auth.save') }}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/atoms/ui/button'
import { Input } from '@/components/atoms/ui/input'

const route = useRoute()
const { t } = useI18n()
const auth = useAuthStore()

const userId = ref('')
const email = ref('')
const resending = ref(false)
const success = ref(false)
const error = ref('')
const cooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

// Change Email State
const showChangeEmailModal = ref(false)
const newEmail = ref('')
const password = ref('')
const updatingEmail = ref(false)
const changeEmailError = ref('')

onMounted(() => {
  userId.value = route.query.userId as string || ''
  email.value = route.query.email as string || ''
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

const handleResend = async () => {
  if (!userId.value) {
    error.value = t('auth.noUserId') || 'User ID not found. Please try registering again.'
    return
  }

  resending.value = true
  success.value = false
  error.value = ''

  try {
    await auth.resendVerification(userId.value)
    success.value = true
    
    // Start cooldown
    cooldown.value = 60
    cooldownInterval = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0 && cooldownInterval) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }, 1000)
  } catch (err: any) {
    error.value = err.message || t('auth.resendFailed') || 'Failed to resend verification email'
  } finally {
    resending.value = false
  }
}

const handleChangeEmail = async () => {
  if (!userId.value || !newEmail.value || !password.value) return
  
  updatingEmail.value = true
  changeEmailError.value = ''
  
  try {
    await auth.updateUnverifiedEmail(userId.value, password.value, newEmail.value)
    
    // Success
    showChangeEmailModal.value = false
    success.value = true 
    email.value = newEmail.value // Update displayed email
    
    // Clearing form
    password.value = ''
    newEmail.value = ''
  } catch (err: any) {
    changeEmailError.value = err.message
  } finally {
    updatingEmail.value = false
  }
}
</script>
