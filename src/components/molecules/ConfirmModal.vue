<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-xl">
      <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <p class="mt-2 text-slate-500">{{ message }}</p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="rounded-md px-4 py-2 text-slate-400 hover:text-slate-900" @click="$emit('cancel')">Cancel</button>
        <button
          class="rounded-md border-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 px-4 py-2 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          @click="$emit('confirm')"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: {
    type: String,
    default: 'Confirm action',
  },
  message: {
    type: String,
    default: 'Are you sure? This cannot be undone.',
  },
})
</script>
