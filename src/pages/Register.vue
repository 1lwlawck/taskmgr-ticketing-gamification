<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <div class="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-lg">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Ticket Ops</p>
        <h1 class="text-3xl font-semibold text-foreground">Create account</h1>
        <p class="text-sm text-muted-foreground">The first registered user becomes admin automatically.</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-1">
          <label class="text-xs font-semibold uppercase text-muted-foreground">Name</label>
          <Input v-model="form.name" placeholder="Full name" required class="bg-transparent" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-semibold uppercase text-muted-foreground">Username</label>
          <Input v-model="form.username" placeholder="Choose a username" required class="bg-transparent" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-semibold uppercase text-muted-foreground">Password</label>
          <div class="relative">
            <Input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              minlength="4"
              placeholder="Create a password"
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
        <Button type="submit" class="w-full" size="lg">Register</Button>
      </form>

      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>Already registered?</span>
        <RouterLink to="/login">
          <Button variant="ghost" size="sm">Login</Button>
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
const form = reactive({ name: '', username: '', password: '' })
const error = ref('')
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleRegister = async () => {
  if (!form.name || !form.username || !form.password) {
    error.value = 'Please complete all fields'
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
