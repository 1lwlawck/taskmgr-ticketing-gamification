import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/templates/MainLayout.vue'
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
      meta: { guestOnly: true, title: 'Login' },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true, title: 'Register' },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: Dashboard, meta: { title: 'Dashboard' } },
        { path: 'projects', name: 'projects', component: Projects, meta: { title: 'Projects' } },
        {
          path: 'projects/:id',
          name: 'project-detail',
          component: ProjectDetail,
          props: true,
          meta: { title: 'Project Detail' },
        },
        { path: 'tickets', name: 'tickets', component: Tickets, meta: { title: 'Tickets' } },
        {
          path: 'tickets/:id',
          name: 'ticket-detail',
          component: TicketDetail,
          props: true,
          meta: { title: 'Ticket Detail' },
        },
        { path: 'leaderboard', name: 'leaderboard', component: Leaderboard, meta: { title: 'Leaderboard' } },
        { path: 'epics', name: 'epics', component: () => import('@/pages/Epics.vue'), meta: { title: 'Epics' } },
        {
          path: 'epics/:id',
          name: 'epic-detail',
          component: () => import('@/pages/EpicDetail.vue'),
          props: true,
          meta: { title: 'Epic Detail' },
        },
        {
          path: 'admin/users',
          name: 'admin-users',
          component: AdminUsers,
          meta: { role: 'admin', title: 'Admin Users' },
        },
        { path: 'profile', name: 'profile', component: Profile, meta: { title: 'Profile' } },
        { path: 'join', name: 'join', component: JoinByCode, meta: { title: 'Join Project' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore(pinia)
  const isLoggedIn = Boolean(auth.currentUser)
  const baseTitle = import.meta.env.VITE_APP_TITLE ?? 'Ticket Ops'

  if (to.meta?.guestOnly && isLoggedIn) {
    document.title = baseTitle
    return next('/dashboard')
  }

  if (to.meta?.requiresAuth && !isLoggedIn) {
    document.title = baseTitle
    return next('/login')
  }

  if (to.meta?.role && auth.currentUser?.role !== to.meta.role) {
    document.title = baseTitle
    return next('/dashboard')
  }

  const routeTitle = to.meta?.title
  document.title = routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle

  return next()
})

export default router
