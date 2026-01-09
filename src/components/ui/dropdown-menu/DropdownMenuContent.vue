<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, ref } from 'vue'
import type { DropdownContext } from './types'

const props = defineProps<{
  class?: string
  align?: 'start' | 'center' | 'end'
}>()

const ctx = inject<DropdownContext | undefined>('dropdownContext')
const menuRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => ctx?.open?.value ?? false)
const alignClass = computed(() => {
  const a = props.align ?? ctx?.align ?? 'start'
  switch (a) {
    case 'end':
      return 'right-0'
    case 'center':
      return 'left-1/2 -translate-x-1/2'
    default:
      return 'left-0'
  }
})

const onClickOutside = (e: MouseEvent) => {
  if (!menuRef.value) return
  if (!menuRef.value.contains(e.target as Node)) {
    ctx?.close?.()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
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
      ref="menuRef"
      class="absolute z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-slate-200/80 bg-white p-1.5 text-sm shadow-lg ring-1 ring-black/5"
      :class="[alignClass, props.class]"
    >
      <slot />
    </div>
  </Transition>
</template>
