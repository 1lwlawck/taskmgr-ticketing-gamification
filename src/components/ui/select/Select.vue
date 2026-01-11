<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check, Search } from 'lucide-vue-next'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options: SelectOption[]
    placeholder?: string
    searchable?: boolean
    disabled?: boolean
    class?: string
    direction?: 'up' | 'down'
    variant?: 'default' | 'glass' | 'ghost'
  }>(),
  {
    placeholder: 'Select...',
    searchable: false,
    disabled: false,
    direction: 'down',
    variant: 'default',
  }
)

const triggerClasses = computed(() => {
  if (props.variant === 'glass') {
    return 'bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 focus:ring-white/20'
  }
  if (props.variant === 'ghost') {
    return 'bg-transparent border-0 text-slate-700 hover:bg-slate-100'
  }
  return 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() =>
  props.options?.find((opt) => opt.value === props.modelValue)
)

const filteredOptions = computed(() => {
  if (!props.options) return []
  if (!searchQuery.value.trim()) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter((opt) => opt.label.toLowerCase().includes(query))
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    setTimeout(() => searchInputRef.value?.focus(), 50)
  }
}

const select = (option: SelectOption) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  searchQuery.value = ''
}

const onClickOutside = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

watch(isOpen, (val) => {
  if (!val) searchQuery.value = ''
})
</script>

<template>
  <div ref="containerRef" class="custom-select relative" :class="props.class">
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      :class="triggerClasses"
      @click="toggle"
    >
      <span :class="[selectedOption ? (variant === 'glass' ? 'text-white' : 'text-slate-900') : (variant === 'glass' ? 'text-white/70' : 'text-slate-400')]">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <ChevronDown
        class="h-4 w-4 shrink-0 transition-transform duration-200"
        :class="[isOpen ? 'rotate-180' : '', variant === 'glass' ? 'text-white/70' : 'text-slate-400']"
      />
    </button>

    <!-- Dropdown Content -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute left-0 z-[9999] w-full min-w-[180px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl',
          direction === 'up' ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
        ]"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="border-b border-slate-100 p-2">
          <div class="relative">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100"
              @click.stop
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-60 overflow-y-auto p-1">
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            :disabled="option.disabled"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150"
            :class="[
              option.value === modelValue
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-700 hover:bg-slate-50',
              option.disabled && 'cursor-not-allowed opacity-50',
            ]"
            @click="select(option)"
          >
            <span>{{ option.label }}</span>
            <Check v-if="option.value === modelValue" class="h-4 w-4 shrink-0 text-indigo-600" />
          </button>
          <p
            v-if="filteredOptions.length === 0"
            class="px-3 py-4 text-center text-sm text-slate-400"
          >
            No results found
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select button {
  /* Override any global select styles */
  appearance: auto;
  background-image: none;
  padding-right: 0.75rem;
}
</style>
