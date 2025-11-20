import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import PalBooksView from '../views/PalBooksView.vue'
import InProgressBooksView from '../views/InProgressBooksView.vue'
import CompletedBooksView from '../views/CompletedBooksView.vue'
import AbandonedBooksView from '../views/AbandonedBooksView.vue'
import GoalsView from '../views/GoalsView.vue'
import ExplorerView from '../views/ExplorerView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import { supabase } from '../lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/livres',
      name: 'library',
      component: LibraryView,
    },
    {
      path: '/livres/pal',
      name: 'libraryPal',
      component: PalBooksView,
    },
    {
      path: '/livres/en-cours',
      name: 'libraryInProgress',
      component: InProgressBooksView,
    },
    {
      path: '/livres/lus',
      name: 'libraryCompleted',
      component: CompletedBooksView,
    },
    {
      path: '/livres/abandonnes',
      name: 'libraryAbandoned',
      component: AbandonedBooksView,
    },
    {
      path: '/objectifs',
      name: 'goals',
      component: GoalsView,
    },
    {
      path: '/explorer',
      name: 'explorer',
      component: ExplorerView,
    },
    {
      path: '/profil',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/login',
      name: 'loginPage',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: ResetPasswordView,
    },
  ],
  scrollBehavior(_to, _from, _savedPosition) {
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to, _from, next) => {
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = ['login', 'loginPage', 'forgotPassword', 'resetPassword']
  
  if (publicPages.includes(to.name as string)) {
    return next()
  }

  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (!session) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }

  return next()
})

export default router
