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
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95 translate-y-1"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-1"
  >
    <div
      v-if="isOpen"
      ref="menuRef"
      class="absolute z-50 mt-1.5 min-w-[180px] origin-top-left overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-xl"
      :class="[alignClass, props.class]"
    >
      <slot />
    </div>
  </Transition>
</template>
