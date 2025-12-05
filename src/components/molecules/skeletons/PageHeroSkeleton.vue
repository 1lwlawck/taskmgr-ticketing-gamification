<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/atoms/ui/skeleton'

const props = defineProps<{
  stats?: number
}>()

const statCount = computed(() => Math.max(1, props.stats ?? 3))
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
    <div class="pointer-events-none absolute -right-20 top-8 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
    <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
    <div class="relative flex flex-col gap-6 p-6 sm:gap-8 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div class="w-full max-w-xl space-y-3">
        <Skeleton class="h-3 w-32 rounded-full bg-white/20" />
        <Skeleton class="h-8 w-72 max-w-full rounded-xl bg-white/30" />
        <Skeleton class="h-4 w-80 max-w-full rounded-full bg-white/20" />
        <div class="flex flex-wrap gap-3">
          <Skeleton class="h-10 w-28 rounded-2xl bg-white/20" />
          <Skeleton class="h-10 w-32 rounded-2xl bg-white/25" />
        </div>
      </div>
      <div class="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="index in statCount"
          :key="index"
          class="rounded-2xl border border-white/15 bg-white/10 p-4"
        >
          <Skeleton class="h-3 w-20 rounded-full bg-white/25" />
          <Skeleton class="mt-2 h-9 w-28 rounded-lg bg-white/30" />
          <Skeleton class="mt-2 h-3 w-24 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  </div>
</template>
