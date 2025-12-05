<template>
  <section v-if="pageLoading" class="space-y-8">
    <PageHeroSkeleton />
    <StatCardsSkeleton />
    <div class="rounded-3xl border border-border bg-card p-4 shadow-card space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <Skeleton class="h-10 w-64 rounded-2xl bg-slate-100" />
        <Skeleton class="h-10 w-28 rounded-2xl bg-slate-100" />
        <div class="ml-auto flex flex-wrap gap-2">
          <Skeleton class="h-8 w-16 rounded-lg bg-slate-100" />
          <Skeleton class="h-8 w-16 rounded-lg bg-slate-100" />
        </div>
      </div>
      <TableSkeleton :columns="6" :rows="5" />
    </div>
    <div class="grid gap-6 lg:grid-cols-2">
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
      <CardGridSkeleton :count="3" columns-class="grid-cols-1" />
    </div>
  </section>

  <section v-else class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-16 -top-10 h-40 w-40 rounded-md bg-white/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-md bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">{{ t('tickets.heroLabel') }}</p>
          <h1 class="text-3xl font-semibold">{{ t('tickets.heroTitle') }}</h1>
          <p class="text-sm text-white/70">
            {{
              t('tickets.heroStats', {
                active: activeTickets,
                urgent: urgentTickets,
                dueSoon: dueSoonCount,
              })
            }}
          </p>
          <div class="flex flex-wrap gap-4 text-sm">
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">{{ t('tickets.completion') }}</p>
              <p class="text-3xl font-semibold">{{ completionRate }}%</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">{{ t('tickets.totalTickets') }}</p>
              <p class="text-3xl font-semibold">{{ totalTickets }}</p>
            </div>
            <div class="min-w-[120px]">
              <p class="text-xs uppercase text-white/60">{{ t('tickets.backlogLoad') }}</p>
              <p class="text-3xl font-semibold">{{ statusCounts.todo ?? 0 }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            class="border-0 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            @click="openCreate"
          >
            {{ t('tickets.newTicket') }}
          </Button>
          <RouterLink :to="localePath('/projects')">
            <Button variant="ghost" class="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              {{ t('tickets.viewProjects') }}
            </Button>
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard :title="t('tickets.cards.backlogTitle')" :description="t('tickets.cards.backlogDesc')">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ statusCounts.backlog ?? 0 }}</p>
          <p class="text-sm text-muted-foreground">{{ percentOfTotal(statusCounts.backlog ?? 0) }}% of total</p>
          <div class="h-2 w-full rounded-md bg-slate-200">
            <span class="block h-full rounded-md bg-slate-900" :style="{ width: percentOfTotal(statusCounts.backlog ?? 0) + '%' }"></span>
          </div>
        </div>
      </AppCard>
      <AppCard :title="t('tickets.cards.inFlightTitle')" :description="t('tickets.cards.inFlightDesc')">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ statusCounts.in_progress ?? 0 }}</p>
          <p class="text-sm text-muted-foreground">{{ percentOfTotal(statusCounts.in_progress ?? 0) }}% of total</p>
          <div class="h-2 w-full rounded-md bg-slate-200">
            <span class="block h-full rounded-md bg-indigo-500" :style="{ width: percentOfTotal(statusCounts.in_progress ?? 0) + '%' }"></span>
          </div>
        </div>
      </AppCard>
      <AppCard :title="t('tickets.cards.doneTitle')" :description="t('tickets.cards.doneDesc')">
        <div class="space-y-3">
          <p class="text-4xl font-semibold text-foreground">{{ statusCounts.done ?? 0 }}</p>
          <p class="text-sm text-muted-foreground">{{ percentOfTotal(statusCounts.done ?? 0) }}% of total</p>
          <div class="h-2 w-full rounded-md bg-slate-200">
            <span class="block h-full rounded-md bg-emerald-500" :style="{ width: percentOfTotal(statusCounts.done ?? 0) + '%' }"></span>
          </div>
        </div>
      </AppCard>
    </div>

  <AppCard :title="t('tickets.queueTitle')" :description="t('tickets.queueDesc')">
      <template #action>
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="searchTerm"
            :placeholder="t('tickets.searchPlaceholder')"
            class="w-64 bg-transparent pl-9"
            @input="runSearch"
          />
        </div>
        <Button
          size="sm"
          class="border-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
          @click="openCreate"
        >
          {{ t('tickets.newTicket') }}
        </Button>
      </div>
    </template>

      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          class="rounded-md border px-3 py-1 text-xs font-medium transition"
          :class="
            statusFilter === option.value
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
              : 'border-border text-muted-foreground hover:border-indigo-200 hover:text-foreground'
          "
          @click="statusFilter = option.value"
        >
          {{ option.label }}
          <span v-if="option.value !== 'all'" class="ml-1 text-[10px]" :class="statusFilter === option.value ? 'text-white/70' : 'text-muted-foreground'">
            {{ statusCounts[option.value] ?? 0 }}
          </span>
        </button>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase text-muted-foreground">{{ t('tickets.filters.assignee') }}</span>
          <select v-model="assigneeFilter" class="rounded-md border px-3 py-1 text-xs font-medium" @change="runSearch">
            <option value="all">{{ t('tickets.filters.all') }}</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
          </select>
          <span class="text-xs uppercase text-muted-foreground">{{ t('tickets.filters.epic') }}</span>
          <select v-model="epicFilter" class="rounded-md border px-3 py-1 text-xs font-medium" @change="runSearch">
            <option value="all">{{ t('tickets.filters.allEpics') }}</option>
            <option v-for="epic in epicsByProject" :key="epic.id" :value="epic.id">
              {{ epic.title }} ({{ epic.doneCount ?? 0 }}/{{ epic.totalCount ?? 0 }})
            </option>
          </select>
          <Button variant="ghost" size="xs" class="text-muted-foreground" @click="resetFilters">
            {{ t('tickets.filters.reset') }}
          </Button>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-border">
        <table class="min-w-full divide-y divide-border text-sm">
          <thead class="bg-muted/60 text-muted-foreground">
            <tr>
              <th class="px-4 py-3 text-left">{{ t('tickets.table.title') }}</th>
              <th class="px-4 py-3 text-left">{{ t('tickets.table.project') }}</th>
              <th class="px-4 py-3 text-left">{{ t('tickets.table.priority') }}</th>
              <th class="px-4 py-3 text-left">{{ t('tickets.table.status') }}</th>
              <th class="px-4 py-3 text-left">{{ t('tickets.table.assignee') }}</th>
              <th class="px-4 py-3 text-right">{{ t('tickets.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-card text-foreground">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="transition hover:bg-muted/40">
              <td class="px-4 py-3">
                <button class="text-left text-sm font-semibold text-foreground underline-offset-2 hover:underline" @click="openDetail(ticket.id)">{{ ticket.title }}</button>
                <p class="text-xs text-muted-foreground">{{ t('tickets.labels.due', { date: dueLabel(ticket) }) }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-foreground">
                {{ projectDisplay(ticket.projectId) }}
              </td>
              <td class="px-4 py-3">
                <span :class="priorityPillClass(ticket.priority)" class="inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize">
                  {{ ticket.priority }}
                </span>
              </td>
              <td class="px-4 py-3 capitalize text-foreground">{{ formatStatus(ticket.status) }}</td>
              <td class="px-4 py-3 text-foreground">{{ assigneeLabel(ticket) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <Button size="xs" variant="ghost" class="text-slate-600" @click="openDetail(ticket.id)">{{ t('tickets.table.view') }}</Button>
                    <Button
                      v-if="canManageTicket(ticket)"
                      size="xs"
                      variant="outline"
                      class="text-slate-700"
                      @click="editTicket(ticket)"
                    >
                      {{ t('tickets.table.edit') }}
                    </Button>
                    <Button
                      v-if="canManageTicket(ticket)"
                      size="xs"
                      variant="destructive"
                      @click="promptDelete(ticket)"
                    >
                      {{ t('tickets.table.delete') }}
                    </Button>
                  </div>
                </td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredTickets.length === 0" class="px-4 py-6 text-center text-sm text-muted-foreground">
          {{ t('tickets.table.empty') }}
        </p>
        <div class="flex justify-center bg-card p-3">
          <Button v-if="nextCursor" :disabled="loadingMore" variant="outline" size="sm" @click="loadMore">
            {{ loadingMore ? t('common.loading') : t('common.loadMore') }}
          </Button>
        </div>
      </div>
    </AppCard>

    <div class="grid gap-6 lg:grid-cols-2">
      <AppCard :title="t('tickets.backlog.title')" :description="t('tickets.backlog.desc')">
        <div v-if="backlogTickets.length" class="space-y-3">
          <div v-for="ticket in backlogTickets" :key="ticket.id" class="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-foreground">{{ ticket.title }}</p>
                <p class="text-xs text-muted-foreground">{{ projectDisplay(ticket.projectId) }} / {{ assigneeLabel(ticket) }}</p>
              </div>
              <span :class="priorityPillClass(ticket.priority)" class="inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize">
                {{ ticket.priority }}
              </span>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('tickets.labels.due', { date: dueLabel(ticket) }) }}</p>
            <div class="mt-2 flex gap-2">
              <Button size="xs" variant="ghost" @click="openDetail(ticket.id)">{{ t('tickets.table.view') }}</Button>
              <Button size="xs" variant="outline" v-if="canManageTicket(ticket)" @click="editTicket(ticket)">{{ t('tickets.table.edit') }}</Button>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">{{ t('tickets.backlog.empty') }}</p>
      </AppCard>

      <AppCard :title="t('tickets.epics.title')" :description="t('tickets.epics.desc')">
        <div class="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <div class="flex items-center gap-2">
            <span>{{ t('tickets.epics.title') }}</span>
            <select v-model="epicProjectFilter" class="rounded-md border px-2 py-1 text-xs font-semibold">
              <option value="all">{{ t('tickets.epics.allProjects') }}</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
          </div>
          <RouterLink :to="localePath('/epics')" class="text-primary underline">{{ t('tickets.epics.manage') }}</RouterLink>
        </div>
        <div v-if="epicsByProject.length" class="space-y-2">
          <div v-for="epic in epicsByProject" :key="epic.id" class="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-foreground">{{ epic.title }}</p>
                <p class="text-xs text-muted-foreground">{{ epic.description || t('tickets.epics.noDescription') }}</p>
              </div>
              <span class="text-xs rounded-md border px-2 py-0.5 capitalize text-muted-foreground">{{ epic.status }}</span>
            </div>
            <div class="mt-2 h-2 rounded-md bg-slate-200">
              <span
                class="block h-full rounded-md bg-indigo-500"
                :style="{ width: epicProgress(epic).percent + '%' }"
              ></span>
            </div>
            <p class="mt-1 text-xs text-muted-foreground">{{ epicProgressText(epic) }} done</p>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">{{ t('tickets.epics.none') }}</p>
      </AppCard>

      <AppCard :title="t('tickets.radar.title')" :description="t('tickets.radar.desc')">
        <ul v-if="upcomingTickets.length" class="space-y-4">
          <li v-for="ticket in upcomingTickets" :key="ticket.id" class="flex items-start justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-foreground">{{ ticket.title }}</p>
              <p class="text-xs text-muted-foreground">{{ ticket.projectId }} / {{ assigneeLabel(ticket) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground">{{ dueLabel(ticket) }}</p>
              <span :class="priorityPillClass(ticket.priority)" class="inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize">
                {{ ticket.priority }}
              </span>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">{{ t('tickets.radar.empty') }}</p>
      </AppCard>

      <AppCard :title="t('tickets.statusMix.title')" :description="t('tickets.statusMix.desc')">
        <div class="space-y-4">
          <div v-for="option in statusBreakdownOptions" :key="option.value" class="space-y-1">
            <div class="flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span>{{ option.label }}</span>
              <span>{{ statusCounts[option.value] ?? 0 }}</span>
            </div>
            <div class="h-2 w-full rounded-md bg-slate-200">
              <span
                class="block h-full rounded-md bg-slate-900"
                :style="{ width: percentOfTotal(statusCounts[option.value] ?? 0) + '%' }"
              ></span>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[12000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg">
        <div class="w-full max-w-xl rounded-3xl border border-border bg-card p-6 text-sm text-slate-600 shadow-2xl">
        <h2 class="text-xl font-semibold text-slate-900">{{ editing ? t('tickets.modal.editTitle') : t('tickets.modal.newTitle') }}</h2>
        <form class="mt-4 grid gap-4 sm:grid-cols-2" @submit.prevent="handleSubmit">
          <label class="space-y-1 sm:col-span-2">
            <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.title') }} <span class="text-rose-500">*</span></span>
            <input v-model="form.title" required class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm" />
            <p v-if="formErrors.title" class="text-[11px] text-rose-600">{{ formErrors.title }}</p>
          </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.description') }} <span class="text-rose-500">*</span></span>
          <textarea v-model="form.description" rows="3" required class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm"></textarea>
          <p v-if="formErrors.description" class="text-[11px] text-rose-600">{{ formErrors.description }}</p>
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.project') }} <span class="text-rose-500">*</span></span>
          <select v-model="form.projectId" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm">
            <option value="" disabled>{{ t('tickets.modal.project') }}</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
          </select>
          <p v-if="formErrors.project" class="text-[11px] text-rose-600">{{ formErrors.project }}</p>
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.priority') }} <span class="text-rose-500">*</span></span>
          <select v-model="form.priority" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.type') }} <span class="text-rose-500">*</span></span>
          <select v-model="form.type" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm">
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="chore">Chore</option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.assignee') }}</span>
          <select v-model="form.assigneeId" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm">
            <option :value="user.id" v-for="user in assigneeOptions" :key="user.id">{{ user.name }}</option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.epic') }}</span>
          <select v-model="form.epicId" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm">
            <option :value="undefined">{{ t('tickets.filters.all') }}</option>
            <option v-for="epic in epicsByProject" :key="epic.id" :value="epic.id">
              {{ epic.title }} ({{ epic.doneCount ?? 0 }}/{{ epic.totalCount ?? 0 }})
            </option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.startDate') }}</span>
          <input type="date" v-model="form.startDate" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm" />
        </label>
        <label class="space-y-1">
          <span class="text-xs uppercase text-slate-500">{{ t('tickets.modal.dueDate') }}</span>
          <input type="date" v-model="form.dueDate" class="w-full rounded-xl border border-border bg-white px-3 py-2 text-slate-900 shadow-sm" />
        </label>
          <div class="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="closeModal">{{ t('tickets.modal.cancel') }}</Button>
            <Button type="submit">{{ t('tickets.modal.save') }}</Button>
          </div>
        </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal :open="Boolean(confirming)" :title="t('tickets.confirmDeleteTitle')" :message="t('tickets.confirmDeleteMsg')" @cancel="confirming = null" @confirm="deleteTicket" />
    <div v-if="toast.open" class="fixed bottom-6 right-6 z-50">
      <div
        class="rounded-2xl px-4 py-3 text-sm shadow-lg transition"
        :class="toast.variant === 'error' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'"
      >
        {{ toast.message }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import AppCard from '@/components/molecules/AppCard.vue'
import { Button } from '@/components/atoms/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/atoms/ui/input'
import { Search } from 'lucide-vue-next'
import { PageHeroSkeleton, StatCardsSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/molecules/skeletons'
import { useTicketsStore } from '@/stores/tickets'
import { useUsersStore } from '@/stores/users'
import { useEpicsStore } from '@/stores/epics'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { useDebounceFn } from '@vueuse/core'
import { formatDate } from '@/utils/helpers'
import type { CreateTicketPayload, Ticket } from '@/types/models'
import type { TicketPriority, TicketType } from '@/utils/constants'
import { Skeleton } from '@/components/atoms/ui/skeleton'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const localeParam = computed(() => route.params.locale as string | undefined)
const localePath = (path = '') => (localeParam.value ? `/${localeParam.value}${path}` : path)
const ticketsStore = useTicketsStore()
const { tickets, loading: ticketsLoading, loadingMore, nextCursor } = storeToRefs(ticketsStore)
const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
const epicsStore = useEpicsStore()
const { items: epics } = storeToRefs(epicsStore)
const epicProjectFilter = ref<'all' | string>('all')
const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)
const auth = useAuthStore()

const showModal = ref(false)
const editing = ref(false)
const editingId = ref(null)
const confirming = ref(null)
const toast = reactive({ open: false, variant: 'success', message: '' })
const statusFilter = ref('all')
const epicFilter = ref('all')
const searchTerm = ref<string>((route.query.q as string) ?? '')
const assigneeFilter = ref<'all' | string>('all')
const statusOptions = computed(() => [
  { label: t('tickets.filters.all'), value: 'all' },
  { label: t('tickets.filters.backlog'), value: 'backlog' },
  { label: t('tickets.filters.todo'), value: 'todo' },
  { label: t('tickets.filters.inProgress'), value: 'in_progress' },
  { label: t('tickets.filters.review'), value: 'review' },
  { label: t('tickets.filters.done'), value: 'done' },
])
const statusBreakdownOptions = computed(() => statusOptions.value.filter((option) => option.value !== 'all'))
const pageLoading = computed(() => ticketsLoading.value && tickets.value.length === 0)
const defaultProjectId = () => projects.value[0]?.id ?? ''
type TicketFormState = {
  title: string
  description: string
  priority: TicketPriority
  type: TicketType
  epicId?: string
  assigneeId?: string
  startDate: string
  dueDate: string
  projectId: string
}

const form = reactive<TicketFormState>({
  title: '',
  description: '',
  priority: 'medium',
  type: 'feature',
  epicId: undefined,
  assigneeId: users.value[0]?.id,
  startDate: '',
  dueDate: '',
  projectId: defaultProjectId(),
})
const formErrors = reactive<{ title?: string; project?: string; description?: string }>({})

watch(
  () => route.query.q,
  (val) => {
    searchTerm.value = (val as string) ?? ''
  }
)

watch(
  () => form.projectId,
  async (val) => {
    if (val) {
      // pastikan detail project (beserta members) ter-load supaya assignee list terisi
      await projectsStore.fetchProject(val)
      await epicsStore.fetchByProject(val)
      form.epicId = undefined
      const firstAssignee = assigneeOptions.value[0]
      form.assigneeId = firstAssignee?.id
    }
  },
  { immediate: true }
)
watch(
  () => projects.value.length,
  (len) => {
    if (len && !form.projectId) {
      form.projectId = projects.value[0].id
    }
  }
)
const projectNameById = computed(() =>
  projects.value.reduce((acc, project) => {
    acc[project.id] = project.name
    return acc
  }, {})
)

const selectedProject = computed(() => projects.value.find((p) => p.id === form.projectId))
const projectMembers = computed(() => selectedProject.value?.members ?? [])
const assigneeOptions = computed(() => {
  if (!projectMembers.value.length) return []
  const ids = new Set(projectMembers.value.map((m) => m.id))
  return users.value.filter((u) => ids.has(u.id))
})

const ticketProjectIds = computed(() => new Set(tickets.value.map((t) => t.projectId).filter(Boolean)))
const epicsForForm = computed(() => epicsStore.byProject(form.projectId))
const epicsForDisplay = computed(() =>
  epics.value.filter((e) => epicProjectFilter.value === 'all' || e.projectId === epicProjectFilter.value)
)
// Derive live epic progress from current tickets to keep bar accurate after moves
const epicStats = computed<Record<string, { done: number; total: number }>>(() => {
  const stats: Record<string, { done: number; total: number }> = {}
  tickets.value.forEach((t) => {
    if (!t.epicId) return
    const entry = stats[t.epicId] || { done: 0, total: 0 }
    entry.total += 1
    if (t.status === 'done') entry.done += 1
    stats[t.epicId] = entry
  })
  return stats
})
const epicProgress = (epic: any) => {
  const stat = epicStats.value[epic.id]
  const done = stat?.done ?? epic.doneCount ?? 0
  const total = stat?.total ?? epic.totalCount ?? 0
  const percent = total ? Math.round((done / total) * 100) : 0
  return { done, total, percent }
}
const epicProgressText = (epic) => {
  const { done, total } = epicProgress(epic)
  return `${done}/${total || 0}`
}

// For backward template references; display epics are decoupled from the create form project selection
const epicsByProject = epicsForDisplay

const statusCounts = computed(() => {
  const base: Record<string, number> = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 }
  tickets.value.forEach((ticket) => {
    const key = ticket.status ?? 'todo'
    base[key] = (base[key] ?? 0) + 1
  })
  return base
})

const totalTickets = computed(() => tickets.value.length)
const activeTickets = computed(() => tickets.value.filter((ticket) => ticket.status !== 'done').length)
const urgentTickets = computed(() =>
  tickets.value.filter((ticket) => ['high', 'urgent'].includes(ticket.priority)).length
)
const dueSoonCount = computed(() =>
  tickets.value.filter((ticket) => {
    if (!ticket.dueDate) return false
    const due = new Date(ticket.dueDate)
    if (Number.isNaN(due.getTime())) return false
    const diff = (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return ticket.status !== 'done' && diff >= 0 && diff <= 5
  }).length
)
const completionRate = computed(() => {
  if (!totalTickets.value) return 0
  return Math.round(((statusCounts.value.done ?? 0) / totalTickets.value) * 100)
})

const percentOfTotal = (value) => {
  if (!totalTickets.value) return 0
  return Math.round((value / totalTickets.value) * 100)
}

const assigneeLabel = (ticket) => {
  if (ticket.assigneeName) return ticket.assigneeName
  if (!ticket.assigneeId) return t('tickets.labels.unassigned')
  const assignee = users.value.find((user) => user.id === ticket.assigneeId)
  return assignee?.name ?? t('tickets.labels.unassigned')
}

const filteredTickets = computed(() => {
  const queryValue = searchTerm.value.trim().toLowerCase()
  return tickets.value
    .filter((ticket) => {
      if (statusFilter.value === 'all') return true
      return ticket.status === statusFilter.value
    })
    .filter((ticket) => {
      if (epicFilter.value === 'all') return true
      return ticket.epicId === epicFilter.value
    })
    .filter((ticket) => {
      if (assigneeFilter.value === 'all') return true
      return (ticket.assigneeId ?? '') === assigneeFilter.value
    })
    .filter((ticket) => {
      if (!queryValue) return true
      const projectName = (projectNameById.value[ticket.projectId] ?? '').toLowerCase()
      return (
        ticket.title.toLowerCase().includes(queryValue) ||
        assigneeLabel(ticket).toLowerCase().includes(queryValue) ||
        (ticket.projectId ?? '').toLowerCase().includes(queryValue) ||
        projectName.includes(queryValue)
      )
    })
})

const upcomingTickets = computed(() =>
  tickets.value
    .filter((ticket) => ticket.dueDate && ticket.status !== 'done')
    .map((ticket) => ({ ticket, due: new Date(ticket.dueDate) }))
    .filter(({ due }) => !Number.isNaN(due.getTime()))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 4)
    .map((item) => item.ticket)
)

const backlogTickets = computed(() =>
  tickets.value
    .filter((ticket) => ticket.status === 'backlog')
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
)

const runSearch = useDebounceFn(async () => {
  await ticketsStore.fetchTicketsWithFilters({
    projectId: epicProjectFilter.value,
    assigneeId: assigneeFilter.value === 'all' ? '' : assigneeFilter.value,
    status: statusFilter.value === 'all' ? '' : statusFilter.value,
    epicId: epicFilter.value === 'all' ? '' : epicFilter.value,
    q: searchTerm.value,
    force: true,
  })
}, 300)

const resetFilters = async () => {
  statusFilter.value = 'all'
  epicFilter.value = 'all'
  assigneeFilter.value = 'all'
  searchTerm.value = ''
  epicProjectFilter.value = 'all'
  await runSearch()
}

const loadMore = async () => {
  if (!nextCursor.value) return
  await ticketsStore.fetchTicketsWithFilters({
    projectId: epicProjectFilter.value,
    assigneeId: assigneeFilter.value === 'all' ? '' : assigneeFilter.value,
    status: statusFilter.value === 'all' ? '' : statusFilter.value,
    epicId: epicFilter.value === 'all' ? '' : epicFilter.value,
    q: searchTerm.value,
    append: true,
    force: true,
  })
}

const formatStatus = (status) => status?.replace('_', ' ') ?? '-'
const projectDisplay = (projectId) => projectNameById.value[projectId] ?? t('tickets.labels.unassigned')
const priorityPillClass = (priority = 'medium') => {
  const map = {
    urgent: 'border-rose-400 bg-rose-50 text-rose-700',
    high: 'border-amber-400 bg-amber-50 text-amber-700',
    medium: 'border-sky-400 bg-sky-50 text-sky-700',
    low: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  }
  return map[priority] ?? 'border-slate-200 bg-slate-50 text-slate-600'
}
const dueLabel = (ticket) => (ticket.dueDate ? formatDate(ticket.dueDate) : t('tickets.labels.unscheduled'))

const canManageTicket = (ticket: Ticket) => {
  const user = auth.currentUser
  if (!user) return false
  const elevatedRoles = ['admin', 'project_manager']
  if (elevatedRoles.includes(user.role as string)) {
    return true
  }
  if (ticket.assigneeId && ticket.assigneeId === user.id) {
    return true
  }
  if (ticket.reporterId && ticket.reporterId === user.id) {
    return true
  }
  return false
}

const openDetail = (id) => router.push(localePath(`/tickets/${id}`))

const openCreate = () => {
  editing.value = false
  editingId.value = null
  Object.assign(form, {
    title: '',
    description: '',
    priority: 'medium' as TicketPriority,
    type: 'feature' as TicketType,
    epicId: undefined,
    assigneeId: users.value[0]?.id,
    startDate: '',
    dueDate: '',
    projectId: defaultProjectId(),
  })
  showModal.value = true
}

const editTicket = (ticket: Ticket) => {
  if (!canManageTicket(ticket)) {
    showToast(t('tickets.toast.noPermissionEdit'), 'error')
    return
  }
  editing.value = true
  editingId.value = ticket.id
  Object.assign(form, {
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    type: ticket.type,
    epicId: ticket.epicId,
    assigneeId: ticket.assigneeId,
    startDate: ticket.startDate ? ticket.startDate.slice(0, 10) : '',
    dueDate: ticket.dueDate ? ticket.dueDate.slice(0, 10) : '',
    projectId: ticket.projectId,
  })
  showModal.value = true
}

const handleSubmit = async () => {
  formErrors.title = undefined
  formErrors.project = undefined
  formErrors.description = undefined
  if (!form.title.trim()) {
    formErrors.title = t('tickets.toast.errors.titleRequired')
    return
  }
  if (!form.projectId) {
    formErrors.project = t('tickets.toast.errors.projectRequired')
    return
  }
  if (!form.description.trim()) {
    formErrors.description = t('tickets.toast.errors.descriptionRequired')
    return
  }

  const startDateIso = form.startDate ? `${form.startDate}T00:00:00Z` : undefined
  const dueDateIso = form.dueDate ? `${form.dueDate}T00:00:00Z` : undefined

  try {
    if (editing.value && editingId.value) {
      const updatePayload: Partial<Ticket> & { clearStartDate?: boolean; clearDueDate?: boolean } = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        type: form.type,
        assigneeId: form.assigneeId,
        epicId: form.epicId ?? '',
        startDate: startDateIso,
        dueDate: dueDateIso,
        projectId: form.projectId,
      }
      if (!form.startDate) updatePayload.clearStartDate = true
      if (!form.dueDate) updatePayload.clearDueDate = true
      await ticketsStore.updateTicket(editingId.value, updatePayload)
      showToast(t('tickets.toast.updated'))
    } else {
      const payload: CreateTicketPayload = {
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        type: form.type,
        epicId: form.epicId,
        assigneeId: form.assigneeId,
        startDate: startDateIso,
        dueDate: dueDateIso,
        createdBy: auth.currentUser?.id ?? '',
      }
      if (!payload.createdBy) {
        showToast(t('tickets.toast.needLogin'), 'error')
        return
      }
      await ticketsStore.createTicket(payload)
      showToast(t('tickets.toast.created'))
    }
    closeModal()
  } catch (error) {
    showToast(error instanceof Error ? error.message : t('common.error'), 'error')
  }
}

const closeModal = () => {
  showModal.value = false
  formErrors.title = undefined
  formErrors.project = undefined
  formErrors.description = undefined
}

const promptDelete = (ticket: Ticket) => {
  if (!canManageTicket(ticket)) {
    showToast(t('tickets.toast.noPermissionDelete'), 'error')
    return
  }
  confirming.value = ticket
}

const deleteTicket = async () => {
  if (!confirming.value) return
    try {
      await ticketsStore.deleteTicket(confirming.value.id)
      showToast(t('tickets.toast.deleted'))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('common.error'), 'error')
    } finally {
      confirming.value = null
    }
  }

const showToast = (message: string, variant = 'success') => {
  toast.message = message
  toast.variant = variant
  toast.open = true
  setTimeout(() => (toast.open = false), 2500)
}

onMounted(async () => {
  if (!projects.value.length) await projectsStore.fetchProjects()
  if (!users.value.length) await usersStore.fetchUsers()
  await ticketsStore.fetchTicketsWithFilters({
    projectId: epicProjectFilter.value,
    assigneeId: assigneeFilter.value === 'all' ? '' : assigneeFilter.value,
    status: statusFilter.value === 'all' ? '' : statusFilter.value,
    epicId: epicFilter.value === 'all' ? '' : epicFilter.value,
    q: searchTerm.value,
    force: true,
  })
  if (form.projectId) {
    await epicsStore.fetchByProject(form.projectId)
  }
  // preload epics for all projects so tracks can show everything
  if (projects.value.length) {
    const tasks = projects.value.map((p) => epicsStore.fetchByProject(p.id))
    await Promise.allSettled(tasks)
  }
})

const toggleBodyBlur = (state: boolean) => {
  const body = document.body
  if (!body) return
  if (state) body.classList.add('modal-open')
  else body.classList.remove('modal-open')
}

watch(
  () => showModal.value,
  (open) => toggleBodyBlur(Boolean(open)),
  { immediate: true }
)

onUnmounted(() => toggleBodyBlur(false))
</script>
