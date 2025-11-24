<template>
  <section class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-20 -top-12 h-52 w-52 rounded-full bg-white/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.4em] text-white/60">Epics</p>
          <h1 class="text-3xl font-semibold">Shape the roadmap</h1>
          <p class="text-sm text-white/70">
            {{ epicsByProject.length }} epic{{ epicsByProject.length === 1 ? '' : 's' }} in {{ currentProject?.name ?? '...' }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="selectedProject" class="rounded-2xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner">
            <option :value="project.id" v-for="project in projects" :key="project.id">{{ project.name }}</option>
          </select>
          <button class="rounded-2xl border border-white/30 bg-white/15 px-3 py-2 text-sm text-white hover:bg-white/25" @click="fetchEpics">Refresh</button>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Create epic</p>
              <h2 class="text-lg font-semibold text-foreground">Define a new initiative</h2>
            </div>
            <span class="text-xs text-muted-foreground">{{ currentProject?.name ?? 'Select a project' }}</span>
          </div>
          <p v-if="!canManageEpics" class="text-xs text-rose-600">Hanya admin / project manager yang bisa membuat atau mengedit epics.</p>
          <form class="mt-3 grid gap-3 md:grid-cols-2" @submit.prevent="handleCreate">
            <label class="space-y-1 md:col-span-2">
              <span class="text-xs uppercase text-muted-foreground">Title</span>
              <input v-model="form.title" required class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm" placeholder="Customer onboarding revamp" />
            </label>
            <label class="space-y-1 md:col-span-2">
              <span class="text-xs uppercase text-muted-foreground">Description</span>
              <textarea v-model="form.description" rows="2" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm" placeholder="Goal, scope, definition of done"></textarea>
            </label>
            <label class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">Status</span>
              <select v-model="form.status" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm">
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">Start</span>
              <input type="date" v-model="form.startDate" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm" />
            </label>
            <label class="space-y-1">
              <span class="text-xs uppercase text-muted-foreground">Due</span>
              <input type="date" v-model="form.dueDate" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm" />
            </label>
            <div class="md:col-span-2 flex justify-end gap-2">
              <button type="button" class="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground" @click="resetForm">Clear</button>
              <button
                type="submit"
                class="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow hover:bg-slate-800 disabled:opacity-50"
                :disabled="!canManageEpics || !selectedProject || !form.title.trim()"
              >
                {{ editingId ? 'Save changes' : 'Create' }}
              </button>
            </div>
          </form>
          <p v-if="errorMsg" class="mt-2 text-xs text-rose-600">{{ errorMsg }}</p>
        </div>

        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Epics</p>
              <h2 class="text-lg font-semibold text-foreground">Timeline</h2>
            </div>
            <p class="text-xs text-muted-foreground">{{ epicsByProject.length }} items</p>
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
                  <p class="text-xs text-muted-foreground">{{ epic.description || 'No description' }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-[10px] rounded-full border px-2 py-0.5 uppercase text-muted-foreground">{{ epic.status }}</span>
                  <div v-if="canManageEpics" class="flex gap-1">
                    <button
                      type="button"
                      class="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-slate-400"
                      @click.stop="startEdit(epic)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-rose-300 px-2 py-0.5 text-[10px] text-rose-600 hover:bg-rose-50"
                      @click.stop="confirmDelete(epic.id)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div class="mt-3 h-2 rounded-full bg-slate-200">
                <span class="block h-full rounded-full bg-indigo-500" :style="{ width: progress(epic) + '%' }"></span>
              </div>
              <div class="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Start: {{ dateLabel(epic.startDate) }}</span>
                <span>Due: {{ dateLabel(epic.dueDate) }}</span>
              </div>
              <p class="mt-1 text-xs text-muted-foreground">{{ epic.doneCount ?? 0 }}/{{ epic.totalCount ?? 0 }} done</p>
            </button>
          </div>
          <p v-if="!epicsByProject.length" class="text-sm text-muted-foreground">No epics for this project.</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Summary</p>
          <div class="mt-3 space-y-2 text-sm text-foreground">
            <div class="flex items-center justify-between">
              <span>Total epics</span>
              <span class="font-semibold">{{ epicsByProject.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>In progress</span>
              <span class="font-semibold">{{ epicsByProject.filter((e) => e.status === 'in_progress').length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Done</span>
              <span class="font-semibold">{{ epicsByProject.filter((e) => e.status === 'done').length }}</span>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border bg-card p-5 shadow-card text-sm text-muted-foreground">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tips</p>
          <ul class="mt-2 list-disc space-y-1 pl-4">
            <li>Gunakan backlog untuk menampung ide sebelum masuk sprint.</li>
            <li>Isi due date untuk memunculkan reminder.</li>
            <li>Epic progress dihitung dari tiket anak dengan status done.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  <ConfirmModal
    :open="Boolean(confirmingId)"
    title="Delete epic"
    message="Tickets will be unlinked from this epic. Continue?"
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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'
import { useEpicsStore } from '@/stores/epics'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/helpers'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)
const epicsStore = useEpicsStore()
const { items } = storeToRefs(epicsStore)
const auth = useAuthStore()

const EPICS_PROJECT_KEY = 'ttm_epics_project'

const selectedProject = ref<string>('')
const errorMsg = ref('')
const loading = ref(false)
const editingId = ref<string | null>(null)
const confirmingId = ref<string | null>(null)
const toast = reactive({ open: false, message: '', variant: 'success' as 'success' | 'error' })
const form = reactive({
  title: '',
  description: '',
  status: 'backlog',
  startDate: '',
  dueDate: '',
})

const epicsByProject = computed(() => epicsStore.byProject(selectedProject.value))
const currentProject = computed(() => projects.value.find((p) => p.id === selectedProject.value))
const canManageEpics = computed(() => ['admin', 'project_manager'].includes(auth.currentUser?.role as string))

const progress = (epic: any) => {
  const done = epic.doneCount ?? 0
  const total = epic.totalCount ?? 0
  if (!total) return 0
  return Math.round((done / total) * 100)
}

const dateLabel = (value?: string) => (value ? formatDate(value) : '-')

const goDetail = (id: string) => {
  router.push({ name: 'epic-detail', params: { id } })
}

const startEdit = (epic: any) => {
  editingId.value = epic.id
  form.title = epic.title
  form.description = epic.description ?? ''
  form.status = epic.status ?? 'backlog'
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
  loading.value = true
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
}

const handleCreate = async () => {
  if (!selectedProject.value) {
    errorMsg.value = 'Select a project first.'
    return
  }
  if (!form.title.trim()) {
    errorMsg.value = 'Title is required.'
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
    errorMsg.value = error instanceof Error ? error.message : 'Failed to create epic'
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
