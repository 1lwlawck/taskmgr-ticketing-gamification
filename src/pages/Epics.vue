<template>
  <section v-if="pageLoading" class="space-y-8">
    <PageHeroSkeleton />
    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <CardGridSkeleton :count="2" columns-class="grid-cols-1" />
      <CardGridSkeleton :count="2" columns-class="grid-cols-1" />
    </div>
  </section>

  <section v-else class="space-y-8">
    <div class="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl">
      <!-- Background clipped -->
      <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div class="absolute -right-20 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl"></div>
        <div class="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      </div>

      <!-- Content visible -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/60">{{ t('epics.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('epics.heroTitle') }}</h1>
          <p class="text-sm text-white/70">
            {{ t('epics.heroCount', { count: epicsByProject.length, project: currentProject?.name ?? '...' }) }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Select
            v-model="selectedProject"
            :options="projectSelectOptions"
            class="min-w-[180px]"
          />
          <button class="rounded-md border border-white/30 bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/25" @click="fetchEpics">
            {{ t('epics.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">{{ t('epics.createLabel') }}</p>
              <h2 class="text-lg font-semibold text-foreground">{{ t('epics.createTitle') }}</h2>
            </div>
            <span class="text-xs text-muted-foreground">{{ currentProject?.name ?? t('epics.selectProject') }}</span>
          </div>
          <p v-if="!canManageEpics" class="text-xs text-rose-600">{{ t('epics.onlyAdmin') }}</p>
          <form class="mt-3 grid gap-3 md:grid-cols-2" @submit.prevent="handleCreate">
            <label class="space-y-1 md:col-span-2">
              <span class="text-xs uppercase text-muted-foreground">{{ t('epics.form.title') }} <span class="text-rose-500">*</span></span>
              <input v-model="form.title" required class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm" :placeholder="t('epics.form.placeholderTitle')" />
              <p v-if="errors.title" class="text-[11px] text-rose-600">{{ errors.title }}</p>
            </label>
            <label class="space-y-1 md:col-span-2">
              <span class="text-xs uppercase text-muted-foreground">{{ t('epics.form.description') }} <span class="text-rose-500">*</span></span>
              <textarea
                v-model="form.description"
                rows="2"
                required
                class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm"
                :placeholder="t('epics.form.placeholderDesc')"
              ></textarea>
              <p v-if="errors.description" class="text-[11px] text-rose-600">{{ errors.description }}</p>
            </label>
            <div class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">{{ t('epics.form.status') }} <span class="text-rose-500">*</span></span>
              <Select v-model="form.status" :options="statusSelectOptions" />
              <p v-if="errors.status" class="text-[11px] text-rose-600">{{ errors.status }}</p>
            </div>
            <div class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">{{ t('epics.form.start') }}</span>
              <DatePicker v-model="form.startDate" :placeholder="t('epics.form.start')" />
            </div>
            <div class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">{{ t('epics.form.due') }}</span>
              <DatePicker v-model="form.dueDate" :placeholder="t('epics.form.due')" />
              <p v-if="errors.dates" class="text-[11px] text-rose-600">{{ errors.dates }}</p>
            </div>
            <div class="md:col-span-2 flex justify-end gap-2">
              <button type="button" class="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground" @click="resetForm">{{ t('epics.form.clear') }}</button>
              <button
                type="submit"
                class="rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
                :disabled="!canManageEpics || !selectedProject || !form.title.trim()"
              >
                {{ editingId ? t('epics.form.submitSave') : t('epics.form.submitCreate') }}
              </button>
            </div>
          </form>
          <p v-if="errorMsg" class="mt-2 text-xs text-rose-600">{{ errorMsg }}</p>
        </div>

        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">{{ t('epics.timelineLabel') }}</p>
              <h2 class="text-lg font-semibold text-foreground">{{ t('epics.timelineTitle') }}</h2>
            </div>
            <p class="text-xs text-muted-foreground">{{ t('epics.itemsLabel', { count: epicsByProject.length }) }}</p>
          </div>
          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <button
              v-for="epic in epicsByProject"
              :key="epic.id"
              type="button"
              class="rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              @click="goDetail(epic.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-foreground">{{ epic.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ epic.description || t('epics.noDescription') }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-[10px] rounded-full border px-2 py-0.5 uppercase text-muted-foreground">{{ epic.status }}</span>
                  <div v-if="canManageEpics" class="flex gap-1">
                    <button
                      type="button"
                      class="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-slate-400"
                      @click.stop="startEdit(epic)"
                    >
                      {{ t('epics.edit') }}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-rose-300 px-2 py-0.5 text-[10px] text-rose-600 hover:bg-rose-50"
                      @click.stop="confirmDelete(epic.id)"
                    >
                      {{ t('epics.delete') }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="mt-3 h-2 rounded-full bg-slate-200">
                <span class="block h-full rounded-full bg-indigo-500" :style="{ width: progress(epic) + '%' }"></span>
              </div>
              <div class="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{{ t('epics.startLabel', { date: dateLabel(epic.startDate) }) }}</span>
                <span>{{ t('epics.dueLabel', { date: dateLabel(epic.dueDate) }) }}</span>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">{{ t('epics.progress', { done: epic.doneCount ?? 0, total: epic.totalCount ?? 0 }) }}</p>
            </button>
          </div>
          <p v-if="!epicsByProject.length" class="text-sm text-muted-foreground">{{ t('epics.emptyEpics') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">{{ t('epics.summaryTitle') }}</p>
          <div class="mt-3 space-y-2 text-sm text-foreground">
            <div class="flex items-center justify-between">
              <span>{{ t('epics.summary.total') }}</span>
              <span class="font-semibold">{{ epicsByProject.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('epics.summary.inProgress') }}</span>
              <span class="font-semibold">{{ epicsByProject.filter((e) => e.status === 'in_progress').length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('epics.summary.done') }}</span>
              <span class="font-semibold">{{ epicsByProject.filter((e) => e.status === 'done').length }}</span>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card text-sm text-muted-foreground">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">{{ t('epics.tipsTitle') }}</p>
          <ul class="mt-2 list-disc space-y-1 pl-4">
            <li v-for="tip in tips" :key="tip">{{ tip }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  <ConfirmModal
    :open="Boolean(confirmingId)"
    :title="t('epics.confirmDeleteTitle')"
    :message="t('epics.confirmDeleteMsg')"
    @cancel="confirmingId = null"
    @confirm="deleteEpic"
  />
  <div v-if="toast.open" class="fixed bottom-6 right-6 z-50">
    <div
      class="rounded-2xl px-4 py-3 text-sm shadow-lg transition"
      :class="toast.variant === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { useEpicsStore } from '@/stores/epics'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/helpers'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import { TICKET_STATUSES, type TicketStatus } from '@/utils/constants'
import { PageHeroSkeleton, CardGridSkeleton } from '@/components/molecules/skeletons'
import Select from '@/components/ui/select/Select.vue'
import DatePicker from '@/components/ui/date-picker/DatePicker.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t, tm } = useI18n()
const localeParam = computed(() => route.params.locale as string | undefined)
const localePath = (path: string) => (localeParam.value ? `/${localeParam.value}${path}` : path)
const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)
const epicsStore = useEpicsStore()
const { items } = storeToRefs(epicsStore)
const auth = useAuthStore()

const EPICS_PROJECT_KEY = 'ttm_epics_project'

const selectedProject = ref<string>('')
const errorMsg = ref('')
const loading = ref(false)
const pageLoading = computed(() => loading.value)
const editingId = ref<string | null>(null)
const confirmingId = ref<string | null>(null)
const toast = reactive({ open: false, message: '', variant: 'success' as 'success' | 'error' })
const STATUS_OPTIONS: TicketStatus[] = [...TICKET_STATUSES]
const form = reactive<{
  title: string
  description: string
  status: TicketStatus
  startDate: string
  dueDate: string
}>({
  title: '',
  description: '',
  status: 'backlog',
  startDate: '',
  dueDate: '',
})
const errors = reactive<{ title?: string; description?: string; status?: string; dates?: string }>({})

const epicsByProject = computed(() => epicsStore.byProject(selectedProject.value))
const currentProject = computed(() => projects.value.find((p) => p.id === selectedProject.value))
const canManageEpics = computed(() => ['admin', 'project_manager'].includes(auth.currentUser?.role as string))
const tips = computed(() => tm('epics.tips') as string[])

const projectSelectOptions = computed(() =>
  projects.value.map((p) => ({ value: p.id, label: p.name }))
)

const statusSelectOptions = computed(() =>
  STATUS_OPTIONS.map((s) => ({ value: s, label: s.replace('_', ' ') }))
)

const progress = (epic: any) => {
  const done = epic.doneCount ?? 0
  const total = epic.totalCount ?? 0
  if (!total) return 0
  return Math.round((done / total) * 100)
}

const dateLabel = (value?: string) => (value ? formatDate(value) : '-')

const goDetail = (id: string) => {
  router.push({ name: 'epic-detail', params: { locale: localeParam.value, id } })
}

const startEdit = (epic: any) => {
  editingId.value = epic.id
  form.title = epic.title
  form.description = epic.description ?? ''
  form.status = (epic.status as TicketStatus) ?? 'backlog'
  form.startDate = epic.startDate ? epic.startDate.slice(0, 10) : ''
  form.dueDate = epic.dueDate ? epic.dueDate.slice(0, 10) : ''
  errorMsg.value = ''
}

const confirmDelete = (id: string) => {
  confirmingId.value = id
}

const deleteEpic = async () => {
  if (!confirmingId.value) return
  try {
    await epicsStore.deleteEpic(confirmingId.value)
    showToast('Epic deleted')
    if (editingId.value === confirmingId.value) resetForm()
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Failed to delete epic', 'error')
  } finally {
    confirmingId.value = null
  }
}

const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.variant = variant
  toast.open = true
  setTimeout(() => (toast.open = false), 2000)
}

const fetchEpics = async () => {
  if (!selectedProject.value) return
  // Background Refresh: Only show skeleton if we have no data
  if (epicsByProject.value.length === 0) {
    loading.value = true
  }
  await epicsStore.fetchByProject(selectedProject.value)
  loading.value = false
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'backlog'
  form.startDate = ''
  form.dueDate = ''
  errorMsg.value = ''
  editingId.value = null
  errors.title = undefined
  errors.description = undefined
  errors.status = undefined
  errors.dates = undefined
}

const validateForm = () => {
  errors.title = undefined
  errors.description = undefined
  errors.status = undefined
  errors.dates = undefined

  if (!form.title.trim()) {
    errors.title = t('epics.errors.title')
  }

  if (!form.description.trim()) {
    errors.description = t('epics.errors.description')
  }

  if (!STATUS_OPTIONS.includes(form.status)) {
    errors.status = t('epics.errors.status')
  }

  if (form.startDate && form.dueDate && new Date(form.startDate) > new Date(form.dueDate)) {
    errors.dates = t('epics.errors.dates')
  }

  return !errors.title && !errors.description && !errors.status && !errors.dates
}

const handleCreate = async () => {
  if (!selectedProject.value) {
    errorMsg.value = t('epics.errors.selectProject')
    return
  }
  if (!validateForm()) {
    errorMsg.value = errors.title || errors.status || errors.dates || t('epics.errors.fixInput')
    return
  }
  const startDateIso = form.startDate ? `${form.startDate}T00:00:00Z` : undefined
  const dueDateIso = form.dueDate ? `${form.dueDate}T00:00:00Z` : undefined
  try {
    if (editingId.value) {
      await epicsStore.updateEpic(editingId.value, {
        title: form.title.trim(),
        description: form.description,
        status: form.status,
        startDate: startDateIso,
        dueDate: dueDateIso,
      })
    } else {
      await epicsStore.createEpic(selectedProject.value, {
        title: form.title.trim(),
        description: form.description,
        status: form.status,
        startDate: startDateIso,
        dueDate: dueDateIso,
      })
    }
    resetForm()
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('epics.toastCreateFail')
  }
}

onMounted(async () => {
  if (!projects.value.length) {
    await projectsStore.fetchProjects()
  }
  const stored = localStorage.getItem(EPICS_PROJECT_KEY)
  const hasStored = stored && projects.value.some((p) => p.id === stored)
  selectedProject.value = hasStored ? (stored as string) : projects.value[0]?.id ?? ''
  if (selectedProject.value) {
    await fetchEpics()
  }
})

watch(
  () => selectedProject.value,
  (val) => {
    if (val) localStorage.setItem(EPICS_PROJECT_KEY, val)
  }
)
</script>
