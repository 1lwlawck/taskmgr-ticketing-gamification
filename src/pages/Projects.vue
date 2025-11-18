<template>
  <section class="space-y-8">
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white shadow-2xl">
      <div class="pointer-events-none absolute -right-24 top-8 h-56 w-56 rounded-full bg-white/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.4em] text-white/70">Squad initiatives</p>
          <h1 class="text-3xl font-semibold">Projects</h1>
          <p class="text-sm text-white/80">
            {{ projects.length }} live programs / {{ totalTickets }} tracked tickets / {{ activeProjects }} active this week
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button variant="secondary" class="border border-white/30 bg-white/15 text-white hover:bg-white/25" @click="showJoin = true">
            Join project
          </Button>
          <Button class="bg-white text-slate-900" @click="showModal = true">Create project</Button>
        </div>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <AppCard title="Active" description="Projects currently moving">
        <p class="text-4xl font-semibold text-foreground">{{ activeProjects }}</p>
        <p class="text-sm text-muted-foreground">{{ Math.round((activeProjects / projects.length || 0) * 100) }}% of total</p>
      </AppCard>
      <AppCard title="Backlog" description="On hold or planning">
        <p class="text-4xl font-semibold text-foreground">{{ backlogProjects }}</p>
        <p class="text-sm text-muted-foreground">Awaiting kickoff.</p>
      </AppCard>
      <AppCard title="Tickets" description="Total tickets attached to projects">
        <p class="text-4xl font-semibold text-foreground">{{ totalTickets }}</p>
        <p class="text-sm text-muted-foreground">Across every board.</p>
      </AppCard>
    </div>

    <div class="space-y-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Portfolio</p>
          <h2 class="text-xl font-semibold text-foreground">All projects</h2>
        </div>
        <p class="text-sm text-muted-foreground">Tap open to jump into the board.</p>
      </div>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" @open="openProject" />
        <p v-if="projects.length === 0" class="text-sm text-muted-foreground">No projects yet. Create one to get started.</p>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div class="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-sm shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Create</p>
            <h2 class="text-xl font-semibold text-foreground">New project</h2>
          </div>
          <button class="text-sm text-muted-foreground" @click="resetModal">Close</button>
        </div>
        <form class="mt-6 space-y-4" @submit.prevent="handleCreate">
          <label class="block space-y-1">
            <span class="text-xs uppercase text-muted-foreground">Name</span>
            <Input
              v-model="form.name"
              required
              class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm"
            />
          </label>
          <label class="block space-y-1">
            <span class="text-xs uppercase text-muted-foreground">Description</span>
            <textarea
              v-model="form.description"
              rows="3"
            class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm"
            ></textarea>
          </label>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" class="text-muted-foreground" @click="resetModal">Cancel</Button>
            <Button type="submit" size="sm">Create</Button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showJoin" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div class="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-sm shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Join</p>
            <h2 class="text-xl font-semibold text-foreground">Invite code</h2>
          </div>
          <button class="text-sm text-muted-foreground" @click="closeJoin">Close</button>
        </div>
        <form class="space-y-3 pt-4" @submit.prevent="handleJoin">
          <label class="block space-y-1">
            <span class="text-xs uppercase text-muted-foreground">Invite code</span>
            <Input v-model.trim="joinCode" class="w-full rounded-2xl border border-border bg-white px-3 py-2 text-foreground shadow-sm" />
          </label>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" class="text-muted-foreground" @click="closeJoin">Cancel</Button>
            <Button type="submit" size="sm">Join</Button>
          </div>
          <p v-if="joinMessage" :class="successJoin ? 'text-emerald-500' : 'text-rose-500'">{{ joinMessage }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppCard from '@/components/molecules/AppCard.vue'
import ProjectCard from '@/components/molecules/ProjectCard.vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { Input } from '@/components/atoms/ui/input'
import { Button } from '@/components/atoms/ui/button'

const router = useRouter()
const projectsStore = useProjectsStore()
const auth = useAuthStore()
const { projects } = storeToRefs(projectsStore)
const showModal = ref(false)
const showJoin = ref(false)
const joinCode = ref('')
const joinMessage = ref('')
const successJoin = ref(false)
const form = reactive({ name: '', description: '' })

const totalTickets = computed(() => projects.value.reduce((sum, project) => sum + (project.tickets?.length ?? 0), 0))
const activeProjects = computed(() => projects.value.filter((project) => project.status === 'active').length)
const backlogProjects = computed(() => projects.value.filter((project) => project.status !== 'active').length)

const openProject = (id) => router.push(/projects/)

const handleCreate = () => {
  projectsStore.createProject({
    name: form.name,
    description: form.description,
    members: auth.currentUser ? [{ id: auth.currentUser.id, name: auth.currentUser.name, role: auth.currentUser.role }] : [],
    createdBy: auth.currentUser?.id,
  })
  resetModal()
}

const resetModal = () => {
  form.name = ''
  form.description = ''
  showModal.value = false
}

const handleJoin = () => {
  if (!joinCode.value) {
    successJoin.value = false
    joinMessage.value = 'Enter a code first'
    return
  }
  try {
    const project = projectsStore.joinByCode(joinCode.value, auth.currentUser)
    successJoin.value = true
    joinMessage.value = Joined 
    joinCode.value = ''
  } catch (error) {
    successJoin.value = false
    joinMessage.value = error.message
  }
}

const closeJoin = () => {
  showJoin.value = false
  joinMessage.value = ''
  joinCode.value = ''
}
</script>
