<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/atoms/ui/skeleton'

const props = defineProps<{
  columns?: number
  cards?: number
}>()

const columnCount = computed(() => Math.max(1, props.columns ?? 4))
const cardCount = computed(() => Math.max(1, props.cards ?? 3))
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="col in columnCount"
      :key="col"
      class="rounded-2xl border border-border bg-background/80 p-4 shadow-card"
    >
      <div class="mb-4 flex items-center justify-between text-xs uppercase text-muted-foreground">
        <Skeleton class="h-3 w-24 rounded-full" />
        <Skeleton class="h-6 w-12 rounded-full" />
      </div>
      <div class="space-y-3">
        <div
          v-for="card in cardCount"
          :key="`card-${col}-${card}`"
          class="rounded-2xl border border-border bg-white/95 p-4 shadow-sm"
        >
          <Skeleton class="h-4 w-3/4 rounded-md" />
          <Skeleton class="mt-2 h-3 w-1/2 rounded-full" />
          <Skeleton class="mt-2 h-3 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  </div>
</template>
