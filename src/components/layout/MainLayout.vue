<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-1 flex-col">
      <Topbar @toggleSidebar="toggleSidebar" />
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
import Toast from '@/components/Toast.vue'

const sidebarOpen = ref(true)
const route = useRoute()

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

watch(
  () => route.fullPath,
  () => {
    if (window.innerWidth < 768) {
      sidebarOpen.value = false
    }
  }
)
</script>
