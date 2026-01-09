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
  }>(),
  {
    placeholder: 'Select...',
    searchable: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() =>
  props.options.find((opt) => opt.value === props.modelValue)
)

const filteredOptions = computed(() => {
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
  <div ref="containerRef" class="relative" :class="props.class">
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      class="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-all hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      @click="toggle"
    >
      <span :class="selectedOption ? 'text-slate-900' : 'text-slate-400'">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <ChevronDown
        class="h-4 w-4 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Content -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 mt-1 w-full min-w-[180px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
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
            class="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors"
            :class="[
              option.value === modelValue
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-700 hover:bg-slate-50',
              option.disabled && 'cursor-not-allowed opacity-50',
            ]"
            @click="select(option)"
          >
            <span>{{ option.label }}</span>
            <Check v-if="option.value === modelValue" class="h-4 w-4 text-indigo-600" />
          </button>
          <p
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-center text-sm text-slate-400"
          >
            No results found
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
