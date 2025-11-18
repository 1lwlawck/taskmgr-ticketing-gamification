<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold text-slate-900">Leaderboard</h1>
      <p class="text-sm text-slate-500">Gamified view of contributors ranked by XP.</p>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="(user, index) in topThree"
        :key="user.id"
        class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card"
      >
        <p class="text-sm uppercase text-slate-400">#{{ index + 1 }}</p>
        <p class="text-xl font-semibold text-slate-900">{{ user.name }}</p>
        <p class="text-slate-500">{{ user.role }}</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ user.xp }} XP</p>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="px-4 py-2 text-left">Rank</th>
            <th class="px-4 py-2 text-left">User</th>
            <th class="px-4 py-2 text-left">Level</th>
            <th class="px-4 py-2 text-left">Tickets closed</th>
            <th class="px-4 py-2 text-left">XP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-700">
          <tr v-for="user in rest" :key="user.id">
            <td class="px-4 py-3">{{ user.rank }}</td>
            <td class="px-4 py-3">{{ user.name }}</td>
            <td class="px-4 py-3">{{ user.level }}</td>
            <td class="px-4 py-3">{{ user.tickets_closed_count }}</td>
            <td class="px-4 py-3">{{ user.xp }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { useGamificationStore } from '@/stores/gamification'

const usersStore = useUsersStore()
const gamificationStore = useGamificationStore()
const { users } = storeToRefs(usersStore)
const { userStats } = storeToRefs(gamificationStore)

const ranking = computed(() =>
  users.value
    .map((user) => ({
      ...user,
      ...(userStats.value[user.id] ?? { xp: 0, level: 1, tickets_closed_count: 0 }),
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
)

const topThree = computed(() => ranking.value.slice(0, 3))
const rest = computed(() => ranking.value.slice(3))
</script>
