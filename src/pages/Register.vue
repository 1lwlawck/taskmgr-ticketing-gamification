<template>
  <div class="relative flex min-h-screen items-center justify-center bg-white px-4 py-10 text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_52%)]"></div>
    <div class="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur md:flex-row">
      <div class="hidden min-h-full flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-10 py-12 text-white md:flex">
        <div class="space-y-6">
          <p class="text-xs uppercase tracking-[0.5em] text-white/60">Ticket Ops</p>
          <h1 class="text-4xl font-semibold leading-tight">Assemble your squad.</h1>
          <p class="text-sm text-white/70">
            Pengguna pertama otomatis menjadi admin. Bangun board yang menggerakkan misimu.
          </p>
        </div>
        <div class="space-y-4 text-sm text-white/70">
          <p class="text-xs uppercase tracking-[0.3em] text-white/50">Kickoff steps</p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              Buat project dan undang squad
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-300"></span>
              Konfigurasi streak dan badge
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-amber-300"></span>
              Mulai log wins di mission board
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-1 items-center bg-white px-8 py-10 text-slate-900 md:px-12">
        <div class="w-full">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Create account</p>
            <h2 class="text-3xl font-semibold text-slate-900">Launch a new control center</h2>
            <p class="text-sm text-slate-500">Lengkapi data untuk memulai sebagai operator pertama.</p>
          </div>
          <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
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
          <div class="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Already registered?</span>
            <RouterLink to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </RouterLink>
          </div>
        </div>
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
