<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGamificationStore } from '@/stores/gamification'

onMounted(() => {
  const auth = useAuthStore()
  const gamification = useGamificationStore()
  if (auth.currentUser) {
    gamification.ensureUserStats(auth.currentUser.id)
  }
})
</script>
