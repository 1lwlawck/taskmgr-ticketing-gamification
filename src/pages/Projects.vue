<template>
  <section class="space-y-8">
    <template v-if="pageLoading">
      <PageHeroSkeleton />
      <StatCardsSkeleton />
      <div class="space-y-4">
        <div class="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-center gap-3">
            <Skeleton class="h-10 w-64 rounded-2xl bg-slate-100" />
            <Skeleton class="h-10 w-32 rounded-2xl bg-slate-100" />
            <div class="ml-auto flex gap-2">
              <Skeleton class="h-10 w-20 rounded-2xl bg-slate-100" />
              <Skeleton class="h-10 w-20 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
        <CardGridSkeleton :count="6" />
      </div>
    </template>

    <template v-else>
      <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
        <div class="pointer-events-none absolute -right-24 top-8 h-56 w-56 rounded-full bg-white/15 blur-3xl"></div>
        <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
        <div class="relative flex flex-col gap-4 p-6 sm:gap-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-3 sm:space-y-4">
            <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('projects.heroLabel') }}</p>
            <h1 class="text-2xl font-semibold sm:text-3xl">{{ t('projects.heroTitle') }}</h1>
            <p class="text-sm text-white/80">
              {{ t('projects.heroStats', { live: projects.length, tickets: totalTickets, active: activeProjects }) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <Button variant="secondary" class="border border-white/30 bg-white/15 text-white hover:bg-white/25" @click="showJoin = true">
              {{ t('projects.join') }}
            </Button>
            <Button class="border-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" :disabled="!canCreateProject" @click="showModal = true">
              {{ t('projects.create') }}
            </Button>
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <AppCard :title="t('projects.cards.activeTitle')" :description="t('projects.cards.activeDesc')">
          <p class="text-4xl font-semibold text-foreground">{{ activeProjects }}</p>
          <p class="text-sm text-muted-foreground">{{ Math.round((activeProjects / projects.length || 0) * 100) }}% of total</p>
        </AppCard>
        <AppCard :title="t('projects.cards.backlogTitle')" :description="t('projects.cards.backlogDesc')">
          <p class="text-4xl font-semibold text-foreground">{{ backlogProjects }}</p>
          <p class="text-sm text-muted-foreground">{{ t('projects.cards.backlogDesc') }}</p>
        </AppCard>
        <AppCard :title="t('projects.cards.ticketsTitle')" :description="t('projects.cards.ticketsDesc')">
          <p class="text-4xl font-semibold text-foreground">{{ totalTickets }}</p>
          <p class="text-sm text-muted-foreground">{{ t('projects.cards.ticketsDesc') }}</p>
        </AppCard>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">{{ t('projects.sectionLabel') }}</p>
            <h2 class="text-xl font-semibold text-foreground">{{ t('projects.sectionTitle') }}</h2>
          </div>
          <p class="text-sm text-muted-foreground">{{ t('projects.sectionHint') }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
          <div class="flex flex-1 min-w-[240px] items-center gap-2">
            <SearchInput
              v-model="searchTerm"
              :placeholder="t('projects.searchPlaceholder')"
              class="flex-1"
              @update:model-value="runSearch"
            />
            <Select
              v-model="statusFilter"
              :options="statusFilterOptions"
              class="h-10 min-w-[140px]"
            />
          </div>
          <div class="flex items-center gap-2">
            <Button variant="secondary" size="sm" @click="handleSearch">{{ t('projects.filterApply') }}</Button>
            <Button variant="ghost" size="sm" @click="() => { searchTerm = ''; statusFilter = ''; handleSearch() }">
              {{ t('projects.filterReset') }}
            </Button>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
          <p v-if="projects.length === 0 && !loading" class="text-sm text-muted-foreground">{{ t('projects.empty') }}</p>
        </div>
        <div class="flex justify-center">
          <Pagination
            v-if="!pageLoading && projects.length > 0"
            :page="page"
            :limit="limit"
            :has-next="!!nextCursor"
            :has-prev="page > 1"
            :loading="loadingMore"
            @next="handleNextPage"
            @prev="handlePrevPage"
            @update:limit="handleLimitChange"
          />
        </div>
      </div>

      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-[12000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg">
          <div class="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-sm shadow-2xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">{{ t('projects.modal.createLabel') }}</p>
                <h2 class="text-xl font-semibold text-foreground">{{ t('projects.modal.createTitle') }}</h2>
              </div>
              <button class="text-sm text-muted-foreground" @click="resetModal">{{ t('projects.modal.close') }}</button>
            </div>
            <form class="mt-6 space-y-4" @submit.prevent="handleCreate">
              <label class="block space-y-1">
                <span class="text-xs uppercase text-muted-foreground">{{ t('projects.modal.name') }} <span class="text-rose-500">*</span></span>
                <Input
                  v-model="form.name"
                  required
                  class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm"
                />
                <p v-if="formErrors.name" class="text-[11px] text-rose-600">{{ formErrors.name }}</p>
              </label>
              <label class="block space-y-1">
                <span class="text-xs uppercase text-muted-foreground">{{ t('projects.modal.description') }}</span>
                <textarea
                  v-model="form.description"
                  rows="3"
                class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm"
                ></textarea>
              </label>
              <div class="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" class="text-muted-foreground" @click="resetModal">
                  {{ t('projects.modal.cancel') }}
                </Button>
                <Button type="submit" size="sm">{{ t('projects.modal.submit') }}</Button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showJoin" class="fixed inset-0 z-[12000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg">
          <div class="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-sm shadow-2xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">{{ t('projects.joinModal.label') }}</p>
                <h2 class="text-xl font-semibold text-foreground">{{ t('projects.joinModal.title') }}</h2>
              </div>
              <button class="text-sm text-muted-foreground" @click="closeJoin">{{ t('projects.modal.close') }}</button>
            </div>
            <form class="space-y-3 pt-4" @submit.prevent="handleJoin">
              <label class="block space-y-1">
                <span class="text-xs uppercase text-muted-foreground">{{ t('projects.joinModal.code') }} <span class="text-rose-500">*</span></span>
                <Input v-model.trim="joinCode" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" />
                <p v-if="formErrors.join" class="text-[11px] text-rose-600">{{ formErrors.join }}</p>
              </label>
              <div class="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" class="text-muted-foreground" @click="closeJoin">
                  {{ t('projects.joinModal.cancel') }}
                </Button>
                <Button type="submit" size="sm">{{ t('projects.joinModal.submit') }}</Button>
              </div>
              <p v-if="joinMessage" :class="successJoin ? 'text-emerald-500' : 'text-rose-500'">{{ joinMessage }}</p>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppCard from '@/components/molecules/AppCard.vue'
import ProjectCard from '@/components/molecules/ProjectCard.vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'
import { useGamificationStore } from '@/stores/gamification'
import { useDebounceFn } from '@vueuse/core'
import type { Project } from '@/types/models'
import { PageHeroSkeleton, StatCardsSkeleton, CardGridSkeleton } from '@/components/molecules/skeletons'
import { Skeleton } from '@/components/atoms/ui/skeleton'
import Select from '@/components/ui/select/Select.vue'
import SearchInput from '@/components/ui/search-input/SearchInput.vue'
import Pagination from '@/components/ui/pagination/Pagination.vue'
import { useI18n } from 'vue-i18n'

const projectsStore = useProjectsStore()
const auth = useAuthStore()
const gamification = useGamificationStore()
const { t } = useI18n()
const { projects, loading, loadingMore, nextCursor } = storeToRefs(projectsStore)
const showModal = ref(false)
const showJoin = ref(false)
const joinCode = ref('')
const joinMessage = ref('')
const successJoin = ref(false)
const form = reactive({ name: '', description: '' })
const formErrors = reactive<{ name?: string; join?: string }>({})
const searchTerm = ref('')
const statusFilter = ref('')

// Pagination State
const page = ref(1)
const limit = ref(20)
const cursorStack = ref<Array<string | null>>([null])
const canCreateProject = computed(() =>
  ['admin', 'project_manager'].includes(auth.currentUser?.role ?? '')
)
const pageLoading = computed(() => loading.value && projects.value.length === 0)

const statusFilterOptions = computed(() => [
  { value: '', label: t('projects.statusAll') },
  { value: 'Active', label: t('projects.statusActive') },
  { value: 'Archived', label: t('projects.statusArchived') },
])

const projectTicketCount = (project: Project) => {
  if (typeof project.ticketsCount === 'number') return project.ticketsCount
  const board: Record<string, string[]> = project.board ?? ({} as Record<string, string[]>)
  return Object.values(board).reduce((count, ids) => count + ids.length, 0)
}

const totalTickets = computed(() => projects.value.reduce((sum, project) => sum + projectTicketCount(project), 0))
const isActiveStatus = (status?: string) => (status ?? '').toLowerCase() === 'active'
const activeProjects = computed(() => projects.value.filter((project) => isActiveStatus(project.status)).length)
const backlogProjects = computed(() => projects.value.filter((project) => !isActiveStatus(project.status)).length)

const loadPage = async (cursor: string | null) => {
  await projectsStore.fetchProjects({
    q: searchTerm.value.trim(),
    status: statusFilter.value,
    cursor,
    limit: limit.value,
    append: false, // Replace list
    force: true,
  })
}

const handleNextPage = async () => {
  if (!nextCursor.value) return
  cursorStack.value.push(nextCursor.value)
  page.value++
  await loadPage(nextCursor.value)
}

const handlePrevPage = async () => {
  if (page.value <= 1) return
  page.value--
  const cursor = cursorStack.value[page.value - 1]
  await loadPage(cursor)
  cursorStack.value = cursorStack.value.slice(0, page.value)
}

const handleLimitChange = async (newLimit: number) => {
  limit.value = newLimit
  page.value = 1
  cursorStack.value = [null]
  await loadPage(null)
}

const handleSearch = async () => {
  page.value = 1
  cursorStack.value = [null]
  await loadPage(null)
}

const runSearch = useDebounceFn(() => {
  handleSearch()
}, 300)



const handleCreate = async () => {
  formErrors.name = undefined
  if (!canCreateProject.value) {
    joinMessage.value = t('projects.errors.permission')
    successJoin.value = false
    return
  }
  if (!form.name.trim()) {
    formErrors.name = t('projects.errors.nameRequired')
    return
  }
  try {
    await projectsStore.createProject({
      name: form.name,
      description: form.description,
      members: auth.currentUser
        ? [{ id: auth.currentUser.id, name: auth.currentUser.name, role: auth.currentUser.role }]
        : [],
      createdBy: auth.currentUser?.id,
    })
    resetModal()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadPage(null)
})

const resetModal = () => {
  form.name = ''
  form.description = ''
  showModal.value = false
}

const handleJoin = async () => {
  formErrors.join = undefined
  if (!joinCode.value) {
    formErrors.join = t('projects.errors.inviteRequired')
    successJoin.value = false
    joinMessage.value = ''
    return
  }
  try {
    const project = await projectsStore.joinByCode(joinCode.value, auth.currentUser)
    successJoin.value = true
    joinMessage.value = ''
    joinCode.value = ''
    closeJoin()
    gamification.pushToast({
      title: t('projects.toastJoinedTitle'),
      message: t('projects.toastJoinedMessage', { name: project.name }),
    })
  } catch (error) {
    successJoin.value = false
    joinMessage.value = error instanceof Error ? error.message : t('projects.errors.joinFailed')
  }
}

const closeJoin = () => {
  showJoin.value = false
  joinMessage.value = ''
  joinCode.value = ''
  formErrors.join = undefined
}

const toggleBodyBlur = (state: boolean) => {
  const body = document.body
  if (!body) return
  if (state) body.classList.add('modal-open')
  else body.classList.remove('modal-open')
}

watch(
  () => showModal.value || showJoin.value,
  (open) => toggleBodyBlur(Boolean(open)),
  { immediate: true }
)

onUnmounted(() => toggleBodyBlur(false))
</script>
