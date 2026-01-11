<template>
  <section class="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
    <h1 class="text-2xl font-semibold text-slate-900">{{ t('join.title') }}</h1>
    <p class="text-sm text-slate-500">{{ t('join.subtitle') }}</p>
    <form class="space-y-3 text-sm" @submit.prevent="join">
      <label class="block">
        <span class="text-xs uppercase text-slate-500">{{ t('join.code') }}</span>
        <input v-model.trim="code" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 uppercase" />
      </label>
      <button
        type="submit"
        class="rounded-md border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
      >
        {{ t('join.submit') }}
      </button>
    </form>
    <p v-if="message" :class="success ? 'text-slate-700' : 'text-slate-400'">{{ message }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const code = ref('')
const message = ref('')
const success = ref(false)
const projectsStore = useProjectsStore()
const auth = useAuthStore()

const join = async () => {
  if (!code.value) {
    success.value = false
    message.value = t('join.required')
    return
  }
  try {
    const project = await projectsStore.joinByCode(code.value, auth.currentUser)
    success.value = true
    message.value = t('join.success', { name: project.name })
  } catch (error) {
    success.value = false
    message.value = error instanceof Error ? error.message : t('join.error')
  }
}
</script>


