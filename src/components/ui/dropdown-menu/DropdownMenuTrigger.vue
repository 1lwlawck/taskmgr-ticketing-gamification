<script setup lang="ts">
import { inject } from 'vue'

const ctx = inject<any>('dropdownContext')
</script>

<template>
  <span @click.stop="ctx?.toggle()" class="inline-flex">
    <slot />
  </span>
</template>
