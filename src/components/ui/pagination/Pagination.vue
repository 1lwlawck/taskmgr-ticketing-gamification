<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Select from '@/components/ui/select/Select.vue'

interface Props {
  page?: number
  hasPrev?: boolean
  hasNext?: boolean
  loading?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  hasPrev: false,
  hasNext: false,
  loading: false,
  limit: 20,
})

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'update:limit', value: number): void
}>()

const limitOptions = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

const selectedLimit = computed({
  get: () => String(props.limit),
  set: (val) => emit('update:limit', Number(val)),
})
</script>

<template>
  <div class="flex items-center justify-between border-t border-border px-2 py-4">
    <!-- Limit Selector -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground mr-2">
      <span>Rows per page:</span>
      <Select
        v-model="selectedLimit"
        :options="limitOptions"
        direction="up"
        class="w-20"
      />
    </div>

    <!-- Navigation -->
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium">Page {{ page }}</span>
      <div class="flex items-center gap-1">
        <button
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!hasPrev || loading"
          @click="emit('prev')"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!hasNext || loading"
          @click="emit('next')"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
