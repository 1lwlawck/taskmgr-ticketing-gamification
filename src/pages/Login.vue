<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <div class="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-lg">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Ticket Ops</p>
        <h1 class="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p class="text-sm text-muted-foreground">
          Use one of the demo logins or register a new account to jump into the dashboard.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleLogin">
        <div class="space-y-1">
          <label class="text-xs font-semibold uppercase text-muted-foreground">Username</label>
          <Input v-model="form.username" placeholder="Enter username" required class="bg-transparent" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-semibold uppercase text-muted-foreground">Password</label>
          <div class="relative">
            <Input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="bg-transparent pr-10"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground focus:outline-none"
              @click="togglePasswordVisibility"
            >
              <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
              <span class="sr-only">{{ showPassword ? 'Hide password' : 'Show password' }}</span>
            </button>
          </div>
        </div>
        <p v-if="error" class="text-xs text-destructive text-right">{{ error }}</p>
        <Button type="submit" class="w-full" size="lg">Sign in</Button>
      </form>

      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>Need an account?</span>
        <RouterLink to="/register">
          <Button variant="ghost" size="sm">Register</Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  try {
    error.value = ''
    await auth.login(form)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}
</script>
