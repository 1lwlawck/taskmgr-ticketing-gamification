<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950 dark:text-slate-100">
    <div class="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Ticket Ops</p>
        <h1 class="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p class="text-slate-500">Use the demo logins (avery/devon/parker) or register a new account.</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Username</span>
          <input
            v-model="form.username"
            required
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Password</span>
          <input
            v-model="form.password"
            type="password"
            required
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
          />
        </label>
        <p v-if="error" class="text-sm text-slate-500">{{ error }}</p>
        <button type="submit" class="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white">Sign in</button>
      </form>

      <p class="text-center text-xs text-slate-500">
        Need an account?
        <RouterLink to="/register" class="text-slate-900 underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const error = ref('')

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
