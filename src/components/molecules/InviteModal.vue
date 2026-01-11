<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">Generate Invite Code</h2>
      <p class="mt-1 text-slate-500">Share the code with teammates to let them join this project.</p>

      <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Maximum Uses</span>
          <input
            v-model.number="form.maxUses"
            type="number"
            min="1"
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase text-slate-500">Expires (days)</span>
          <input
            v-model.number="form.expiryDays"
            type="number"
            min="1"
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none"
          />
        </label>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-md px-4 py-2 text-slate-400 hover:text-slate-900" @click="$emit('close')">Cancel</button>
          <button
            type="submit"
            class="rounded-md border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          >
            Generate
          </button>
        </div>
      </form>

      <div v-if="inviteCode" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
        <p class="text-xs uppercase text-slate-500">Invite Code</p>
        <p class="text-2xl font-semibold tracking-widest text-slate-900">{{ inviteCode }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({ open: Boolean, inviteCode: String })
const emit = defineEmits(['generate', 'close'])

const form = reactive({ maxUses: 5, expiryDays: 7 })
const inviteCode = computed(() => props.inviteCode)

const handleSubmit = () => {
  emit('generate', { ...form })
}
</script>
