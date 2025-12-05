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
import { defaultLocale, i18n, setStoredLocale, supportedLocales, type SupportedLocale, detectLocale } from '@/i18n'

const withLocale = (path: string) => `/:locale(en|id)?${path}`

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: withLocale('/login'),
      name: 'login',
      component: Login,
      meta: { guestOnly: true, title: 'Login' },
    },
    {
      path: withLocale('/register'),
      name: 'register',
      component: Register,
      meta: { guestOnly: true, title: 'Register' },
    },
    {
      path: withLocale(''),
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
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
    { path: '/:pathMatch(.*)*', redirect: () => `/${defaultLocale}/dashboard` },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore(pinia)
  const isLoggedIn = Boolean(auth.currentUser)
  const baseTitle = import.meta.env.VITE_APP_TITLE ?? 'Ticket Ops'
  const localeParam = (to.params.locale as string | undefined)?.toLowerCase() as SupportedLocale | undefined

  const resolvedLocale = supportedLocales.includes(localeParam ?? defaultLocale)
    ? (localeParam as SupportedLocale)
    : detectLocale()

  if (!localeParam || localeParam !== resolvedLocale) {
    return next({
      name: (to.name as string) || 'dashboard',
      params: { ...to.params, locale: resolvedLocale },
      query: to.query,
      hash: to.hash,
    })
  }

  setStoredLocale(resolvedLocale)
  i18n.global.locale.value = resolvedLocale

  if (to.meta?.guestOnly && isLoggedIn) {
    document.title = baseTitle
    return next({ name: 'dashboard', params: { locale: resolvedLocale } })
  }

  if (to.meta?.requiresAuth && !isLoggedIn) {
    document.title = baseTitle
    return next({ name: 'login', params: { locale: resolvedLocale } })
  }

  if (to.meta?.role && auth.currentUser?.role !== to.meta.role) {
    document.title = baseTitle
    return next({ name: 'dashboard', params: { locale: resolvedLocale } })
  }

  const routeTitle = to.meta?.title
  document.title = routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle

  return next()
})

export default router
