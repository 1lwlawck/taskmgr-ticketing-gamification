<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/atoms/ui/skeleton'

const props = defineProps<{
  count?: number
  columnsClass?: string
}>()

const items = computed(() => Math.max(1, props.count ?? 6))
const columns = computed(() => props.columnsClass || 'sm:grid-cols-2 xl:grid-cols-3')
</script>

<template>
  <div class="grid gap-4" :class="columns">
    <div
      v-for="index in items"
      :key="index"
      class="rounded-2xl border border-border bg-white p-4 shadow-sm"
    >
      <Skeleton class="h-4 w-3/4 rounded-lg bg-slate-200" />
      <Skeleton class="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
      <Skeleton class="mt-3 h-10 w-full rounded-xl bg-slate-100" />
      <div class="mt-3 flex gap-2">
        <Skeleton class="h-4 w-16 rounded-full bg-slate-100" />
        <Skeleton class="h-4 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  </div>
</template>
