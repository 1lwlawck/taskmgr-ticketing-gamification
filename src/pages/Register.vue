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
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.email') || 'Email' }} <span class="text-rose-500">*</span></label>
              <Input v-model="form.email" type="email" :placeholder="t('auth.emailPlaceholder') || 'your@email.com'" required class="bg-transparent" />
              <p v-if="errors.email" class="text-[11px] text-rose-600">{{ errors.email }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.username') }} <span class="text-rose-500">*</span></label>
              <Input v-model="form.username" :placeholder="t('auth.username')" required class="bg-transparent" />
              <p v-if="errors.username" class="text-[11px] text-rose-600">{{ errors.username }}</p>
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.password') }} <span class="text-rose-500">*</span></label>
                <button type="button" @click="generateStrongPassword" class="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Wand2 class="h-3 w-3" />
                  {{ t('auth.generatePassword') }}
                </button>
              </div>
              <div class="relative">
                <Input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  minlength="8"
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
              
              <!-- Generated Password Preview -->
              <div v-if="generatedPassword && form.password !== generatedPassword" class="mt-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-medium text-indigo-300 uppercase tracking-wider">{{ t('auth.passwordGeneratorTitle') }}</span>
                  <button type="button" @click="copyToClipboard" class="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-white transition">
                    <component :is="hasCopied ? Check : Copy" class="h-3 w-3" />
                    {{ hasCopied ? t('auth.passwordCopied') : t('auth.copyPassword') }}
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <code class="flex-1 rounded bg-black/30 px-2 py-1.5 text-xs font-mono text-indigo-200 break-all select-all">
                    {{ generatedPassword }}
                  </code>
                  <Button type="button" size="sm" variant="outline" class="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 hover:text-white border-0 text-white" @click="useGeneratedPassword">
                    {{ t('auth.useThisPassword') }}
                  </Button>
                </div>
              </div>

              <!-- Password Strength Indicator -->
              <div v-if="form.password" class="mt-2 space-y-1">
                <div class="flex gap-1">
                  <div 
                    v-for="i in 6" 
                    :key="i" 
                    class="h-1 flex-1 rounded-full transition-colors"
                    :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'"
                  ></div>
                </div>
                <p class="text-[10px] text-muted-foreground flex justify-between">
                  <span>{{ t('auth.passwordStrengthLabel') || 'Password strength' }}:</span>
                  <span :class="{'text-red-500': passwordStrength.score <= 2, 'text-yellow-600': passwordStrength.score > 2 && passwordStrength.score <= 4, 'text-green-600': passwordStrength.score > 4}">
                    {{ passwordStrength.label }}
                  </span>
                </p>
              </div>
              <!-- Password Requirements Hint -->
              <p class="text-[10px] text-muted-foreground/70 mt-1">
                {{ t('auth.passwordHint') || 'Min 8 chars, uppercase, lowercase, number & special char' }}
              </p>
              <p v-if="errors.password" class="text-[11px] text-rose-600">{{ errors.password }}</p>
            </div>
            
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase text-muted-foreground">{{ t('auth.confirmPassword') || 'Confirm Password' }} <span class="text-rose-500">*</span></label>
              <div class="relative">
                <Input
                  v-model="form.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('auth.confirmPasswordPlaceholder') || 'Re-enter your password'"
                  required
                  class="bg-transparent"
                />
              </div>
              <p v-if="errors.confirmPassword" class="text-[11px] text-rose-600">{{ errors.confirmPassword }}</p>
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
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'
import { Eye, EyeOff, Wand2, Copy, Check } from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const form = reactive({ name: '', email: '', username: '', password: '', confirmPassword: '' })
const error = ref('')
const showPassword = ref(false)
const generatedPassword = ref('')
const hasCopied = ref(false)
const errors = reactive<{ name?: string; email?: string; username?: string; password?: string; confirmPassword?: string }>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const generateStrongPassword = () => {
  const length = 16
  const charset = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    special: '!@#$%^&*()_+~`|}{[]:;?><,./-='
  }
  
  let password = ''
  // Ensure at least one of each required type
  password += charset.upper.charAt(Math.floor(Math.random() * charset.upper.length))
  password += charset.lower.charAt(Math.floor(Math.random() * charset.lower.length))
  password += charset.number.charAt(Math.floor(Math.random() * charset.number.length))
  password += charset.special.charAt(Math.floor(Math.random() * charset.special.length))
  
  const allChars = charset.upper + charset.lower + charset.number + charset.special
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle password
  password = password.split('').sort(() => 0.5 - Math.random()).join('')
  
  generatedPassword.value = password
  // Automatically copy to clipboard for convenience
  copyToClipboard()
}

const useGeneratedPassword = () => {
  form.password = generatedPassword.value
  form.confirmPassword = generatedPassword.value
  generatedPassword.value = '' // Hide the preview once used
}

const copyToClipboard = async () => {
  if (generatedPassword.value) {
    try {
      await navigator.clipboard.writeText(generatedPassword.value)
      hasCopied.value = true
      setTimeout(() => {
        hasCopied.value = false
      }, 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }
}

// Validation Rules
const validateName = (name: string): string | undefined => {
  if (!name) return t('auth.nameRequired')
  if (name.length < 2) return t('auth.nameMinLength') || 'Name must be at least 2 characters'
  if (name.length > 50) return t('auth.nameMaxLength') || 'Name must be less than 50 characters'
  return undefined
}

const validateUsername = (username: string): string | undefined => {
  if (!username) return t('auth.usernameRequired')
  if (username.length < 3) return t('auth.usernameMinLength') || 'Username must be at least 3 characters'
  if (username.length > 30) return t('auth.usernameMaxLength') || 'Username must be less than 30 characters'
  if (!/^[a-zA-Z]/.test(username)) return t('auth.usernameMustStartWithLetter') || 'Username must start with a letter'
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return t('auth.usernameInvalidChars') || 'Username can only contain letters, numbers, underscores, and dots'
  return undefined
}

const validatePassword = (password: string): string | undefined => {
  if (!password) return t('auth.passwordRequired')
  if (password.length < 8) return t('auth.passwordMinLength') || 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return t('auth.passwordNeedsUppercase') || 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return t('auth.passwordNeedsLowercase') || 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return t('auth.passwordNeedsNumber') || 'Password must contain at least one number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return t('auth.passwordNeedsSpecial') || 'Password must contain at least one special character (!@#$%^&*)'
  return undefined
}

const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
  if (!confirmPassword) return t('auth.confirmPasswordRequired') || 'Please confirm your password'
  if (confirmPassword !== password) return t('auth.passwordMismatch') || 'Passwords do not match'
  return undefined
}

// Password strength indicator
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { score: 0, label: '', color: '' }
  
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) score++
  
  if (score <= 2) return { score, label: t('auth.passwordWeak') || 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, label: t('auth.passwordMedium') || 'Medium', color: 'bg-yellow-500' }
  return { score, label: t('auth.passwordStrong') || 'Strong', color: 'bg-green-500' }
})

const validateEmail = (email: string): string | undefined => {
  if (!email) return t('auth.emailRequired') || 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return t('auth.emailInvalid') || 'Invalid email format'
  return undefined
}

const handleRegister = async () => {
  // Reset errors
  errors.name = errors.email = errors.username = errors.password = errors.confirmPassword = undefined
  error.value = ''
  
  // Validate all fields
  errors.name = validateName(form.name)
  errors.email = validateEmail(form.email)
  errors.username = validateUsername(form.username)
  errors.password = validatePassword(form.password)
  errors.confirmPassword = validateConfirmPassword(form.confirmPassword, form.password)
  
  // If any validation errors, stop
  if (errors.name || errors.email || errors.username || errors.password || errors.confirmPassword) {
    return
  }
  
  try {
    const { confirmPassword, ...registerPayload } = form
    const result = await auth.register(registerPayload)
    // Redirect to verification pending page with userId
    router.push({ path: '/verification-pending', query: { userId: result.userId, email: form.email } })
  } catch (err: any) {
    error.value = err.message
  }
}
</script>
