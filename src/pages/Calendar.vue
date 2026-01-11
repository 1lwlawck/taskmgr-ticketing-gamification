<template>
  <section class="space-y-8">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('calendar.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('calendar.heroTitle') }}</h1>
          <p class="text-sm text-white/70">{{ t('calendar.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="prevMonth"
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="min-w-[160px] text-center text-lg font-medium">{{ currentMonthLabel }}</span>
          <button
            @click="nextMonth"
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <CardGridSkeleton :count="1" columns-class="grid-cols-1" />
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
    </div>

    <!-- Calendar Grid -->
    <div v-else class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <!-- Day Headers -->
      <div class="mb-4 grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
        <div v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          :class="[
            'min-h-[100px] rounded-xl border p-2 transition',
            day.isCurrentMonth ? 'border-border bg-background' : 'border-transparent bg-slate-50/50',
            day.isToday ? 'ring-2 ring-indigo-500' : '',
          ]"
        >
          <div class="mb-1 flex items-center justify-between">
            <span
              :class="[
                'text-sm font-medium',
                day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',
                day.isToday ? 'text-indigo-600' : '',
              ]"
            >
              {{ day.date }}
            </span>
            <span v-if="day.events.length" class="rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-600">
              {{ day.events.length }}
            </span>
          </div>
          <div class="space-y-1">
            <div
              v-for="event in day.events.slice(0, 2)"
              :key="event.id"
              :class="[
                'truncate rounded px-1.5 py-0.5 text-xs',
                getEventClass(event.type),
              ]"
              :title="event.title"
            >
              {{ event.title }}
            </div>
            <div v-if="day.events.length > 2" class="text-xs text-muted-foreground">
              +{{ day.events.length - 2 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-foreground">{{ t('calendar.upcomingEvents') }}</h3>
      <div class="space-y-3">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="flex items-center gap-4 rounded-xl border border-border p-4 transition hover:bg-slate-50"
        >
          <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', getEventIconClass(event.type)]">
            <svg v-if="event.type === 'ticket_deadline'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">{{ event.title }}</p>
            <p class="text-sm text-muted-foreground">
              {{ formatEventDate(event.date) }}
              <span v-if="event.projectName" class="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                {{ event.projectName }}
              </span>
            </p>
          </div>
          <span :class="['rounded-full px-2 py-1 text-xs font-medium', getEventBadgeClass(event.type)]">
            {{ getEventTypeLabel(event.type) }}
          </span>
        </div>
        <div v-if="!upcomingEvents.length" class="py-8 text-center text-sm text-muted-foreground">
          {{ t('calendar.noEvents') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useCalendarStore } from '@/stores/calendar'
import type { CalendarEvent } from '@/types/models'
import { CardGridSkeleton } from '@/components/molecules/skeletons'

const { t } = useI18n()
const calendarStore = useCalendarStore()
const { events, loading } = storeToRefs(calendarStore)

const currentDate = ref(new Date())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

interface CalendarDay {
  date: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  const days: CalendarDay[] = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // Previous month days
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i
    const fullDate = new Date(year, month - 1, date).toISOString().split('T')[0]
    days.push({
      date,
      fullDate,
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDate(fullDate),
    })
  }
  
  // Current month days
  for (let date = 1; date <= daysInMonth; date++) {
    const fullDate = new Date(year, month, date).toISOString().split('T')[0]
    days.push({
      date,
      fullDate,
      isCurrentMonth: true,
      isToday: fullDate === todayStr,
      events: getEventsForDate(fullDate),
    })
  }
  
  // Next month days
  const remaining = 42 - days.length
  for (let date = 1; date <= remaining; date++) {
    const fullDate = new Date(year, month + 1, date).toISOString().split('T')[0]
    days.push({
      date,
      fullDate,
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDate(fullDate),
    })
  }
  
  return days
})

const upcomingEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return events.value
    .filter((e) => e.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
})

function getEventsForDate(date: string) {
  return events.value.filter((e) => e.date.startsWith(date))
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function getEventClass(type: string) {
  const classes: Record<string, string> = {
    ticket_deadline: 'bg-red-100 text-red-700',
    epic_start: 'bg-emerald-100 text-emerald-700',
    epic_end: 'bg-purple-100 text-purple-700',
  }
  return classes[type] || 'bg-slate-100 text-slate-700'
}

function getEventIconClass(type: string) {
  const classes: Record<string, string> = {
    ticket_deadline: 'bg-red-100 text-red-600',
    epic_start: 'bg-emerald-100 text-emerald-600',
    epic_end: 'bg-purple-100 text-purple-600',
  }
  return classes[type] || 'bg-slate-100 text-slate-600'
}

function getEventBadgeClass(type: string) {
  const classes: Record<string, string> = {
    ticket_deadline: 'bg-red-100 text-red-700',
    epic_start: 'bg-emerald-100 text-emerald-700',
    epic_end: 'bg-purple-100 text-purple-700',
  }
  return classes[type] || 'bg-slate-100 text-slate-700'
}

function getEventTypeLabel(type: string) {
  const labels: Record<string, string> = {
    ticket_deadline: 'Deadline',
    epic_start: 'Epic Start',
    epic_end: 'Epic End',
  }
  return labels[type] || type
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

async function loadEvents() {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const start = new Date(year, month, 1).toISOString().split('T')[0]
  const end = new Date(year, month + 2, 0).toISOString().split('T')[0]
  await calendarStore.fetchEvents({ start, end })
}

watch(currentDate, () => {
  loadEvents()
})

onMounted(() => {
  loadEvents()
})
</script>
