<script setup lang="ts">
import { inject } from 'vue'
const ctx = inject<any>('dropdownContext')
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
    @click="ctx?.close?.()"
  >
    <slot />
  </button>
</template>
