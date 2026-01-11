<script setup lang="ts">
import { inject } from 'vue'
const ctx = inject<any>('dropdownContext')
</script>

<template>
  <button
    type="button"
    class="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:outline-none active:bg-slate-100"
    @click="ctx?.close?.()"
  >
    <slot />
  </button>
</template>
