<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  class?: string
  align?: 'start' | 'center' | 'end'
}>()

const ctx = inject<any>('dropdownContext')
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
  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="menuRef"
      class="z-50 mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white/95 p-2 text-sm shadow-xl backdrop-blur"
      :class="[alignClass, props.class]"
    >
      <slot />
    </div>
  </Teleport>
</template>
