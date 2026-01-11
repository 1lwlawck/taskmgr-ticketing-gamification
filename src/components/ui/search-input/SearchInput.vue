<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div 
    class="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-md"
    :class="props.class"
  >
    <Search class="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="min-w-0 flex-1 bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none"
      @input="handleInput"
    />
  </div>
</template>
