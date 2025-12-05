<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/atoms/ui/skeleton'

const props = defineProps<{
  columns?: number
  rows?: number
}>()

const cols = computed(() => Math.max(1, props.columns ?? 5))
const bodyRows = computed(() => Math.max(1, props.rows ?? 4))
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card">
    <div class="hidden bg-muted/60 px-4 py-3 sm:block">
      <div
        class="grid gap-3"
        :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
      >
        <Skeleton
          v-for="index in cols"
          :key="`header-${index}`"
          class="h-4 w-full rounded-full"
        />
      </div>
    </div>
    <div class="divide-y divide-border">
      <div
        v-for="row in bodyRows"
        :key="`row-${row}`"
        class="px-4 py-3"
      >
        <div
          class="grid items-center gap-3"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
          <Skeleton
            v-for="col in cols"
            :key="`cell-${row}-${col}`"
            class="h-4 w-full rounded-md"
          />
        </div>
      </div>
    </div>
  </div>
</template>
