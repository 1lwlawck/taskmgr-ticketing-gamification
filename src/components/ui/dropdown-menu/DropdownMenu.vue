<script setup lang="ts">
import { provide, ref, watch, toRef } from 'vue'

const props = defineProps<{
  open?: boolean
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}>()

const controlled = toRef(props, 'open')
const localOpen = ref(props.defaultOpen ?? false)
const open = ref(controlled.value ?? localOpen.value)

const setOpen = (val: boolean) => {
  if (controlled.value === undefined) {
    localOpen.value = val
    open.value = val
  } else {
    open.value = controlled.value
  }
}

watch(controlled, (val) => {
  if (val !== undefined) open.value = val
})

provide('dropdownContext', {
  open,
  align: props.align ?? 'start',
  toggle: () => setOpen(!open.value),
  close: () => setOpen(false),
  openMenu: () => setOpen(true),
})
</script>

<template>
  <div class="relative inline-block">
    <slot />
  </div>
</template>
