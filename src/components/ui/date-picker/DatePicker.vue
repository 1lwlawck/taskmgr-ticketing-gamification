<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Calendar state
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Parse selected date
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const date = new Date(props.modelValue)
  return isNaN(date.getTime()) ? null : date
})

// Initialize calendar to selected date's month/year
watch(() => props.modelValue, (val) => {
  if (val) {
    const date = new Date(val)
    if (!isNaN(date.getTime())) {
      currentMonth.value = date.getMonth()
      currentYear.value = date.getFullYear()
    }
  }
}, { immediate: true })

// Generate calendar days
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days: { date: number; month: number; year: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = []
  
  // Previous month padding
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startPadding - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    days.push({
      date: day,
      month: currentMonth.value - 1,
      year: currentYear.value,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }
  
  // Current month days
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = 
      i === today.getDate() && 
      currentMonth.value === today.getMonth() && 
      currentYear.value === today.getFullYear()
    
    const isSelected = selectedDate.value 
      ? i === selectedDate.value.getDate() && 
        currentMonth.value === selectedDate.value.getMonth() &&
        currentYear.value === selectedDate.value.getFullYear()
      : false
    
    days.push({
      date: i,
      month: currentMonth.value,
      year: currentYear.value,
      isCurrentMonth: true,
      isToday,
      isSelected,
    })
  }
  
  // Next month padding
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      month: currentMonth.value + 1,
      year: currentYear.value,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }
  
  return days
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day: typeof calendarDays.value[0]) => {
  const date = new Date(day.year, day.month, day.date)
  const formatted = date.toISOString().split('T')[0]
  emit('update:modelValue', formatted)
  emit('change', formatted)
  isOpen.value = false
}

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const onClickOutside = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative date-picker">
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.99]"
      @click="toggleOpen"
    >
      <span :class="displayValue ? 'text-slate-900' : 'text-slate-400'">
        {{ displayValue || placeholder }}
      </span>
      <Calendar class="h-4 w-4 text-slate-400 shrink-0" />
    </button>

    <!-- Calendar Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 mt-1.5 w-72 origin-top-left overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <button 
            type="button" 
            class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            @click="prevMonth"
          >
            <ChevronLeft class="h-4 w-4 text-slate-600" />
          </button>
          <span class="text-sm font-semibold text-slate-900">
            {{ MONTHS[currentMonth] }} {{ currentYear }}
          </span>
          <button 
            type="button" 
            class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            @click="nextMonth"
          >
            <ChevronRight class="h-4 w-4 text-slate-600" />
          </button>
        </div>

        <!-- Day Labels -->
        <div class="grid grid-cols-7 mb-1">
          <div 
            v-for="day in DAYS" 
            :key="day" 
            class="text-center text-[10px] font-semibold text-slate-400 uppercase py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-0.5">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            :class="[
              'h-8 w-full rounded-lg text-xs font-medium transition-all duration-150',
              day.isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
              day.isToday && !day.isSelected ? 'ring-1 ring-indigo-400 ring-offset-1' : '',
              day.isSelected 
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25' 
                : 'hover:bg-slate-100',
            ]"
            @click="selectDate(day)"
          >
            {{ day.date }}
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="mt-3 pt-3 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            class="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            @click="selectDate({ date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear(), isCurrentMonth: true, isToday: true, isSelected: false })"
          >
            Today
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            @click="emit('update:modelValue', ''); isOpen = false"
          >
            Clear
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.date-picker button:focus {
  outline: none;
}
</style>
