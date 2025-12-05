<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/atoms/ui/skeleton'

const props = defineProps<{
  count?: number
}>()

const items = computed(() => Math.max(1, props.count ?? 3))
</script>

<template>
  <div class="grid gap-6 md:grid-cols-3">
    <div
      v-for="index in items"
      :key="index"
      class="rounded-2xl border border-border bg-white p-4 shadow-sm"
    >
      <Skeleton class="h-3 w-24 rounded-full bg-slate-200" />
      <Skeleton class="mt-3 h-9 w-28 rounded-lg bg-slate-200" />
      <Skeleton class="mt-2 h-3 w-32 rounded-full bg-slate-100" />
    </div>
  </div>
</template>
