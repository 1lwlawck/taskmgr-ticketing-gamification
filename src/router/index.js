import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Projects from '@/pages/Projects.vue'
import ProjectDetail from '@/pages/ProjectDetail.vue'
import Tickets from '@/pages/Tickets.vue'
import TicketDetail from '@/pages/TicketDetail.vue'
import Leaderboard from '@/pages/Leaderboard.vue'
import AdminUsers from '@/pages/AdminUsers.vue'
import Profile from '@/pages/Profile.vue'
import JoinByCode from '@/pages/JoinByCode.vue'

import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'projects', name: 'projects', component: Projects },
        { path: 'projects/:id', name: 'project-detail', component: ProjectDetail, props: true },
        { path: 'tickets', name: 'tickets', component: Tickets },
        { path: 'tickets/:id', name: 'ticket-detail', component: TicketDetail, props: true },
        { path: 'leaderboard', name: 'leaderboard', component: Leaderboard },
        { path: 'admin/users', name: 'admin-users', component: AdminUsers, meta: { role: 'admin' } },
        { path: 'profile', name: 'profile', component: Profile },
        { path: 'join', name: 'join', component: JoinByCode },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore(pinia)
  const isLoggedIn = Boolean(auth.currentUser)

  if (to.meta?.guestOnly && isLoggedIn) {
    return next('/dashboard')
  }

  if (to.meta?.requiresAuth && !isLoggedIn) {
    return next('/login')
  }

  if (to.meta?.role && auth.currentUser?.role !== to.meta.role) {
    return next('/dashboard')
  }

  return next()
})

export default router
