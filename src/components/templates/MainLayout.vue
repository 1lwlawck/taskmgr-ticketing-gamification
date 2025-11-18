<template>
  <SidebarProvider class="flex min-h-screen bg-slate-50 text-slate-900">
    <Sidebar />
    <div class="flex flex-1 flex-col">
      <Topbar />
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
    <Toast />
  </SidebarProvider>
</template>

<script setup>
import Sidebar from '@/components/organisms/Sidebar.vue'
import Topbar from '@/components/organisms/Topbar.vue'
import Toast from '@/components/organisms/Toast.vue'
import { SidebarProvider } from '@/components/atoms/ui/sidebar'
</script>
