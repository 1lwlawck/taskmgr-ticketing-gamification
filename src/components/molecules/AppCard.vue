<template>
  <Card class="rounded-3xl border border-border bg-card shadow-card transition hover:shadow-lg">
    <CardHeader v-if="hasHeader" class="px-6 pt-6 pb-2">
      <CardTitle class="flex items-center justify-between text-lg font-semibold text-foreground">
        <span>{{ title }}</span>
        <slot name="action" />
      </CardTitle>
      <CardDescription v-if="description" class="text-sm text-muted-foreground">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="px-6 pb-6 pt-4">
      <slot />
    </CardContent>
    <CardFooter v-if="$slots.footer" class="px-6 pb-6 pt-0">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/atoms/ui/card'

const props = defineProps<{
  title?: string
  description?: string
}>()

const hasHeader = computed(() => Boolean(props.title || props.description || !!useSlots().action))
</script>
