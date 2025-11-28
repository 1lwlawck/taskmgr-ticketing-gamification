<template>
  <section class="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
    <h1 class="text-2xl font-semibold text-slate-900">Join a project</h1>
    <p class="text-sm text-slate-500">Enter an invite code provided by a project lead.</p>
    <form class="space-y-3 text-sm" @submit.prevent="join">
      <label class="block">
        <span class="text-xs uppercase text-slate-500">Invite code</span>
        <input v-model.trim="code" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 uppercase" />
      </label>
      <button
        type="submit"
        class="rounded-md border-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 px-4 py-2 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
      >
        Join
      </button>
    </form>
    <p v-if="message" :class="success ? 'text-slate-700' : 'text-slate-400'">{{ message }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'

const code = ref('')
const message = ref('')
const success = ref(false)
const projectsStore = useProjectsStore()
const auth = useAuthStore()

const join = () => {
  if (!code.value) {
    success.value = false
    message.value = 'Enter a code first'
    return
  }
  try {
    const project = projectsStore.joinByCode(code.value, auth.currentUser)
    success.value = true
    message.value = `Joined ${project.name}`
  } catch (error) {
    success.value = false
    message.value = error.message
  }
}
</script>


