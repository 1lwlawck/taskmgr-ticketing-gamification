<script setup lang="ts">
import { inject } from 'vue'
const ctx = inject<any>('dropdownContext')
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
    @click="ctx?.close?.()"
  >
    <slot />
  </button>
</template>
