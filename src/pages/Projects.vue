<template>
  <section class="space-y-4 dark:text-slate-100">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Projects</h1>
        <p class="text-sm text-slate-500">Plan sprints, manage invites, and track activity.</p>
      </div>
      <div class="flex gap-3">
        <button class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100" @click="showJoin = true">
          Join Project
        </button>
        <button class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm" @click="showModal = true">
          Create Project
        </button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" @open="openProject" />
    </div>

    <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur">
      <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">New project</h2>
        <form class="mt-4 space-y-4" @submit.prevent="handleCreate">
          <label class="block">
            <span class="text-xs uppercase text-slate-500">Name</span>
            <input
              v-model="form.name"
              required
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label class="block">
            <span class="text-xs uppercase text-slate-500">Description</span>
            <textarea
              v-model="form.description"
              rows="3"
            class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            ></textarea>
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-md px-4 py-2 text-slate-400" @click="resetModal">Cancel</button>
            <button type="submit" class="rounded-md bg-slate-900 px-4 py-2 text-white">Create</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showJoin" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Join via invite code</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Enter the code provided by a project owner.</p>
        <form class="space-y-3 pt-4" @submit.prevent="handleJoin">
          <label class="block">
            <span class="text-xs uppercase text-slate-500 dark:text-slate-400">Invite code</span>
            <input v-model.trim="joinCode" class="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="rounded-md px-4 py-2 text-slate-600 hover:text-slate-900" @click="closeJoin">Cancel</button>
            <button type="submit" class="rounded-md bg-slate-900 px-4 py-2 text-white">Join</button>
          </div>
          <p v-if="joinMessage" :class="successJoin ? 'text-green-500' : 'text-red-500'">{{ joinMessage }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProjectCard from '@/components/ProjectCard.vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'

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

const openProject = (id) => router.push(`/projects/${id}`)

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
    joinMessage.value = `Joined ${project.name}`
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
