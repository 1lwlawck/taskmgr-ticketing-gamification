<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[12000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg">
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
        <p class="mt-2 text-slate-500">{{ message }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-md px-4 py-2 text-slate-400 hover:text-slate-900" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
          <button
            class="rounded-md border-0 bg-[linear-gradient(135deg,#0b1224,#10182f,#1c2650)] px-4 py-2 text-white shadow-md shadow-indigo-900/30 transition hover:brightness-110 hover:shadow-lg"
            @click="$emit('confirm')"
          >
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: 'Confirm action',
  },
  message: {
    type: String,
    default: 'Are you sure? This cannot be undone.',
  },
})

const toggleBodyBlur = (state: boolean) => {
  const body = document.body
  if (!body) return
  if (state) body.classList.add('modal-open')
  else body.classList.remove('modal-open')
}

watch(
  () => props.open,
  (val) => toggleBodyBlur(Boolean(val)),
  { immediate: true }
)

onUnmounted(() => toggleBodyBlur(false))

const { t } = useI18n()
</script>

<style>
.modal-open .topbar-blurable {
  filter: blur(6px);
  opacity: 0.35;
  pointer-events: none;
  transition: filter 150ms ease, opacity 150ms ease;
}
</style>
